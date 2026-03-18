import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaxBridge - US-Canada Cross-Border Tax Calculator',
  description: 'Simplify cross-border tax filing for H-1B/TN visa tech workers with US RSUs living in Canada',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#10b981', // Emerald-500
          colorBackground: '#020617', // Slate-950
          colorInputBackground: '#1e293b', // Slate-800
          colorInputText: '#f1f5f9', // Slate-100
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
