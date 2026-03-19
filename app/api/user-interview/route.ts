/**
 * User Interview Response API Endpoint
 *
 * Captures and stores user interview responses from paid customers.
 * Tracks responses for $25 gift card fulfillment.
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

interface InterviewResponse {
  id: string;
  customerId: string;
  email: string;
  name: string;
  plan: string;
  responses: {
    almostStoppedMe: string; // Main question: What almost stopped you?
    pricePerception: string; // Too expensive / just right / cheap
    missingFeatures?: string; // Optional: Features they wanted
    competitorConsidered?: string; // Optional: Which competitor they considered
    overallExperience: string; // 1-5 rating
    additionalFeedback?: string; // Optional: Anything else
  };
  submittedAt: string;
  giftCardSent: boolean;
  giftCardCode?: string;
  source: 'email' | 'manual';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { customerId, email, name, plan, responses, token } = body;

    // Validate required fields
    if (!customerId || !email || !name || !plan || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate token (basic security - customer ID should match)
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${customerId}-user-interview-2026`)
      .digest('hex')
      .slice(0, 16);

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 403 }
      );
    }

    // Create response object
    const responseData: InterviewResponse = {
      id: crypto.randomBytes(8).toString('hex'),
      customerId,
      email,
      name,
      plan,
      responses: {
        almostStoppedMe: responses.almostStoppedMe || '',
        pricePerception: responses.pricePerception || 'no-answer',
        missingFeatures: responses.missingFeatures,
        competitorConsidered: responses.competitorConsidered,
        overallExperience: responses.overallExperience || '3',
        additionalFeedback: responses.additionalFeedback,
      },
      submittedAt: new Date().toISOString(),
      giftCardSent: false,
      source: 'email',
    };

    // Save to file system
    const responsesDir = path.join(process.cwd(), 'data', 'user-interviews', 'responses');
    if (!fs.existsSync(responsesDir)) {
      fs.mkdirSync(responsesDir, { recursive: true });
    }

    const responseFile = path.join(
      responsesDir,
      `response-${responseData.id}-${Date.now()}.json`
    );
    fs.writeFileSync(responseFile, JSON.stringify(responseData, null, 2));

    // Also append to master log
    const logFile = path.join(responsesDir, 'all-responses.jsonl');
    fs.appendFileSync(logFile, JSON.stringify(responseData) + '\n');

    console.log(`✅ User interview response saved: ${responseData.id} from ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Response recorded! Your $25 gift card will be sent within 24 hours.',
      responseId: responseData.id,
    });

  } catch (error) {
    console.error('Error saving interview response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve all responses (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    // Simple admin auth (replace with real auth in production)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const responsesDir = path.join(process.cwd(), 'data', 'user-interviews', 'responses');

    if (!fs.existsSync(responsesDir)) {
      return NextResponse.json({ responses: [] });
    }

    const files = fs.readdirSync(responsesDir)
      .filter(f => f.startsWith('response-') && f.endsWith('.json'));

    const responses = files.map(file => {
      const content = fs.readFileSync(path.join(responsesDir, file), 'utf-8');
      return JSON.parse(content);
    });

    return NextResponse.json({
      total: responses.length,
      responses,
    });

  } catch (error) {
    console.error('Error retrieving responses:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve responses' },
      { status: 500 }
    );
  }
}
