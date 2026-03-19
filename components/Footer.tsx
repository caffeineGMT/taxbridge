import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-emerald-500 mb-4">TaxBridge</div>
            <p className="text-sm text-slate-400">
              Cross-border tax calculations made simple for tech workers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@taxbridge.app"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:privacy@taxbridge.app"
                  className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Privacy Inquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} TaxBridge. Built for tech workers navigating cross-border taxation.</p>
            <p className="text-slate-600 text-xs">
              Tax estimates only. Not a substitute for professional advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
