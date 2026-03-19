/**
 * Submit User Feedback API
 * POST /api/feedback/submit-user-feedback
 *
 * Purpose: Collect feedback from paid or free users about purchase/upgrade barriers
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update } from '@/lib/db/unified';
import {
  generateFeedbackGiftCard,
  getFeedbackThankYouEmailData,
} from '@/lib/email/user-feedback-templates';
import { sendEmail } from '@/lib/email/sendgrid';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      campaign_id,
      user_id,
      email,
      response_type,

      // Paid user responses
      purchase_hesitation,
      purchase_hesitation_category,
      purchase_hesitation_details,
      what_convinced_purchase,
      compared_alternatives,
      would_pay_earlier_if,

      // Free user responses
      why_not_upgrade,
      why_not_upgrade_category,
      why_not_upgrade_details,
      what_would_make_upgrade,
      price_expectation_usd,
      free_compared_alternatives,

      // Common responses
      overall_satisfaction,
      most_valuable_feature,
      missing_features,
      pain_points,
      would_recommend_to_friend,
      testimonial,
      testimonial_permission,

      // Incentive
      incentive_email,
      incentive_requested,
    } = body;

    // Validate required fields
    if (!campaign_id || !email || !response_type) {
      return NextResponse.json(
        { error: 'Missing required fields: campaign_id, email, response_type' },
        { status: 400 }
      );
    }

    // Get user context if user_id provided
    let subscriptionTier = response_type === 'paid_barriers' ? 'pro' : 'free';
    let daysSinceSignup = 0;
    let calculationsCompleted = 0;
    let firstName = '';

    if (user_id) {
      const user = await queryOne<any>(`
        SELECT * FROM user_profiles WHERE id = $1
      `, [user_id]);

      if (user) {
        subscriptionTier = user.subscription_tier;
        daysSinceSignup = Math.floor((Date.now() / 1000 - user.created_at) / (60 * 60 * 24));
        firstName = user.first_name || '';

        // Get calculation count
        const calcCount = await queryOne<{ count: number }>(`
          SELECT COUNT(*) as count FROM tax_calculations WHERE user_id = $1
        `, [user_id]);
        calculationsCompleted = calcCount?.count || 0;
      }
    }

    // Insert feedback response
    const responseId = await insert(`
      INSERT INTO user_feedback_responses (
        campaign_id, user_id, email, subscription_tier, days_since_signup, calculations_completed,
        response_type,
        purchase_hesitation, purchase_hesitation_category, purchase_hesitation_details,
        what_convinced_purchase, compared_alternatives, would_pay_earlier_if,
        why_not_upgrade, why_not_upgrade_category, why_not_upgrade_details,
        what_would_make_upgrade, price_expectation_usd, free_compared_alternatives,
        overall_satisfaction, most_valuable_feature, missing_features, pain_points,
        would_recommend_to_friend, testimonial, testimonial_permission,
        incentive_requested, incentive_email
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      )
    `, [
      campaign_id,
      user_id || null,
      email,
      subscriptionTier,
      daysSinceSignup,
      calculationsCompleted,
      response_type,
      purchase_hesitation || null,
      purchase_hesitation_category || null,
      purchase_hesitation_details || null,
      what_convinced_purchase || null,
      compared_alternatives || null,
      would_pay_earlier_if || null,
      why_not_upgrade || null,
      why_not_upgrade_category || null,
      why_not_upgrade_details || null,
      what_would_make_upgrade || null,
      price_expectation_usd || null,
      free_compared_alternatives || null,
      overall_satisfaction || null,
      most_valuable_feature || null,
      missing_features || null,
      pain_points || null,
      would_recommend_to_friend || null,
      testimonial || null,
      testimonial_permission || false,
      incentive_requested || false,
      incentive_email || email,
    ]);

    // Update campaign stats
    await update(`
      UPDATE user_feedback_campaigns
      SET total_responses = total_responses + 1
      WHERE id = $1
    `, [campaign_id]);

    // Update email tracking status
    await update(`
      UPDATE feedback_email_tracking
      SET status = 'responded', responded_at = $1
      WHERE campaign_id = $2 AND email = $3 AND status != 'responded'
    `, [Math.floor(Date.now() / 1000), campaign_id, email]);

    // Generate and send gift card if requested
    let giftCardCode = '';
    if (incentive_requested && incentive_email) {
      try {
        giftCardCode = await generateFeedbackGiftCard({
          amount: 10,
          recipientEmail: incentive_email,
          recipientName: firstName || email.split('@')[0],
        });

        // Update response with gift card code
        await update(`
          UPDATE user_feedback_responses
          SET incentive_code = $1, incentive_delivered = 1, incentive_delivered_at = $2
          WHERE id = $3
        `, [giftCardCode, Math.floor(Date.now() / 1000), responseId]);

        // Send thank you email with gift card
        const thankYouData = getFeedbackThankYouEmailData({
          firstName: firstName || email.split('@')[0],
          email: incentive_email,
          giftCardCode,
          giftCardAmount: 10,
          feedbackType: response_type === 'paid_barriers' ? 'paid' : 'free',
          keyInsights: generateKeyInsights(body, response_type),
        });

        await sendEmail({
          to: incentive_email,
          from: {
            email: 'michael@taxbridge.app',
            name: 'Michael from TaxBridge',
          },
          subject: thankYouData.subject,
          templateId: 'd-feedback-thank-you',
          dynamicData: thankYouData,
        });

        console.log(`[FEEDBACK] Sent thank you email with gift card to ${incentive_email}`);
      } catch (error: any) {
        // console.error('[FEEDBACK] Gift card generation/email failed:', error);
        // Don't fail the whole request if gift card fails
      }
    }

    // Check if campaign has reached target responses
    const campaign = await queryOne<any>(`
      SELECT * FROM user_feedback_campaigns WHERE id = $1
    `, [campaign_id]);

    if (campaign && campaign.total_responses >= campaign.target_responses && campaign.status === 'active') {
      await update(`
        UPDATE user_feedback_campaigns
        SET status = 'completed', completed_at = $1
        WHERE id = $2
      `, [Math.floor(Date.now() / 1000), campaign_id]);

      console.log(`[FEEDBACK CAMPAIGN] Campaign ${campaign_id} completed - reached ${campaign.target_responses} responses`);
    }

    return NextResponse.json({
      success: true,
      response_id: responseId,
      gift_card_code: giftCardCode || null,
      message: 'Feedback submitted successfully',
    });

  } catch (error: any) {
    return handleApiError(error, { route: '/api/feedback/submit-user-feedback', method: req.method });
  }
}

/**
 * Generate key insights from user feedback for thank you email
 */
function generateKeyInsights(feedback: any, responseType: string): string[] {
  const insights: string[] = [];

  if (responseType === 'paid_barriers') {
    if (feedback.purchase_hesitation_category === 'price_too_high') {
      insights.push("💰 Price concern noted - we're exploring lower price tiers for simple tax situations");
    }
    if (feedback.purchase_hesitation_category === 'value_unclear') {
      insights.push("📊 We'll make the value proposition clearer on the landing page");
    }
    if (feedback.what_convinced_purchase) {
      insights.push("✅ Your conversion trigger will help us emphasize what works");
    }
  } else {
    if (feedback.why_not_upgrade_category === 'price_too_high') {
      insights.push("💰 Your price feedback helps us design better pricing tiers");
    }
    if (feedback.why_not_upgrade_category === 'free_tier_sufficient') {
      insights.push("✅ Good to know the free tier works for you! We'll keep improving it");
    }
    if (feedback.what_would_make_upgrade && feedback.what_would_make_upgrade.length > 20) {
      insights.push("🛠️ Your feature request is going straight to our roadmap");
    }
  }

  if (feedback.testimonial && feedback.testimonial.length > 20) {
    insights.push("💬 Thank you for the testimonial - we might feature it on our site!");
  }

  return insights;
}
