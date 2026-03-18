import Link from 'next/link';
import { Home, DollarSign, Calculator, FileText } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TaxBridge
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" icon={<Home className="w-4 h-4" />}>
              Home
            </NavLink>
            <NavLink href="/rsu-entry" icon={<DollarSign className="w-4 h-4" />}>
              RSU Entry
            </NavLink>
            <NavLink href="/calculator" icon={<Calculator className="w-4 h-4" />}>
              Calculator
            </NavLink>
            <NavLink href="/forms-checklist" icon={<FileText className="w-4 h-4" />}>
              Forms
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon,
  children
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 relative group"
    >
      {icon}
      <span>{children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
    </Link>
  );
}
