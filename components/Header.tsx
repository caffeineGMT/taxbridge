import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Home, DollarSign, Calculator, FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
            TaxBridge
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/rsu-entry"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Add RSU
          </Link>
          <Link
            href="/calculator"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            Calculator
          </Link>
          <Link
            href="/forms-checklist"
            className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Forms
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
                userButtonPopoverCard: 'bg-slate-900 border border-slate-800',
                userButtonPopoverActions: 'text-slate-100',
                userButtonPopoverActionButton: 'hover:bg-slate-800',
                userButtonPopoverFooter: 'hidden',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
