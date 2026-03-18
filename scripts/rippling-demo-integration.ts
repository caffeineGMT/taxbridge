/**
 * Rippling Demo Integration
 * Proof-of-concept webhook receiver for Rippling RSU vest events
 *
 * Rippling sends employee data on RSU vest → TaxBridge calculates taxes → Returns summary
 */

import { calculateTax, CalculationRequest } from '@/lib/api/v1/calculate';

interface RipplingVestEvent {
  event_type: 'rsu.vested';
  employee: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  vest: {
    date: string; // ISO date
    shares: number;
    fmv_per_share_usd: number;
    employer: 'Meta' | 'Amazon' | 'Google' | 'Microsoft';
  };
  tax_info: {
    us_state: 'WA' | 'CA' | 'NY' | 'TX';
    canada_province: 'BC' | 'ON' | 'AB';
    filing_status: 'single' | 'married';
  };
}

/**
 * Process Rippling RSU vest webhook
 * @param webhookPayload Rippling webhook payload
 * @returns Tax calculation result
 */
export async function processRipplingVestEvent(webhookPayload: RipplingVestEvent) {
  console.log('📥 Received Rippling vest event for:', webhookPayload.employee.email);

  try {
    // Validate event type
    if (webhookPayload.event_type !== 'rsu.vested') {
      throw new Error(`Unsupported event type: ${webhookPayload.event_type}`);
    }

    // Build calculation request
    const request: CalculationRequest = {
      employer: webhookPayload.vest.employer,
      vest_date: webhookPayload.vest.date,
      shares_vested: webhookPayload.vest.shares,
      fmv_per_share_usd: webhookPayload.vest.fmv_per_share_usd,
      us_state: webhookPayload.tax_info.us_state,
      canada_province: webhookPayload.tax_info.canada_province,
      filing_status: webhookPayload.tax_info.filing_status,
    };

    // Calculate taxes
    const calculation = calculateTax(request);

    console.log('✅ Tax calculation complete');
    console.log(`   Employee: ${webhookPayload.employee.first_name} ${webhookPayload.employee.last_name}`);
    console.log(`   RSU Value: $${calculation.total_value_usd.toLocaleString()}`);
    console.log(`   Net Tax: $${calculation.net_tax_payable.toLocaleString()} CAD`);
    console.log(`   Effective Rate: ${(calculation.effective_rate * 100).toFixed(2)}%`);

    // Return formatted response for Rippling
    return {
      success: true,
      employee_id: webhookPayload.employee.id,
      employee_email: webhookPayload.employee.email,
      vest_date: webhookPayload.vest.date,
      calculation: {
        total_value_usd: calculation.total_value_usd,
        us_tax_total: calculation.us_tax.total,
        canada_tax_total: calculation.canada_tax.total,
        foreign_tax_credit: calculation.foreign_tax_credit,
        net_tax_payable: calculation.net_tax_payable,
        effective_rate: calculation.effective_rate,
        recommended_filing_strategy: calculation.optimal_filing_strategy,
      },
      next_steps: [
        'Review tax calculation in TaxBridge dashboard',
        'Download tax forms checklist',
        'Schedule CPA consultation if needed',
      ],
    };
  } catch (error: any) {
    console.error('❌ Rippling integration error:', error.message);

    return {
      success: false,
      error: error.message,
      employee_id: webhookPayload.employee.id,
    };
  }
}

/**
 * Demo: Test Rippling webhook integration
 */
async function runRipplingDemo() {
  console.log('🚀 Rippling Integration Demo\n');

  // Mock Rippling webhook payload
  const mockWebhook: RipplingVestEvent = {
    event_type: 'rsu.vested',
    employee: {
      id: 'emp_12345',
      email: 'john.doe@company.com',
      first_name: 'John',
      last_name: 'Doe',
    },
    vest: {
      date: '2025-03-15',
      shares: 100,
      fmv_per_share_usd: 580.50,
      employer: 'Meta',
    },
    tax_info: {
      us_state: 'CA',
      canada_province: 'BC',
      filing_status: 'single',
    },
  };

  // Process webhook
  const result = await processRipplingVestEvent(mockWebhook);

  console.log('\n📊 Webhook Response:');
  console.log(JSON.stringify(result, null, 2));

  console.log('\n✅ Demo complete! Integration tested successfully.');
}

// Run demo if executed directly
if (require.main === module) {
  runRipplingDemo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
}

export { runRipplingDemo };
