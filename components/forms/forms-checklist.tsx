'use client';

import { Accordion } from '@/components/ui/accordion';
import { FormItem } from './form-item';
import { getFormsGroupedByCountry } from '@/lib/forms/forms-data';
import { FormCompletionStatus } from '@/lib/queries';

interface FormsChecklistProps {
  completionStatus: Record<string, FormCompletionStatus>;
  onToggle: (formCode: string) => Promise<void>;
}

export function FormsChecklist({ completionStatus, onToggle }: FormsChecklistProps) {
  const { us, canada } = getFormsGroupedByCountry();

  return (
    <div className="space-y-8">
      {/* US Tax Forms Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-accent rounded-full"></div>
          <h2 className="text-2xl font-bold text-text">US Tax Forms</h2>
          <span className="text-sm text-text-secondary">
            ({us.length} forms)
          </span>
        </div>
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <Accordion type="multiple" className="w-full">
            {us.map((form) => (
              <FormItem
                key={form.code}
                form={form}
                completed={completionStatus[form.code]?.completed || false}
                onToggle={onToggle}
              />
            ))}
          </Accordion>
        </div>
      </div>

      {/* Canadian Tax Forms Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-error rounded-full"></div>
          <h2 className="text-2xl font-bold text-text">Canadian Tax Forms</h2>
          <span className="text-sm text-text-secondary">
            ({canada.length} forms)
          </span>
        </div>
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <Accordion type="multiple" className="w-full">
            {canada.map((form) => (
              <FormItem
                key={form.code}
                form={form}
                completed={completionStatus[form.code]?.completed || false}
                onToggle={onToggle}
              />
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
