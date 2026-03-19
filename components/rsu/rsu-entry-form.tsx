'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { RSUEventSchema } from '@/lib/types';
import { SUPPORTED_EMPLOYERS } from '@/lib/employers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Popover } from '@/components/ui/popover';
import { z } from 'zod';
import UpgradeModal from '@/components/UpgradeModal';

const US_STATES = [
  { value: 'WA', label: 'Washington' },
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

const CANADA_PROVINCES = [
  { value: 'BC', label: 'British Columbia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'AB', label: 'Alberta' },
  { value: 'QC', label: 'Quebec' },
];

// Simplified form schema - using basic types instead of enum for canadaProvince
const FormSchema = z.object({
  employer: z.string().min(1, 'Employer required'),
  tickerSymbol: z.string().min(1, 'Ticker symbol required').max(10),
  vestingDate: z.string(),
  shares: z.number().positive('Shares must be positive').max(1000000),
  fmvUsd: z.number().positive('FMV must be positive').max(100000),
  totalValueUsd: z.number(),
  usState: z.string().min(2).max(2),
  canadaProvince: z.string().min(2).max(2),
});

type RSUFormData = z.infer<typeof FormSchema>;

export function RSUEntryForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [upgradeInfo, setUpgradeInfo] = React.useState<{ currentCount: number; limit: number } | null>(null);

  const form = useForm<RSUFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      employer: '',
      tickerSymbol: '',
      vestingDate: '',
      shares: 0,
      fmvUsd: 0,
      totalValueUsd: 0,
      usState: 'WA',
      canadaProvince: 'BC',
    },
  });

  const shares = form.watch('shares');
  const fmvUsd = form.watch('fmvUsd');
  const selectedEmployer = form.watch('employer');

  React.useEffect(() => {
    const total = (shares || 0) * (fmvUsd || 0);
    form.setValue('totalValueUsd', total);
  }, [shares, fmvUsd, form]);

  React.useEffect(() => {
    const employer = SUPPORTED_EMPLOYERS.find((e) => e.value === selectedEmployer);
    if (employer) {
      form.setValue('tickerSymbol', employer.ticker);
    }
  }, [selectedEmployer, form]);

  const onSubmit = async (data: RSUFormData) => {
    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch('/api/rsu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check if it's a subscription limit error
        if (response.status === 403 && result.upgradeRequired) {
          setUpgradeInfo({
            currentCount: result.currentCount,
            limit: result.limit,
          });
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(result.error || 'Failed to save RSU event');
      }

      setToast({ type: 'success', message: 'RSU event saved successfully!' });
      form.reset();
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="unlimited RSU entries"
        currentCount={upgradeInfo?.currentCount}
        limit={upgradeInfo?.limit}
      />

      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={cn(
            'mb-4 p-4 rounded-md',
            toast.type === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
          )}
        >
          {toast.message}
        </div>
      )}

      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">RSU Vesting Entry</CardTitle>
          <CardDescription className="text-text-secondary">
            Enter your RSU vesting details for tax calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as any}
                  name="vestingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Vesting Date</FormLabel>
                      <Popover
                        trigger={
                          <Button
                            variant="outline"
                            aria-label={field.value ? `Vesting date: ${format(new Date(field.value), 'PPP')}. Click to change` : 'Pick a vesting date'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                            {field.value ? format(new Date(field.value), 'PPP') : 'Pick a date'}
                          </Button>
                        }
                      >
                        <Calendar
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        />
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="fmvUsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fair Market Value (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="450.50"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Shares</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="employer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          <option value="">Select employer</option>
                          {SUPPORTED_EMPLOYERS.map((employer) => (
                            <option key={employer.value} value={employer.value}>
                              {employer.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="usState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>US State</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          {US_STATES.map((state) => (
                            <option key={state.value} value={state.value}>
                              {state.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="canadaProvince"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canada Province</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          {CANADA_PROVINCES.map((province) => (
                            <option key={province.value} value={province.value}>
                              {province.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-6 bg-background rounded-lg border border-primary/20" aria-live="polite">
                <div className="text-sm text-text-secondary mb-1">Total Value</div>
                <div className="text-3xl font-bold text-primary">
                  ${form.watch('totalValueUsd').toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? 'Saving...' : 'Save RSU Event'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
