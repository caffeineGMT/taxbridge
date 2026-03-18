import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

const DB_PATH = path.join(process.cwd(), 'data', 'taxbridge.db');

interface RSUEntry {
  year: number;
  vestingDate: string;
  fmvUSD: number;
  shares: number;
  employer: string;
}

interface TaxAdviceRequest {
  rsuEntries: RSUEntry[];
  province: string;
  state: string;
  ftcResults: {
    usTaxUSD: number;
    canadaTaxCAD: number;
    ftcCAD: number;
  };
  filingStatus: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const transaction = Sentry.startTransaction({
    name: 'POST /api/ai/tax-advice',
    op: 'http.server',
    tags: { route: '/api/ai/tax-advice', level: 'high' },
  });

  Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction));

  try {
    const body: TaxAdviceRequest = await request.json();
    const { rsuEntries, province, state, ftcResults, filingStatus } = body;

    logger.info('AI tax advice requested', {
      endpoint: '/api/ai/tax-advice',
      province,
      state,
      rsuCount: rsuEntries.length,
    });

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Calculate total RSU income
    const totalRsuIncome = rsuEntries.reduce(
      (sum, entry) => sum + entry.fmvUSD * entry.shares,
      0
    );

    // Build comprehensive prompt for tax optimization
    const prompt = `You are a cross-border tax optimization expert specializing in US-Canada taxation for H-1B/TN visa tech workers.

Analyze this taxpayer's situation:

**Profile:**
- Filing Status: ${filingStatus}
- US State: ${state}
- Canadian Province: ${province}

**RSU Income (${rsuEntries.length} vesting events):**
${rsuEntries.map((entry, idx) => `${idx + 1}. ${entry.employer} - ${entry.shares} shares @ $${entry.fmvUSD.toFixed(2)} on ${entry.vestingDate} = $${(entry.shares * entry.fmvUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}`).join('\n')}

**Total RSU Income:** $${totalRsuIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD

**Current Tax Situation:**
- US Tax (Federal + State): $${ftcResults.usTaxUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
- Canada Tax (Federal + Provincial): $${ftcResults.canadaTaxCAD.toLocaleString('en-US', { minimumFractionDigits: 2 })} CAD
- Foreign Tax Credit Applied: $${ftcResults.ftcCAD.toLocaleString('en-US', { minimumFractionDigits: 2 })} CAD

Provide exactly **3 specific, actionable tax optimization strategies** for this taxpayer. For each strategy:

1. **Strategy Title** (concise, actionable)
2. **Estimated Annual Savings** (in CAD, be realistic)
3. **Implementation Steps** (3-5 numbered steps)
4. **Risks/Caveats** (important warnings)

Focus on these optimization areas:
- RSU vesting timing optimization
- Provincial tax arbitrage (BC rates vs AB/ON/other provinces)
- RRSP contribution strategies (18% of prior year income up to $31,560 CAD deduction limit)
- State tax residency planning
- FTC maximization techniques
- Currency conversion timing

Format your response as markdown with ## headers for each strategy. Be specific with dollar amounts where possible.`;

    // Start performance tracking for AI call
    const aiSpan = transaction.startChild({
      op: 'ai.stream',
      description: 'Anthropic Claude streaming',
    });

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    aiSpan.finish();

    // Create hash of user context before streaming
    const contextHash = createHash('sha256')
      .update(
        JSON.stringify({
          province,
          state,
          filingStatus,
          totalRsuIncome: Math.round(totalRsuIncome),
        })
      )
      .digest('hex');

    // Create readable stream for client
    const encoder = new TextEncoder();
    let fullText = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        stream.on('text', (text) => {
          fullText += text;
          controller.enqueue(encoder.encode(text));
        });

        stream.on('error', (error) => {
          logger.error('AI stream error', {
            endpoint: '/api/ai/tax-advice',
            error: error instanceof Error ? error : new Error(String(error)),
          });

          Sentry.captureException(error, {
            level: 'error',
            tags: { route: '/api/ai/tax-advice', stream: 'anthropic' },
          });

          transaction.setStatus('internal_error');
          transaction.finish();
          controller.error(error);
        });

        stream.on('end', async () => {
          const duration = Date.now() - startTime;
          logger.info('AI tax advice generated', {
            endpoint: '/api/ai/tax-advice',
            duration,
            responseLength: fullText.length,
          });

          transaction.setHttpStatus(200);
          transaction.finish();
          // Store recommendation in database
          try {
            const db = new Database(DB_PATH);
            const stmt = db.prepare(`
              INSERT INTO tax_recommendations (user_context_hash, recommendations, feedback)
              VALUES (?, ?, 0)
            `);
            stmt.run(contextHash, fullText);
            db.close();

            logger.info('Recommendation stored successfully');
          } catch (error) {
            logger.error('Failed to store recommendation', {
              error: error instanceof Error ? error : new Error(String(error)),
            });
            Sentry.captureException(error);
          }

          controller.close();
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Context-Hash': contextHash,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('AI tax advice error', {
      endpoint: '/api/ai/tax-advice',
      duration,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    Sentry.captureException(error, {
      level: 'error',
      tags: { route: '/api/ai/tax-advice', level: 'high' },
      contexts: { performance: { duration } },
    });

    transaction.setStatus('internal_error');
    transaction.finish();

    return NextResponse.json(
      { error: 'Failed to generate tax advice' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { contextHash, feedback } = await request.json();

    // Validate feedback value
    if (![-1, 0, 1].includes(feedback)) {
      return NextResponse.json(
        { error: 'Invalid feedback value' },
        { status: 400 }
      );
    }

    // Update feedback for the most recent recommendation with this context
    const db = new Database(DB_PATH);

    const stmt = db.prepare(`
      UPDATE tax_recommendations
      SET feedback = ?
      WHERE user_context_hash = ?
      AND id = (
        SELECT id FROM tax_recommendations
        WHERE user_context_hash = ?
        ORDER BY created_at DESC
        LIMIT 1
      )
    `);

    const result = stmt.run(feedback, contextHash, contextHash);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback update error:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
