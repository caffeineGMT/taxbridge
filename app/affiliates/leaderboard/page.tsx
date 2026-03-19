/**
 * Affiliate Leaderboard Page
 * Public page showing top-performing affiliates
 * Route: /affiliates/leaderboard
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy, Medal, TrendingUp, Users, DollarSign,
  Crown, ArrowRight, Loader2
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  partner_name: string;
  firm_name: string;
  platform: string;
  tier: string;
  referral_count: number;
  conversion_count: number;
  commission_earned: number;
  bonus_earned: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async (selectedMonth?: string) => {
    setLoading(true);
    try {
      const params = selectedMonth ? `?month=${selectedMonth}` : '';
      const res = await fetch(`/api/affiliates/leaderboard${params}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setMonth(data.month);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-900/30 to-yellow-700/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-slate-700/30 to-slate-600/10 border-slate-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-900/30 to-amber-700/10 border-amber-600/30';
    return 'bg-slate-800/40 border-slate-700/50';
  };

  const getBonusLabel = (rank: number) => {
    if (rank === 1) return '$500 bonus';
    if (rank === 2) return '$250 bonus';
    if (rank === 3) return '$100 bonus';
    return null;
  };

  const formatMonth = (m: string) => {
    const [year, mo] = m.split('-');
    const date = new Date(parseInt(year), parseInt(mo) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold text-white">Affiliate Leaderboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/affiliates')}
              className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Become an Affiliate
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-full text-sm mb-4">
            <Trophy className="w-4 h-4" />
            Monthly Competition
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Top Affiliates - {month ? formatMonth(month) : ''}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Our top-performing affiliates. #1 earns a $500 bonus, #2 gets $250, #3 gets $100.
            <br />Join the program and compete!
          </p>
        </div>

        {/* Bonus Cards */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          {[
            { place: '1st', bonus: '$500', color: 'from-yellow-600 to-yellow-400', icon: Crown },
            { place: '2nd', bonus: '$250', color: 'from-slate-500 to-slate-300', icon: Medal },
            { place: '3rd', bonus: '$100', color: 'from-amber-700 to-amber-500', icon: Medal },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className={`bg-gradient-to-b ${item.color} rounded-xl p-4 mb-2`}>
                <item.icon className="w-8 h-8 text-white mx-auto mb-1" />
                <div className="text-white font-bold text-lg">{item.place}</div>
              </div>
              <div className="text-white font-bold">{item.bonus}</div>
              <div className="text-slate-500 text-xs">Monthly Bonus</div>
            </div>
          ))}
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Leaderboard Data Yet</h3>
            <p className="text-slate-500 mb-6">Be the first affiliate to earn a spot on the leaderboard!</p>
            <button
              onClick={() => router.push('/affiliates')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Join the Program <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 border rounded-xl p-5 transition-all ${getRankBg(entry.rank)}`}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{entry.firm_name}</span>
                    {entry.tier === 'elite' && (
                      <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">Elite</span>
                    )}
                    {entry.tier === 'premium' && (
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">Premium</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {entry.partner_name} {entry.platform ? `- ${entry.platform}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right flex-shrink-0">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-slate-300">
                      <Users className="w-3 h-3" />
                      {entry.referral_count}
                    </div>
                    <div className="text-xs text-slate-500">referrals</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-emerald-400 font-semibold">
                      <DollarSign className="w-3 h-3" />
                      {entry.commission_earned.toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-500">earned</div>
                  </div>
                  {getBonusLabel(entry.rank) && (
                    <div className="bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
                      {getBonusLabel(entry.rank)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="max-w-xl mx-auto bg-slate-800/60 border border-slate-700 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">Want to be on this leaderboard?</h3>
            <p className="text-slate-400 mb-6">
              Join the TaxBridge Affiliate Program and earn 30% recurring commission
              on every referral. Top performers earn monthly bonuses.
            </p>
            <button
              onClick={() => router.push('/affiliates')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-colors inline-flex items-center gap-2"
            >
              Apply Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
