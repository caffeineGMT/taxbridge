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
    <div className={`w-full prevent-scroll ${className}`}>
      <div className="flex items-center justify-between overflow-x-auto scrollbar-hide pb-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex items-center flex-1 min-w-0">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all touch-target
                    ${isComplete ? 'bg-primary border-primary text-white' : ''}
                    ${isCurrent ? 'bg-primary/20 border-primary text-primary scale-110' : ''}
                    ${isUpcoming ? 'bg-background border-border text-textMuted' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${stepNumber}: ${step.label}${isComplete ? ' (completed)' : ''}${isCurrent ? ' (current)' : ''}`}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                <div className="mt-1 sm:mt-2 text-center min-w-[70px] sm:min-w-[90px] max-w-[100px] progress-step">
                  <div
                    className={`text-xs sm:text-sm font-medium progress-step-label truncate px-1 ${
                      isCurrent ? 'text-text' : isComplete ? 'text-textMuted' : 'text-textMuted'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="hidden sm:block text-xs text-textMuted mt-0.5 progress-step-description truncate px-1">{step.description}</div>
                  )}
                </div>
              </div>

              {/* Connector Line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-1 sm:mx-2 mb-6 sm:mb-8 transition-all min-w-[20px]
                    ${isComplete ? 'bg-primary' : 'bg-border'}
                  `}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
