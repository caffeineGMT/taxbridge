'use client';

import { useEffect, Suspense } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/app/tour.css';
import { useSearchParams } from 'next/navigation';

const tourSteps = [
  {
    element: 'body',
    popover: {
      title: 'Welcome to Your TaxBridge Dashboard! 🎉',
      description:
        "Let's take a quick tour of the key features that will help you manage your cross-border tax situation.",
    },
  },
  {
    element: '[data-tour="stats-cards"]',
    popover: {
      title: 'Overview Stats',
      description:
        'See your total RSU income, estimated US and Canada taxes at a glance. These update automatically as you add vesting events.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="quick-actions"]',
    popover: {
      title: 'Quick Actions',
      description:
        'Access common tasks like adding new RSU entries, viewing tax calculations, and checking your required forms.',
      side: 'left' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="rsu-list"]',
    popover: {
      title: 'RSU Vesting Events',
      description:
        'All your RSU vesting events are tracked here. Click on any entry to see detailed tax calculations including Foreign Tax Credit optimization.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="add-rsu"]',
    popover: {
      title: 'Add RSU Entry',
      description:
        'Click here to manually add a new RSU vesting event. You can also import from W-2 forms or CSV files for bulk entry.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="tax-calculator"]',
    popover: {
      title: 'Tax Calculator',
      description:
        'Run detailed tax scenarios including Foreign Tax Credit calculations to understand your dual-country tax obligations.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="forms-checklist"]',
    popover: {
      title: 'Forms Checklist',
      description:
        'Access your personalized checklist of required tax forms (W-2, 1040/1040-NR, T1, T4, FBAR, Form 8938, Form 8833).',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'body',
    popover: {
      title: "You're All Set! 🚀",
      description:
        "You now know the basics of TaxBridge. Feel free to explore and manage your cross-border tax situation with confidence. You can restart this tour anytime from your account settings.",
    },
  },
];

function TourContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const shouldStartTour = searchParams.get('tour') === 'start';

    if (shouldStartTour) {
      // Small delay to ensure DOM elements are rendered
      setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          steps: tourSteps,
          popoverClass: 'taxbridge-tour',
          progressText: '{{current}} of {{total}}',
          nextBtnText: 'Next',
          prevBtnText: 'Back',
          doneBtnText: 'Finish',
          onDestroyed: () => {
            // Remove tour param from URL without refresh
            const url = new URL(window.location.href);
            url.searchParams.delete('tour');
            window.history.replaceState({}, '', url.toString());
          },
        });

        driverObj.drive();
      }, 500);
    }
  }, [searchParams]);

  return null;
}

export function DashboardTour() {
  return (
    <Suspense fallback={null}>
      <TourContent />
    </Suspense>
  );
}
