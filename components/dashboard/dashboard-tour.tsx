'use client';

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useSearchParams } from 'next/navigation';

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Welcome to Your TaxBridge Dashboard! 🎉</h3>
        <p className="text-sm">
          Let's take a quick tour of the key features that will help you manage your cross-border
          tax situation.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-cards"]',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Overview Stats</h3>
        <p className="text-sm">
          See your total RSU income, estimated US and Canada taxes at a glance. These update
          automatically as you add vesting events.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="quick-actions"]',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
        <p className="text-sm">
          Access common tasks like adding new RSU entries, viewing tax calculations, and checking
          your required forms.
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="rsu-list"]',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">RSU Vesting Events</h3>
        <p className="text-sm">
          All your RSU vesting events are tracked here. Click on any entry to see detailed tax
          calculations including Foreign Tax Credit optimization.
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="add-rsu"]',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Add RSU Entry</h3>
        <p className="text-sm">
          Click here to manually add a new RSU vesting event. You can also import from W-2 forms or
          CSV files for bulk entry.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="tax-calculator"]',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Tax Calculator</h3>
        <p className="text-sm">
          Run detailed tax scenarios including Foreign Tax Credit calculations to understand your
          dual-country tax obligations.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="forms-checklist"]',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">Forms Checklist</h3>
        <p className="text-sm">
          Access your personalized checklist of required tax forms (W-2, 1040/1040-NR, T1, T4,
          FBAR, Form 8938, Form 8833).
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: 'body',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">You're All Set! 🚀</h3>
        <p className="text-sm mb-3">
          You now know the basics of TaxBridge. Feel free to explore and manage your cross-border
          tax situation with confidence.
        </p>
        <p className="text-xs text-slate-400">
          You can restart this tour anytime from your account settings.
        </p>
      </div>
    ),
    placement: 'center',
  },
];

export function DashboardTour() {
  const searchParams = useSearchParams();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Start tour if 'tour=start' query param is present
    const shouldStartTour = searchParams.get('tour') === 'start';
    if (shouldStartTour) {
      // Small delay to ensure DOM elements are rendered
      setTimeout(() => {
        setRun(true);
      }, 500);
    }
  }, [searchParams]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Remove tour param from URL without refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('tour');
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10b981', // emerald-500
          zIndex: 10000,
          arrowColor: '#1e293b', // slate-800
          backgroundColor: '#1e293b',
          textColor: '#f1f5f9',
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#10b981',
          fontSize: 14,
          padding: '8px 16px',
          borderRadius: 6,
        },
        buttonBack: {
          color: '#94a3b8',
          fontSize: 14,
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: 14,
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}
