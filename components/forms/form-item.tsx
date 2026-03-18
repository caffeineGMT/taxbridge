'use client';

import { useState } from 'react';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import { TaxForm, getDeadlineUrgency } from '@/lib/forms/forms-data';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface FormItemProps {
  form: TaxForm;
  completed: boolean;
  onToggle: (formCode: string) => Promise<void>;
}

export function FormItem({ form, completed, onToggle }: FormItemProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      await onToggle(form.code);
      setIsCompleted(!isCompleted);
    } catch (error) {
      console.error('Failed to toggle form completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const urgency = getDeadlineUrgency(form.deadline);
  const deadlineBadgeColor =
    urgency === 'past'
      ? 'bg-red-500/10 text-red-400 border-red-500/20'
      : urgency === 'urgent'
      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  return (
    <AccordionItem value={form.code} className="border-border">
      <AccordionTrigger className="hover:no-underline group">
        <div className="flex items-center gap-3 flex-1">
          <div onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={handleCheckboxChange}
                disabled={isLoading}
                className="sr-only"
              />
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-text-secondary group-hover:text-text transition-colors" />
              )}
            </label>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className={`font-semibold ${isCompleted ? 'text-text-secondary line-through' : 'text-text'}`}>
              {form.name}
            </span>
            <span className="text-xs text-text-secondary font-normal">
              {form.country === 'US' ? 'United States' : 'Canada'}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-8 space-y-3">
          <p className="text-text-secondary text-sm leading-relaxed">
            {form.purpose}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${deadlineBadgeColor}`}>
              Due: {form.deadline}
            </div>
            <a
              href={form.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Official PDF</span>
            </a>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
