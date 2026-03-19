'use client';

import React from 'react';
import { DollarSign, TrendingUp, Gift, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CreditsSummary {
  current_balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  transactions_count: number;
}

interface CreditTransaction {
  id: number;
  amount: number;
  type: 'referral_reward' | 'referral_bonus' | 'payment_applied' | 'adjustment' | 'expiration';
  description: string;
  balance_after: number;
  created_at: number;
}

interface CreditsDashboardProps {
  summary: CreditsSummary;
  transactions: CreditTransaction[];
}

const typeLabels: Record<string, string> = {
  referral_reward: 'Referral Reward',
  referral_bonus: 'Bonus Credit',
  payment_applied: 'Applied to Payment',
  adjustment: 'Adjustment',
  expiration: 'Credit Expired',
};

const typeColors: Record<string, string> = {
  referral_reward: 'text-emerald-400',
  referral_bonus: 'text-blue-400',
  payment_applied: 'text-amber-400',
  adjustment: 'text-slate-400',
  expiration: 'text-red-400',
};

/**
 * Credits Dashboard Component
 * Shows user's credit balance, history, and stats
 */
export function CreditsDashboard({ summary, transactions }: CreditsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Credits Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-500/30 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Available Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              ${summary.current_balance.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Use towards your next subscription payment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Lifetime Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              ${summary.lifetime_earned.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {Math.floor(summary.lifetime_earned / 10)} successful referrals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Lifetime Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              ${summary.lifetime_spent.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Applied to payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Credit History</CardTitle>
          <CardDescription className="text-slate-400">
            Recent credit transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No credit transactions yet</p>
              <p className="text-sm mt-1">Start referring friends to earn credits!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${typeColors[tx.type] || 'text-white'}`}>
                        {typeLabels[tx.type] || tx.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {tx.description}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.created_at * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Balance: ${tx.balance_after.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How Credits Work */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">How Credits Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex gap-3">
              <div className="text-emerald-400 font-bold">1.</div>
              <div>
                <strong className="text-white">Earn $10 per referral:</strong> When a friend subscribes using your referral link, you get $10 credit instantly.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-emerald-400 font-bold">2.</div>
              <div>
                <strong className="text-white">Automatic application:</strong> Credits automatically apply to your next subscription payment.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-emerald-400 font-bold">3.</div>
              <div>
                <strong className="text-white">No expiration:</strong> Your credits never expire. Keep referring to build up a balance!
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-emerald-400 font-bold">4.</div>
              <div>
                <strong className="text-white">Stack up rewards:</strong> Refer 5 friends = Free year of Pro ($299 value)!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
