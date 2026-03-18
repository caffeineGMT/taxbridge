import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">TaxBridge</h1>
          <p className="text-slate-400">US-Canada Cross-Border Tax Calculator</p>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white',
              card: 'bg-slate-900 border border-slate-800',
              headerTitle: 'text-slate-100',
              headerSubtitle: 'text-slate-400',
              socialButtonsBlockButton: 'border-slate-700 hover:bg-slate-800',
              formFieldLabel: 'text-slate-300',
              formFieldInput: 'bg-slate-800 border-slate-700 text-slate-100',
              footerActionLink: 'text-emerald-500 hover:text-emerald-400',
            },
          }}
        />
      </div>
    </div>
  );
}
