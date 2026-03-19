/**
 * Partner Application Submitted - Success Page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ApplicationSubmittedPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-8">
      <Card className="max-w-2xl bg-slate-800/50 border-emerald-500/30 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-white">
            Application Submitted!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-slate-300">
            Thank you for your interest in partnering with TaxBridge. We've received your application and will review it within <strong className="text-white">48 hours</strong>.
          </p>

          {searchParams.email && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300">
                  We've sent a confirmation email to <strong>{searchParams.email}</strong>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              What Happens Next?
            </h3>

            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">1.</span>
                <span>
                  Our team will review your application and verify your practice information
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">2.</span>
                <span>
                  Once approved, you'll receive an email with your unique referral code, co-branded landing page, and partner dashboard access
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">3.</span>
                <span>
                  You'll get access to our marketing toolkit: email templates, social posts, blog content, and banners
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">4.</span>
                <span>
                  Start referring clients and earning 30% recurring revenue share immediately
                </span>
              </li>
            </ol>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              <strong className="text-white">Questions?</strong> Email us at{' '}
              <a href="mailto:partners@taxbridgecpa.com" className="text-blue-400 hover:underline">
                partners@taxbridgecpa.com
              </a>
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Link
              href="/"
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
