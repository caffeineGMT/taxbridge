/**
 * API Route: Submit Customer Feedback
 * POST /api/feedback/submit
 *
 * Accepts feedback from paid users via email survey or in-app form
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback } from '@/lib/customer-success';
import { getUserProfileByClerkId } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Parse request body
    const body = await req.json();

    const {
      nps_score,
      satisfaction_score,
      upgrade_reason,
      most_used_features,
      missing_features,
      pain_points,
      general_feedback,
      feature_requests,
      testimonial,
      email,
      user_id,
      subscription_tier,
      source = 'in-app',
      utm_campaign,
    } = body;

    // Validate required fields
    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Authentication required or email must be provided' },
        { status: 401 }
      );
    }

    // Get user profile
    let userProfile;
    if (userId) {
      userProfile = await getUserProfileByClerkId(userId);
    }

    const finalUserId = userProfile?.id || user_id;
    const finalEmail = userProfile?.email || email;

    if (!finalUserId || !finalEmail) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate days since subscription
    const daysSinceSubscription = userProfile
      ? Math.floor((Date.now() / 1000 - userProfile.created_at) / (60 * 60 * 24))
      : 0;

    // Get calculation count (simplified)
    const calculationsCompleted = 0; // TODO: Query from database

    // Submit feedback
    const feedbackId = await submitFeedback({
      user_id: finalUserId,
      email: finalEmail,
      nps_score: nps_score ? parseInt(nps_score) : undefined,
      satisfaction_score: satisfaction_score ? parseInt(satisfaction_score) : undefined,
      upgrade_reason,
      most_used_features,
      missing_features,
      pain_points,
      general_feedback,
      feature_requests,
      testimonial,
      subscription_tier: userProfile?.subscription_tier || subscription_tier || 'free',
      days_since_subscription: daysSinceSubscription,
      calculations_completed: calculationsCompleted,
      source,
      utm_campaign,
    });

    console.log(`✓ Feedback submitted: ${finalEmail} (ID: ${feedbackId})`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback_id: feedbackId,
    });

  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for feedback survey page
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get('email');
  const userId = searchParams.get('user_id');
  const tier = searchParams.get('tier');

  // Return feedback survey HTML form
  return new NextResponse(
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaxBridge Feedback Survey</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      font-size: 28px;
      margin-bottom: 8px;
      color: #1a202c;
    }
    .subtitle {
      color: #718096;
      margin-bottom: 32px;
      font-size: 16px;
    }
    .question {
      margin-bottom: 28px;
    }
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #2d3748;
      font-size: 15px;
    }
    input[type="text"], textarea, select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 15px;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    .nps-scale {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .nps-button {
      flex: 1;
      padding: 12px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nps-button:hover {
      border-color: #667eea;
      background: #f7fafc;
    }
    .nps-button.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    .submit-btn {
      width: 100%;
      padding: 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 24px;
    }
    .submit-btn:hover {
      background: #5a67d8;
    }
    .submit-btn:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }
    .success-message {
      display: none;
      text-align: center;
      padding: 40px;
    }
    .success-message h2 {
      color: #48bb78;
      font-size: 32px;
      margin-bottom: 16px;
    }
    .helper-text {
      font-size: 13px;
      color: #718096;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="survey-form">
      <h1>📊 Help Us Improve TaxBridge</h1>
      <p class="subtitle">Your feedback shapes our roadmap. This takes 2 minutes.</p>

      <form id="feedback-form">
        <input type="hidden" name="email" value="${email || ''}">
        <input type="hidden" name="user_id" value="${userId || ''}">
        <input type="hidden" name="subscription_tier" value="${tier || ''}">
        <input type="hidden" name="source" value="email-survey">
        <input type="hidden" name="utm_campaign" value="feedback-request">

        <!-- NPS Score -->
        <div class="question">
          <label>How likely are you to recommend TaxBridge to a colleague? *</label>
          <div class="nps-scale" id="nps-scale">
            ${[0,1,2,3,4,5,6,7,8,9,10].map(n =>
              `<button type="button" class="nps-button" data-score="${n}">${n}</button>`
            ).join('')}
          </div>
          <div class="helper-text" style="display: flex; justify-content: space-between; margin-top: 8px;">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
          <input type="hidden" name="nps_score" id="nps_score" required>
        </div>

        <!-- Satisfaction Score -->
        <div class="question">
          <label>How satisfied are you with TaxBridge overall?</label>
          <select name="satisfaction_score">
            <option value="">Select...</option>
            <option value="5">5 - Very satisfied</option>
            <option value="4">4 - Satisfied</option>
            <option value="3">3 - Neutral</option>
            <option value="2">2 - Dissatisfied</option>
            <option value="1">1 - Very dissatisfied</option>
          </select>
        </div>

        <!-- Upgrade Reason -->
        <div class="question">
          <label>What made you upgrade to Pro?</label>
          <input type="text" name="upgrade_reason" placeholder="e.g., Multi-year planning, PDF reports...">
        </div>

        <!-- Most Used Features -->
        <div class="question">
          <label>What features do you use most?</label>
          <input type="text" name="most_used_features" placeholder="e.g., Calculator, Multi-year dashboard...">
        </div>

        <!-- Missing Features -->
        <div class="question">
          <label>What features are missing or could be better?</label>
          <textarea name="missing_features" placeholder="Tell us what would make TaxBridge more valuable for you..."></textarea>
        </div>

        <!-- Pain Points -->
        <div class="question">
          <label>Anything frustrating or confusing?</label>
          <textarea name="pain_points" placeholder="What's slowing you down or causing friction?"></textarea>
        </div>

        <!-- General Feedback -->
        <div class="question">
          <label>Any other feedback?</label>
          <textarea name="general_feedback" placeholder="Feature requests, bugs, kudos - we read everything!"></textarea>
        </div>

        <!-- Testimonial -->
        <div class="question">
          <label>Would you like to share a testimonial? (We may feature this on our website)</label>
          <textarea name="testimonial" placeholder="Optional: Share your experience with TaxBridge..."></textarea>
        </div>

        <button type="submit" class="submit-btn" id="submit-btn">Submit Feedback</button>
      </form>
    </div>

    <div id="success-message" class="success-message">
      <h2>🎉 Thank you!</h2>
      <p style="font-size: 18px; color: #4a5568; margin-bottom: 24px;">
        Your feedback helps us build a better TaxBridge for everyone.
      </p>
      <p style="font-size: 16px; color: #718096;">
        As a thank you, we've added <strong>1 month free</strong> to your account.
      </p>
    </div>
  </div>

  <script>
    // NPS button selection
    const npsButtons = document.querySelectorAll('.nps-button');
    const npsInput = document.getElementById('nps_score');

    npsButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        npsButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        npsInput.value = btn.dataset.score;
      });
    });

    // Form submission
    const form = document.getElementById('feedback-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!npsInput.value) {
        alert('Please select an NPS score (0-10)');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/feedback/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          document.getElementById('survey-form').style.display = 'none';
          document.getElementById('success-message').style.display = 'block';
        } else {
          const error = await response.json();
          alert('Error submitting feedback: ' + error.error);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Feedback';
        }
      } catch (error) {
        alert('Network error. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
      }
    });
  </script>
</body>
</html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}
