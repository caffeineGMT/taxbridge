'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', message, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-emerald-400 animate-spin`} />
      {message && (
        <p className="text-sm text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div
          className="fixed inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
              repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
            `,
          }}
        />
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">
      {content}
    </div>
  );
}

// Skeleton loaders for specific components
export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-6 py-12 space-y-8 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-slate-800/50 border border-slate-700" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg bg-slate-900/50 border border-slate-800 p-6">
        <div className="h-6 w-48 bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="container mx-auto px-6 py-16 animate-pulse">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Input Card Skeleton */}
        <div className="h-96 rounded-lg bg-slate-900/50 border border-slate-800" />

        {/* Results Card Skeleton */}
        <div className="h-96 rounded-lg bg-gradient-to-br from-emerald-950/30 to-slate-900/50 border border-emerald-500/30" />
      </div>
    </div>
  );
}
