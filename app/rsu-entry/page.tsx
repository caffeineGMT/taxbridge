import { RSUEntryForm } from '@/components/rsu/rsu-entry-form';

export default function RSUEntryPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text mb-2">TaxBridge</h1>
          <p className="text-text-secondary">US-Canada Cross-Border Tax Calculator</p>
        </div>
        <RSUEntryForm />
      </div>
    </main>
  );
}
