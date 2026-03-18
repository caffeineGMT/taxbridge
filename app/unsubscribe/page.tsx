'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'not_found'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill email from query parameter
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else if (response.status === 404) {
        setStatus('not_found');
        setErrorMessage('Email address not found in our system');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to unsubscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Unsubscribe from TaxBridge Emails</CardTitle>
            <CardDescription className="text-base mt-2">
              We're sorry to see you go. You can unsubscribe from marketing emails below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Successfully Unsubscribed
                </h3>
                <p className="text-green-700">
                  <strong>{email}</strong> has been removed from our marketing email list.
                  You will no longer receive promotional emails from TaxBridge.
                </p>
                <p className="text-sm text-green-600 mt-4">
                  Note: You will still receive important account-related emails such as password resets
                  and tax calculation confirmations.
                </p>
              </div>
            ) : status === 'not_found' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Email Not Found
                </h3>
                <p className="text-yellow-700">
                  We couldn't find <strong>{email}</strong> in our system.
                  You may have already unsubscribed or used a different email address.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-base"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500">
                    Enter the email address you want to unsubscribe
                  </p>
                </div>

                {status === 'error' && errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-4 text-center text-sm text-gray-600">
            {status === 'success' ? (
              <div className="space-y-2">
                <p>Changed your mind?</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  size="sm"
                >
                  Return to Homepage
                </Button>
              </div>
            ) : (
              <>
                <p>
                  Having trouble? Contact us at{' '}
                  <a href="mailto:support@taxbridge.app" className="text-blue-600 hover:underline">
                    support@taxbridge.app
                  </a>
                </p>
                <div className="text-xs text-gray-500">
                  <a href="/privacy" className="hover:underline">Privacy Policy</a>
                  {' • '}
                  <a href="/terms" className="hover:underline">Terms of Service</a>
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
