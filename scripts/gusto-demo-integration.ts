/**
 * Gusto API Integration Demo
 * Fetch employee equity grants and calculate taxes using TaxBridge API
 *
 * Gusto API: https://docs.gusto.com/
 * Requires: GUSTO_API_TOKEN environment variable
 */

import { calculateTax, CalculationRequest } from '@/lib/api/v1/calculate';

interface GustoEmployee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  work_location: {
    state: string;
    country: string;
  };
}

interface GustoEquityGrant {
  id: string;
  employee_id: string;
  grant_date: string;
  vesting_schedule: {
    vest_date: string;
    shares: number;
  }[];
  company: {
    name: string; // e.g., "Meta", "Amazon", "Google", "Microsoft"
  };
}

/**
 * Fetch employees from Gusto API
 * @param companyId Gusto company ID
 * @returns List of employees
 */
async function fetchGustoEmployees(companyId: string): Promise<GustoEmployee[]> {
  const apiToken = process.env.GUSTO_API_TOKEN;

  if (!apiToken) {
    console.warn('⚠️  GUSTO_API_TOKEN not set. Using mock data for demo.');
    return getMockEmployees();
  }

  // Real API call (commented out for demo)
  /*
  const response = await fetch(`https://api.gusto.com/v1/companies/${companyId}/employees`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gusto API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.employees;
  */

  return getMockEmployees();
}

/**
 * Fetch equity grants from Gusto API
 * @param companyId Gusto company ID
 * @returns List of equity grants
 */
async function fetchGustoEquityGrants(companyId: string): Promise<GustoEquityGrant[]> {
  const apiToken = process.env.GUSTO_API_TOKEN;

  if (!apiToken) {
    console.warn('⚠️  GUSTO_API_TOKEN not set. Using mock data for demo.');
    return getMockEquityGrants();
  }

  // Real API call (commented out for demo)
  /*
  const response = await fetch(`https://api.gusto.com/v1/companies/${companyId}/equity_grants`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gusto API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.equity_grants;
  */

  return getMockEquityGrants();
}

/**
 * Calculate taxes for all employees with upcoming vests
 */
async function calculateEmployeeTaxes(companyId: string) {
  console.log('🚀 Gusto Integration: Fetching employee data...\n');

  // Fetch employees and equity grants
  const employees = await fetchGustoEmployees(companyId);
  const equityGrants = await fetchGustoEquityGrants(companyId);

  console.log(`✅ Found ${employees.length} employees`);
  console.log(`✅ Found ${equityGrants.length} equity grants\n`);

  const results = [];

  // Process each employee with equity grants
  for (const employee of employees) {
    const employeeGrants = equityGrants.filter((g) => g.employee_id === employee.id);

    if (employeeGrants.length === 0) {
      continue;
    }

    console.log(`📊 Processing ${employee.first_name} ${employee.last_name} (${employee.email})`);

    for (const grant of employeeGrants) {
      for (const vest of grant.vesting_schedule) {
        const vestDate = new Date(vest.vest_date);
        const today = new Date();

        // Only process upcoming vests (next 90 days)
        const daysUntilVest = Math.floor((vestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilVest < 0 || daysUntilVest > 90) {
          continue;
        }

        // Build calculation request (using demo values for FMV and provinces)
        const request: CalculationRequest = {
          employer: mapCompanyNameToEmployer(grant.company.name),
          vest_date: vest.vest_date,
          shares_vested: vest.shares,
          fmv_per_share_usd: getFairMarketValue(grant.company.name), // Mock FMV
          us_state: mapStateCode(employee.work_location.state),
          canada_province: 'BC', // Would come from employee profile in production
          filing_status: 'single', // Would come from employee profile in production
        };

        try {
          const calculation = calculateTax(request);

          console.log(`   ✅ Vest on ${vest.vest_date}: ${vest.shares} shares = $${calculation.total_value_usd.toLocaleString()}`);
          console.log(`      Net tax: $${calculation.net_tax_payable.toLocaleString()} CAD (${(calculation.effective_rate * 100).toFixed(2)}%)`);

          results.push({
            employee,
            grant,
            vest,
            calculation,
          });
        } catch (error: any) {
          console.error(`   ❌ Calculation failed: ${error.message}`);
        }
      }
    }

    console.log('');
  }

  return results;
}

/**
 * Generate tax report for all employees
 */
async function generateTaxReport(companyId: string) {
  const results = await calculateEmployeeTaxes(companyId);

  console.log('📈 Tax Report Summary\n');
  console.log('='.repeat(80));

  let totalRsuValue = 0;
  let totalTaxOwed = 0;

  results.forEach((result, index) => {
    totalRsuValue += result.calculation.total_value_usd;
    totalTaxOwed += result.calculation.net_tax_payable;

    console.log(`${index + 1}. ${result.employee.first_name} ${result.employee.last_name}`);
    console.log(`   Email: ${result.employee.email}`);
    console.log(`   Vest Date: ${result.vest.vest_date}`);
    console.log(`   RSU Value: $${result.calculation.total_value_usd.toLocaleString()}`);
    console.log(`   Net Tax: $${result.calculation.net_tax_payable.toLocaleString()} CAD`);
    console.log(`   Effective Rate: ${(result.calculation.effective_rate * 100).toFixed(2)}%`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`Total RSU Value: $${totalRsuValue.toLocaleString()}`);
  console.log(`Total Tax Owed: $${totalTaxOwed.toLocaleString()} CAD`);
  console.log(`Average Effective Rate: ${((totalTaxOwed / totalRsuValue) * 100).toFixed(2)}%`);
  console.log('='.repeat(80));

  return results;
}

// Mock data helpers
function getMockEmployees(): GustoEmployee[] {
  return [
    {
      id: 'emp_001',
      email: 'alice.smith@company.com',
      first_name: 'Alice',
      last_name: 'Smith',
      work_location: { state: 'CA', country: 'US' },
    },
    {
      id: 'emp_002',
      email: 'bob.jones@company.com',
      first_name: 'Bob',
      last_name: 'Jones',
      work_location: { state: 'WA', country: 'US' },
    },
    {
      id: 'emp_003',
      email: 'carol.davis@company.com',
      first_name: 'Carol',
      last_name: 'Davis',
      work_location: { state: 'NY', country: 'US' },
    },
  ];
}

function getMockEquityGrants(): GustoEquityGrant[] {
  const today = new Date();
  const futureDate1 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const futureDate2 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days

  return [
    {
      id: 'grant_001',
      employee_id: 'emp_001',
      grant_date: '2024-01-15',
      company: { name: 'Meta' },
      vesting_schedule: [
        { vest_date: futureDate1.toISOString().split('T')[0], shares: 100 },
      ],
    },
    {
      id: 'grant_002',
      employee_id: 'emp_002',
      grant_date: '2024-02-15',
      company: { name: 'Amazon' },
      vesting_schedule: [
        { vest_date: futureDate2.toISOString().split('T')[0], shares: 150 },
      ],
    },
    {
      id: 'grant_003',
      employee_id: 'emp_003',
      grant_date: '2024-03-15',
      company: { name: 'Google' },
      vesting_schedule: [
        { vest_date: futureDate1.toISOString().split('T')[0], shares: 80 },
      ],
    },
  ];
}

function mapCompanyNameToEmployer(companyName: string): 'Meta' | 'Amazon' | 'Google' | 'Microsoft' {
  const normalized = companyName.toLowerCase();
  if (normalized.includes('meta')) return 'Meta';
  if (normalized.includes('amazon')) return 'Amazon';
  if (normalized.includes('google')) return 'Google';
  if (normalized.includes('microsoft')) return 'Microsoft';
  return 'Meta'; // Default
}

function mapStateCode(state: string): 'WA' | 'CA' | 'NY' | 'TX' {
  const validStates = ['WA', 'CA', 'NY', 'TX'];
  const normalized = state.toUpperCase();
  return validStates.includes(normalized) ? (normalized as any) : 'CA';
}

function getFairMarketValue(companyName: string): number {
  // Mock FMV (would come from real-time stock API in production)
  const fmvMap: Record<string, number> = {
    Meta: 580.50,
    Amazon: 195.75,
    Google: 175.25,
    Microsoft: 420.80,
  };

  return fmvMap[companyName] || 500.0;
}

/**
 * Run Gusto integration demo
 */
async function runGustoDemo() {
  console.log('🚀 Gusto Integration Demo\n');

  const companyId = 'demo_company_123';
  const results = await generateTaxReport(companyId);

  console.log(`\n✅ Demo complete! Processed ${results.length} upcoming vests.`);
}

// Run demo if executed directly
if (require.main === module) {
  runGustoDemo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
}

export { runGustoDemo, calculateEmployeeTaxes, generateTaxReport };
