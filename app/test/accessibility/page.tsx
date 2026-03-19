import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Test Page | TaxBridge',
  description: 'Test page for WCAG 2.1 AA compliance verification',
};

export default function AccessibilityTestPage() {
  return (
    <main id="main-content" className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-6">Accessibility Test Page</h1>

      <div className="space-y-12">
        {/* Color Contrast Examples */}
        <section aria-labelledby="contrast-heading">
          <h2 id="contrast-heading" className="text-2xl font-semibold mb-4">
            Color Contrast Tests
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-text">Normal text - should meet 4.5:1 ratio</p>
              <p className="text-textMuted">Muted text - should meet 4.5:1 ratio</p>
              <p className="text-primary font-semibold">Primary text - should meet 4.5:1 ratio</p>
              <p className="text-error">Error text - should meet 4.5:1 ratio</p>
              <p className="text-success">Success text - should meet 4.5:1 ratio</p>
            </div>
          </div>
        </section>

        {/* Keyboard Navigation */}
        <section aria-labelledby="keyboard-heading">
          <h2 id="keyboard-heading" className="text-2xl font-semibold mb-4">
            Keyboard Navigation Tests
          </h2>
          <div className="space-y-4">
            <button className="px-4 py-2 bg-primary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              Focusable Button
            </button>
            <button className="px-4 py-2 bg-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
              Another Button
            </button>
            <a
              href="#"
              className="inline-block px-4 py-2 bg-border text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Focusable Link
            </a>
          </div>
          <p className="mt-4 text-sm text-textMuted">
            Press Tab to navigate through elements. All should show visible focus indicators.
          </p>
        </section>

        {/* Touch Targets */}
        <section aria-labelledby="touch-heading">
          <h2 id="touch-heading" className="text-2xl font-semibold mb-4">
            Touch Target Size Tests (44x44px minimum)
          </h2>
          <div className="flex gap-4">
            <button
              className="min-h-[44px] min-w-[44px] p-2 bg-primary text-white rounded-lg"
              aria-label="Example icon button"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              className="min-h-[44px] px-4 bg-secondary text-white rounded-lg"
            >
              Text Button
            </button>
          </div>
          <p className="mt-4 text-sm text-textMuted">
            All interactive elements should be at least 44x44px for easy tapping.
          </p>
        </section>

        {/* ARIA Labels */}
        <section aria-labelledby="aria-heading">
          <h2 id="aria-heading" className="text-2xl font-semibold mb-4">
            ARIA Label Tests
          </h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                aria-describedby="email-hint"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
              <span id="email-hint" className="text-sm text-textMuted">
                We'll never share your email
              </span>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                aria-required="true"
                aria-invalid="false"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
        </section>

        {/* Live Regions */}
        <section aria-labelledby="live-heading">
          <h2 id="live-heading" className="text-2xl font-semibold mb-4">
            Live Region Tests
          </h2>
          <div className="space-y-4">
            <div role="status" aria-live="polite" className="p-4 bg-success/20 text-success rounded-lg">
              This is a polite announcement (doesn't interrupt screen reader)
            </div>
            <div role="alert" aria-live="assertive" className="p-4 bg-error/20 text-error rounded-lg">
              This is an assertive alert (interrupts screen reader immediately)
            </div>
          </div>
        </section>

        {/* Semantic HTML */}
        <section aria-labelledby="semantic-heading">
          <h2 id="semantic-heading" className="text-2xl font-semibold mb-4">
            Semantic HTML Tests
          </h2>
          <article className="p-4 bg-background border border-border rounded-lg">
            <header>
              <h3 className="text-lg font-semibold">Article Title</h3>
              <time dateTime="2026-03-19">March 19, 2026</time>
            </header>
            <p className="mt-2 text-textMuted">
              This is an example of semantic HTML using article, header, and time elements.
            </p>
          </article>
        </section>

        {/* Screen Reader Only Content */}
        <section aria-labelledby="sr-heading">
          <h2 id="sr-heading" className="text-2xl font-semibold mb-4">
            Screen Reader Only Content
          </h2>
          <div>
            <span className="sr-only">This text is hidden visually but announced by screen readers</span>
            <span>Visible text</span>
          </div>
          <p className="mt-2 text-sm text-textMuted">
            The hidden text above uses the "sr-only" class and is only readable by screen readers.
          </p>
        </section>
      </div>
    </main>
  );
}
