'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

export default function UserFeedbackSurveyPage() {
  const searchParams = useSearchParams();

  const userType = (searchParams.get('user_type') || 'free') as 'paid' | 'free';
  const email = searchParams.get('email') || '';
  const userId = searchParams.get('user_id') || '';
  const campaignId = searchParams.get('campaign_id') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - PAID USERS
  const [purchaseHesitation, setPurchaseHesitation] = useState('');
  const [purchaseHesitationCategory, setPurchaseHesitationCategory] = useState('');
  const [purchaseHesitationDetails, setPurchaseHesitationDetails] = useState('');
  const [whatConvincedPurchase, setWhatConvincedPurchase] = useState('');
  const [comparedAlternatives, setComparedAlternatives] = useState('');
  const [wouldPayEarlierIf, setWouldPayEarlierIf] = useState('');

  // Form state - FREE USERS
  const [whyNotUpgrade, setWhyNotUpgrade] = useState('');
  const [whyNotUpgradeCategory, setWhyNotUpgradeCategory] = useState('');
  const [whyNotUpgradeDetails, setWhyNotUpgradeDetails] = useState('');
  const [whatWouldMakeUpgrade, setWhatWouldMakeUpgrade] = useState('');
  const [priceExpectation, setPriceExpectation] = useState('');
  const [freeComparedAlternatives, setFreeComparedAlternatives] = useState('');

  // Form state - COMMON
  const [overallSatisfaction, setOverallSatisfaction] = useState(3);
  const [mostValuableFeature, setMostValuableFeature] = useState('');
  const [missingFeatures, setMissingFeatures] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [testimonial, setTestimonial] = useState('');
  const [testimonialPermission, setTestimonialPermission] = useState(false);
  const [incentiveEmail, setIncentiveEmail] = useState(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback/submit-user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: parseInt(campaignId),
          user_id: userId ? parseInt(userId) : null,
          email,
          response_type: userType === 'paid' ? 'paid_barriers' : 'free_upgrade',

          // Paid user responses
          ...(userType === 'paid' && {
            purchase_hesitation: purchaseHesitation,
            purchase_hesitation_category: purchaseHesitationCategory,
            purchase_hesitation_details: purchaseHesitationDetails,
            what_convinced_purchase: whatConvincedPurchase,
            compared_alternatives: comparedAlternatives,
            would_pay_earlier_if: wouldPayEarlierIf,
          }),

          // Free user responses
          ...(userType === 'free' && {
            why_not_upgrade: whyNotUpgrade,
            why_not_upgrade_category: whyNotUpgradeCategory,
            why_not_upgrade_details: whyNotUpgradeDetails,
            what_would_make_upgrade: whatWouldMakeUpgrade,
            price_expectation_usd: priceExpectation ? parseInt(priceExpectation) : null,
            compared_alternatives: freeComparedAlternatives,
          }),

          // Common responses
          overall_satisfaction: overallSatisfaction,
          most_valuable_feature: mostValuableFeature,
          missing_features: missingFeatures,
          pain_points: painPoints,
          would_recommend_to_friend: wouldRecommend,
          testimonial: testimonial,
          testimonial_permission: testimonialPermission,
          incentive_email: incentiveEmail,
          incentive_requested: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[FEEDBACK] Submission error:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-4">Thank you for your feedback!</h1>
          <p className="text-lg text-slate-600 mb-6">
            Your $10 Amazon gift card will be delivered to <strong>{incentiveEmail}</strong> within 24 hours.
          </p>
          <p className="text-slate-600 mb-8">
            Your honest answers will help us build a better TaxBridge for everyone. We read every single response.
          </p>
          {userType === 'free' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-2">Ready to upgrade? Here's 20% off.</h3>
              <p className="text-slate-600 mb-4">
                Use code <code className="bg-white px-2 py-1 rounded font-mono">FEEDBACK20</code> for $63/year (instead of $79)
              </p>
              <Button asChild>
                <a href="/pricing?code=FEEDBACK20&utm_source=survey&utm_campaign=feedback-thank-you">
                  Upgrade Now →
                </a>
              </Button>
            </div>
          )}
          <Button variant="outline" asChild>
            <a href="/">Return to Home</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-4xl mb-4">💬</div>
            <h1 className="text-3xl font-bold mb-2">
              {userType === 'paid'
                ? "What almost stopped you from subscribing?"
                : "What's stopping you from upgrading?"
              }
            </h1>
            <p className="text-lg text-slate-600">
              Help us understand your decision. <strong>2 minutes</strong> + <strong>$10 Amazon gift card.</strong>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PAID USER QUESTIONS */}
            {userType === 'paid' && (
              <>
                {/* Question 1: Purchase Hesitation Category */}
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    1. What almost stopped you from subscribing? (Pick the main one)
                  </Label>
                  <RadioGroup value={purchaseHesitationCategory} onValueChange={setPurchaseHesitationCategory}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="price_too_high" id="price_too_high" className="mt-1" />
                        <Label htmlFor="price_too_high" className="font-normal cursor-pointer">
                          💰 <strong>Price too high</strong> - $79/year felt expensive
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="value_unclear" id="value_unclear" className="mt-1" />
                        <Label htmlFor="value_unclear" className="font-normal cursor-pointer">
                          🤷 <strong>Value unclear</strong> - Wasn't sure if it would save me money/time
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="trust_concerns" id="trust_concerns" className="mt-1" />
                        <Label htmlFor="trust_concerns" className="font-normal cursor-pointer">
                          🔒 <strong>Trust concerns</strong> - Wasn't sure if the site/calculator was legit
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="feature_missing" id="feature_missing" className="mt-1" />
                        <Label htmlFor="feature_missing" className="font-normal cursor-pointer">
                          🛠️ <strong>Missing feature</strong> - Needed something that wasn't there
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="comparison_shopping" id="comparison_shopping" className="mt-1" />
                        <Label htmlFor="comparison_shopping" className="font-normal cursor-pointer">
                          🔍 <strong>Comparison shopping</strong> - Wanted to check other options first
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="timing_not_right" id="timing_not_right" className="mt-1" />
                        <Label htmlFor="timing_not_right" className="font-normal cursor-pointer">
                          ⏰ <strong>Timing</strong> - Not tax season yet, or just didn't have time
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="other" id="other" className="mt-1" />
                        <Label htmlFor="other" className="font-normal cursor-pointer">
                          📌 <strong>Other</strong>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Question 2: Purchase Hesitation Details */}
                <div>
                  <Label htmlFor="purchase-details" className="text-lg font-semibold mb-3 block">
                    2. Tell us more - what made you hesitate? (Be specific!)
                  </Label>
                  <Textarea
                    id="purchase-details"
                    value={purchaseHesitationDetails}
                    onChange={(e) => setPurchaseHesitationDetails(e.target.value)}
                    placeholder="Example: 'I paused at checkout because $79 seemed expensive compared to my friend who uses TurboTax for $50. But then I realized TurboTax doesn't handle cross-border taxes, and a CPA would charge $600.'"
                    rows={4}
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    The more specific, the better! This helps us understand exactly what to fix.
                  </p>
                </div>

                {/* Question 3: What Convinced You */}
                <div>
                  <Label htmlFor="what-convinced" className="text-lg font-semibold mb-3 block">
                    3. What ultimately convinced you to subscribe?
                  </Label>
                  <Textarea
                    id="what-convinced"
                    value={whatConvincedPurchase}
                    onChange={(e) => setWhatConvincedPurchase(e.target.value)}
                    placeholder="Example: 'The multi-year tax planning feature - no CPA offers that. Plus I calculated I'd save $800/year by doing my own taxes.'"
                    rows={3}
                    required
                    className="w-full"
                  />
                </div>

                {/* Question 4: Compared Alternatives */}
                <div>
                  <Label htmlFor="compared-alternatives" className="text-lg font-semibold mb-3 block">
                    4. What other solutions did you consider? (CPA, other software, DIY, etc.)
                  </Label>
                  <Input
                    id="compared-alternatives"
                    value={comparedAlternatives}
                    onChange={(e) => setComparedAlternatives(e.target.value)}
                    placeholder="Example: 'H&R Block, TurboTax, local CPA ($600/year)'"
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* FREE USER QUESTIONS */}
            {userType === 'free' && (
              <>
                {/* Question 1: Why Not Upgrade Category */}
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    1. What's the main reason you haven't upgraded? (Pick one)
                  </Label>
                  <RadioGroup value={whyNotUpgradeCategory} onValueChange={setWhyNotUpgradeCategory}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="price_too_high" id="free-price-high" className="mt-1" />
                        <Label htmlFor="free-price-high" className="font-normal cursor-pointer">
                          💰 <strong>Price too high</strong> - $79/year is more than I want to pay
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="value_unclear" id="free-value-unclear" className="mt-1" />
                        <Label htmlFor="free-value-unclear" className="font-normal cursor-pointer">
                          🤷 <strong>Value unclear</strong> - Not sure what I get for $79/year
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="free_tier_sufficient" id="free-sufficient" className="mt-1" />
                        <Label htmlFor="free-sufficient" className="font-normal cursor-pointer">
                          ✅ <strong>Free tier is enough</strong> - The free calculator does what I need
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="feature_missing" id="free-feature-missing" className="mt-1" />
                        <Label htmlFor="free-feature-missing" className="font-normal cursor-pointer">
                          🛠️ <strong>Missing feature</strong> - I'd upgrade if you added [specific feature]
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="trying_before_buying" id="free-trying" className="mt-1" />
                        <Label htmlFor="free-trying" className="font-normal cursor-pointer">
                          🧪 <strong>Still trying it out</strong> - Want to use it more before committing
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="timing_not_right" id="free-timing" className="mt-1" />
                        <Label htmlFor="free-timing" className="font-normal cursor-pointer">
                          ⏰ <strong>Timing</strong> - Not tax season yet, will upgrade later
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="other" id="free-other" className="mt-1" />
                        <Label htmlFor="free-other" className="font-normal cursor-pointer">
                          📌 <strong>Other</strong>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Question 2: Why Not Upgrade Details */}
                <div>
                  <Label htmlFor="why-not-upgrade-details" className="text-lg font-semibold mb-3 block">
                    2. Tell us more - what's holding you back? (Be honest!)
                  </Label>
                  <Textarea
                    id="why-not-upgrade-details"
                    value={whyNotUpgradeDetails}
                    onChange={(e) => setWhyNotUpgradeDetails(e.target.value)}
                    placeholder="Example: 'The free calculator is enough for my simple situation (1 RSU vest per year). I'd upgrade if I could import all my RSUs from a CSV instead of manually entering each one.'"
                    rows={4}
                    required
                    className="w-full"
                  />
                </div>

                {/* Question 3: What Would Make You Upgrade */}
                <div>
                  <Label htmlFor="what-would-make-upgrade" className="text-lg font-semibold mb-3 block">
                    3. What would make upgrading a no-brainer?
                  </Label>
                  <Textarea
                    id="what-would-make-upgrade"
                    value={whatWouldMakeUpgrade}
                    onChange={(e) => setWhatWouldMakeUpgrade(e.target.value)}
                    placeholder="Example: 'If you could connect directly to my brokerage and auto-import all RSU vests, I'd upgrade today. Manual entry is too tedious.'"
                    rows={3}
                    required
                    className="w-full"
                  />
                </div>

                {/* Question 4: Price Expectation */}
                <div>
                  <Label htmlFor="price-expectation" className="text-lg font-semibold mb-3 block">
                    4. What would you be willing to pay per year?
                  </Label>
                  <Input
                    id="price-expectation"
                    type="number"
                    value={priceExpectation}
                    onChange={(e) => setPriceExpectation(e.target.value)}
                    placeholder="Example: 49"
                    className="w-full"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Current Pro plan is $79/year. What feels like a fair price to you?
                  </p>
                </div>

                {/* Question 5: Compared Alternatives */}
                <div>
                  <Label htmlFor="free-compared-alternatives" className="text-lg font-semibold mb-3 block">
                    5. What other tools are you using instead? (Optional)
                  </Label>
                  <Input
                    id="free-compared-alternatives"
                    value={freeComparedAlternatives}
                    onChange={(e) => setFreeComparedAlternatives(e.target.value)}
                    placeholder="Example: 'Excel spreadsheet + Reddit research'"
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* COMMON QUESTIONS */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">Quick final questions:</h2>

              {/* Satisfaction */}
              <div className="mb-6">
                <Label className="text-base font-semibold mb-3 block">
                  How satisfied are you with TaxBridge overall? (1-5)
                </Label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setOverallSatisfaction(score)}
                      className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                        overallSatisfaction === score
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-300'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-2">1 = Very Unsatisfied, 5 = Very Satisfied</p>
              </div>

              {/* Would Recommend */}
              <div className="mb-6">
                <Label className="text-base font-semibold mb-3 block">
                  Would you recommend TaxBridge to a friend?
                </Label>
                <RadioGroup value={wouldRecommend ? 'yes' : 'no'} onValueChange={(val) => setWouldRecommend(val === 'yes')}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="recommend-yes" />
                      <Label htmlFor="recommend-yes" className="font-normal cursor-pointer">
                        👍 Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="recommend-no" />
                      <Label htmlFor="recommend-no" className="font-normal cursor-pointer">
                        👎 No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Testimonial (optional) */}
              <div>
                <Label htmlFor="testimonial" className="text-base font-semibold mb-3 block">
                  Quick testimonial? (Optional - we might feature this on our site!)
                </Label>
                <Textarea
                  id="testimonial"
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="Example: 'TaxBridge saved me $800 in CPA fees and gave me peace of mind that I'm filing correctly.'"
                  rows={3}
                  className="w-full"
                />
                {testimonial && (
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id="testimonial-permission"
                      checked={testimonialPermission}
                      onCheckedChange={(checked) => setTestimonialPermission(checked as boolean)}
                    />
                    <Label htmlFor="testimonial-permission" className="font-normal cursor-pointer text-sm">
                      Yes, you can use this on your website (with my first name + company)
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Gift Card Email */}
            <div className="border-t pt-6">
              <Label htmlFor="incentive-email" className="text-base font-semibold mb-3 block">
                Where should we send your $10 Amazon gift card?
              </Label>
              <Input
                id="incentive-email"
                type="email"
                value={incentiveEmail}
                onChange={(e) => setIncentiveEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
                className="w-full"
              />
              <p className="text-sm text-slate-500 mt-2">
                Gift card will be delivered within 24 hours
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-lg py-6"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback & Get $10 Gift Card →'}
              </Button>
              <p className="text-center text-sm text-slate-500 mt-4">
                Responses are confidential. We read every single one.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
