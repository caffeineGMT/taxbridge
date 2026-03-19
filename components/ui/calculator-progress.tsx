'use client';

import { Check } from 'lucide-react';

interface ProgressStep {
  label: string;
  description?: string;
}

interface CalculatorProgressProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

export function CalculatorProgress({ steps, currentStep, className = '' }: CalculatorProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${isComplete ? 'bg-primary border-primary text-white' : ''}
                    ${isCurrent ? 'bg-primary/20 border-primary text-primary scale-110' : ''}
                    ${isUpcoming ? 'bg-background border-border text-textMuted' : ''}
                  `}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                <div className="mt-2 text-center min-w-[100px]">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-text' : isComplete ? 'text-textMuted' : 'text-textMuted'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-textMuted mt-0.5">{step.description}</div>
                  )}
                </div>
              </div>

              {/* Connector Line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 mb-8 transition-all
                    ${isComplete ? 'bg-primary' : 'bg-border'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
