/**
 * Customer Interview Insights Submission API
 * POST /api/interviews/submit
 *
 * Purpose: Submit structured interview insights after conducting customer interviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { insert, queryOne } from '@/lib/db/unified';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.interview_id || !body.user_id || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields: interview_id, user_id, email' },
        { status: 400 }
      );
    }

    // Insert interview insights
    const insightId = await insert(`
      INSERT INTO interview_insights (
        interview_id, user_id, email,
        problem_solved, previous_solution, pain_points,
        time_saved_hours, money_saved_usd, emotional_benefit, problem_quote,
        hesitation_reason, objection_type, objection_details,
        what_convinced_them, compared_alternatives, barrier_quote,
        would_refer_if, referral_motivation, target_audience,
        already_referred, referral_count, why_not_referred, referral_quote,
        magic_wand_feature, most_valuable_feature, missing_features, feature_requests,
        testimonial_text, testimonial_permission, testimonial_attribution, net_promoter_score,
        subscription_tier, days_since_subscription, calculations_completed,
        interview_duration_minutes, interview_notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36
      )
    `, [
      body.interview_id,
      body.user_id,
      body.email,
      body.problem_solved || null,
      body.previous_solution || null,
      body.pain_points || null,
      body.time_saved_hours || null,
      body.money_saved_usd || null,
      body.emotional_benefit || null,
      body.problem_quote || null,
      body.hesitation_reason || null,
      body.objection_type || null,
      body.objection_details || null,
      body.what_convinced_them || null,
      body.compared_alternatives || null,
      body.barrier_quote || null,
      body.would_refer_if || null,
      body.referral_motivation || null,
      body.target_audience || null,
      body.already_referred || false,
      body.referral_count || 0,
      body.why_not_referred || null,
      body.referral_quote || null,
      body.magic_wand_feature || null,
      body.most_valuable_feature || null,
      body.missing_features || null,
      body.feature_requests || null,
      body.testimonial_text || null,
      body.testimonial_permission || 'no',
      body.testimonial_attribution || null,
      body.net_promoter_score || null,
      body.subscription_tier || null,
      body.days_since_subscription || null,
      body.calculations_completed || null,
      body.interview_duration_minutes || null,
      body.interview_notes || null,
    ]);

    // Update interview status to completed
    await insert(`
      UPDATE customer_interviews
      SET status = 'completed', completed_at = $1
      WHERE id = $2
    `, [Math.floor(Date.now() / 1000), body.interview_id]);

    // Auto-generate referral messaging from insights (async)
    if (insightId) {
      generateReferralMessaging(insightId);
    }

    return NextResponse.json({
      success: true,
      insight_id: insightId,
      message: 'Interview insights submitted successfully'
    });

  } catch (error: any) {
    return handleApiError(error, { route: '/api/interviews/submit', method: req.method });
  }
}

/**
 * Auto-generate referral messaging from interview insights
 */
async function generateReferralMessaging(insightId: number) {
  try {
    // Fetch the insight
    const insight = await queryOne<any>(`
      SELECT * FROM interview_insights WHERE id = $1
    `, [insightId]);

    if (!insight) return;

    const messages: Array<{
      type: string;
      text: string;
      theme: string;
    }> = [];

    // 1. Generate headline from problem_quote
    if (insight.problem_quote) {
      const headline = extractHeadline(insight.problem_quote, insight.money_saved_usd, insight.time_saved_hours);
      if (headline) {
        messages.push({
          type: 'headline',
          text: headline,
          theme: identifyTheme(insight)
        });
      }
    }

    // 2. Generate social post from testimonial
    if (insight.testimonial_text && insight.testimonial_permission !== 'no') {
      const socialPost = generateSocialPost(insight);
      if (socialPost) {
        messages.push({
          type: 'social_post',
          text: socialPost,
          theme: identifyTheme(insight)
        });
      }
    }

    // 3. Generate objection handler from barrier_quote
    if (insight.barrier_quote && insight.what_convinced_them) {
      const objectionHandler = `**Objection:** "${insight.barrier_quote}"\n\n**How we overcame it:** ${insight.what_convinced_them}`;
      messages.push({
        type: 'objection_handler',
        text: objectionHandler,
        theme: insight.objection_type || 'general'
      });
    }

    // 4. Generate referral email subject from referral_quote
    if (insight.referral_quote) {
      const emailSubject = extractEmailSubject(insight.referral_quote);
      if (emailSubject) {
        messages.push({
          type: 'email_subject',
          text: emailSubject,
          theme: identifyTheme(insight)
        });
      }
    }

    // Insert generated messages
    for (const msg of messages) {
      await insert(`
        INSERT INTO referral_messaging (
          message_type, message_text, source_insight_ids,
          customer_language, problem_theme, status
        ) VALUES ($1, $2, $3, $4, $5, 'draft')
      `, [msg.type, msg.text, insightId.toString(), true, msg.theme]);
    }

    logger.info(`[REFERRAL MESSAGING] Generated ${messages.length} messages from insight #${insightId}`);

  } catch (error) {
    // console.error('[REFERRAL MESSAGING] Generation error:', error);
  }
}

/**
 * Extract headline from problem quote
 */
function extractHeadline(quote: string, moneySaved: number | null, timeSaved: number | null): string | null {
  // If we have quantified impact, use it
  if (moneySaved && moneySaved > 0) {
    return `Save $${moneySaved.toLocaleString()}+ on cross-border taxes`;
  }

  if (timeSaved && timeSaved > 0) {
    return `Calculate cross-border taxes in ${timeSaved} minutes (not ${timeSaved * 10} hours)`;
  }

  // Extract key phrase from quote
  const patterns = [
    /saved? (\$[\d,]+)/i,
    /(\d+) hours?/i,
    /(don't|no longer) need (a |an )?(CPA|accountant)/i,
  ];

  for (const pattern of patterns) {
    const match = quote.match(pattern);
    if (match) {
      return `${quote.split('.')[0]}.`; // First sentence
    }
  }

  return null;
}

/**
 * Generate social post from insight
 */
function generateSocialPost(insight: any): string | null {
  if (!insight.testimonial_text) return null;

  const moneySaved = insight.money_saved_usd ? `$${insight.money_saved_usd.toLocaleString()}` : '';
  const timeSaved = insight.time_saved_hours ? `${insight.time_saved_hours} hours` : '';

  const post = `PSA for H-1B/TN folks moving to Canada 🇨🇦

${insight.testimonial_text}

${moneySaved || timeSaved ? `Impact: Saved ${[moneySaved, timeSaved].filter(Boolean).join(' and ')}` : ''}

Not affiliated, just a happy user. Worth checking out if you're dealing with cross-border RSU taxes.`;

  return post;
}

/**
 * Extract email subject from referral quote
 */
function extractEmailSubject(quote: string): string | null {
  // Extract punchy first sentence
  const firstSentence = quote.split(/[.!?]/)[0].trim();

  if (firstSentence.length > 10 && firstSentence.length < 60) {
    return firstSentence;
  }

  return null;
}

/**
 * Identify problem theme from insight
 */
function identifyTheme(insight: any): string {
  const painPoints = (insight.pain_points || '').toLowerCase();

  if (insight.money_saved_usd && insight.money_saved_usd > 1000) {
    return 'money_savings';
  }

  if (insight.time_saved_hours && insight.time_saved_hours > 5) {
    return 'time_savings';
  }

  if (painPoints.includes('cpa') || painPoints.includes('accountant')) {
    return 'cpa_replacement';
  }

  if (painPoints.includes('complex') || painPoints.includes('confus')) {
    return 'complexity';
  }

  if (painPoints.includes('anxiety') || painPoints.includes('scary') || painPoints.includes('worried')) {
    return 'peace_of_mind';
  }

  return 'general';
}
