import Link from 'next/link';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-emerald-500">TaxBridge</div>
              </Link>
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link
                  href="/us-canada-tax-calculator"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Calculator
                </Link>
                <Link
                  href="/h1b-rsu-tax-guide"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Guide
                </Link>
                <Link
                  href="/canada-tax-filing-checklist"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Checklist
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-slate-950 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main>{children}</main>

          {/* Footer */}
          <footer className="border-t border-slate-800 bg-slate-950/50">
            <div className="container mx-auto px-6 py-12">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-2 md:col-span-1">
                  <div className="text-2xl font-bold text-emerald-500 mb-4">TaxBridge</div>
                  <p className="text-sm text-slate-400">
                    Cross-border tax calculations made simple for tech workers.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100 mb-4">Product</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/us-canada-tax-calculator"
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        Tax Calculator
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard"
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        Dashboard
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100 mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/h1b-rsu-tax-guide"
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        Tax Guide
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/canada-tax-filing-checklist"
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        Filing Checklist
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
              </div>

              <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} TaxBridge. Built for tech workers navigating cross-border taxation.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
