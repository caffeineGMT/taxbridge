import { formCompletionQueries } from '@/lib/queries';
import { TAX_FORMS } from '@/lib/forms/forms-data';
import { FormsChecklistClient } from './forms-checklist-client';

export default function FormsChecklistPage() {
  // For MVP, we'll use user_id = 1 as default user
  const userId = 1;

  // Fetch completion status from database
  const completionStatus = formCompletionQueries.getStatus(userId);

  // Calculate progress
  const completedCount = Object.values(completionStatus).filter(
    (status) => status.completed
  ).length;
  const totalCount = TAX_FORMS.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">Tax Forms Checklist</h1>
          <p className="text-text-secondary text-lg">
            Track your required tax forms for US-Canada cross-border filing
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text font-semibold">Overall Progress</span>
            <span className="text-text-secondary">
              {completedCount} of {totalCount} forms completed
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-success to-primary h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-2xl font-bold text-success">{progress}%</span>
          </div>
        </div>

        {/* Forms Checklist */}
        <FormsChecklistClient initialCompletionStatus={completionStatus} />

        {/* Help Text */}
        <div className="mt-8 bg-surface/50 rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-text mb-3">About These Forms</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              <strong className="text-text">Article XV</strong> of the US-Canada tax treaty allows you to avoid double taxation on employment income. Form 8833 is crucial for claiming this benefit.
            </p>
            <p>
              <strong className="text-text">FBAR (FinCEN 114)</strong> is required if you have foreign financial accounts exceeding $10,000 at any time during the year.
            </p>
            <p>
              <strong className="text-text">Form 8938</strong> has higher thresholds than FBAR but may still apply depending on your foreign asset values.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
