'use client';

import { useState } from 'react';
import { FormsChecklist } from '@/components/forms/forms-checklist';
import { FormCompletionStatus } from '@/lib/queries';

interface FormsChecklistClientProps {
  initialCompletionStatus: Record<string, FormCompletionStatus>;
}

export function FormsChecklistClient({ initialCompletionStatus }: FormsChecklistClientProps) {
  const [completionStatus, setCompletionStatus] = useState(initialCompletionStatus);

  const handleToggle = async (formCode: string) => {
    try {
      const response = await fetch('/api/forms/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle form completion');
      }

      const { data } = await response.json();

      // Update local state
      setCompletionStatus((prev) => ({
        ...prev,
        [formCode]: data,
      }));
    } catch (error) {
      console.error('Error toggling form:', error);
      // Could add toast notification here
    }
  };

  return <FormsChecklist completionStatus={completionStatus} onToggle={handleToggle} />;
}
