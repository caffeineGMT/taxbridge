/**
 * Tax Forms API (v1)
 * Return required tax forms based on user's situation
 */

export interface FormRequirement {
  form: string;
  description: string;
  country: 'US' | 'CA';
  required: boolean;
  deadline: string;
  pdf_url?: string;
}

export interface FormsRequest {
  country?: 'US' | 'CA' | 'both';
  province?: 'BC' | 'ON' | 'AB';
  state?: 'WA' | 'CA' | 'NY' | 'TX';
  has_rsu: boolean;
  has_foreign_accounts?: boolean;
}

export interface FormsResponse {
  forms: FormRequirement[];
  total_count: number;
}

/**
 * Get required tax forms based on user's situation
 */
export function getRequiredForms(request: FormsRequest): FormsResponse {
  const forms: FormRequirement[] = [];

  // US Forms (if applicable)
  if (!request.country || request.country === 'US' || request.country === 'both') {
    // W-2 (always required for US employment income)
    forms.push({
      form: 'W-2',
      description: 'Wage and Tax Statement',
      country: 'US',
      required: true,
      deadline: 'January 31 (issued by employer)',
      pdf_url: 'https://www.irs.gov/pub/irs-pdf/fw2.pdf',
    });

    // 1040 or 1040-NR
    forms.push({
      form: '1040/1040-NR',
      description: 'US Individual Income Tax Return',
      country: 'US',
      required: true,
      deadline: 'April 15',
      pdf_url: 'https://www.irs.gov/pub/irs-pdf/f1040.pdf',
    });

    // Form 8833 (Treaty-Based Return Position)
    if (request.has_rsu) {
      forms.push({
        form: '8833',
        description: 'Treaty-Based Return Position Disclosure (claim Article XV benefits)',
        country: 'US',
        required: true,
        deadline: 'April 15',
        pdf_url: 'https://www.irs.gov/pub/irs-pdf/f8833.pdf',
      });
    }

    // FBAR (Foreign Bank Account Report)
    if (request.has_foreign_accounts) {
      forms.push({
        form: 'FBAR',
        description: 'Report of Foreign Bank and Financial Accounts ($10K+ threshold)',
        country: 'US',
        required: true,
        deadline: 'April 15 (auto-extension to October 15)',
        pdf_url: 'https://www.fincen.gov/sites/default/files/shared/FBAR%20Line%20Item%20Filing%20Instructions.pdf',
      });
    }

    // Form 8938 (Foreign Financial Assets)
    if (request.has_foreign_accounts && request.has_rsu) {
      forms.push({
        form: '8938',
        description: 'Statement of Specified Foreign Financial Assets',
        country: 'US',
        required: false, // Optional depending on threshold
        deadline: 'April 15',
        pdf_url: 'https://www.irs.gov/pub/irs-pdf/f8938.pdf',
      });
    }
  }

  // Canadian Forms (if applicable)
  if (!request.country || request.country === 'CA' || request.country === 'both') {
    // T1 General
    forms.push({
      form: 'T1',
      description: 'Canadian Income Tax and Benefit Return',
      country: 'CA',
      required: true,
      deadline: 'April 30',
      pdf_url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package.html',
    });

    // T4 (if employed in Canada)
    forms.push({
      form: 'T4',
      description: 'Statement of Remuneration Paid (Canadian employment income)',
      country: 'CA',
      required: false,
      deadline: 'February 28 (issued by employer)',
      pdf_url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t4.html',
    });

    // T2209 (Federal Foreign Tax Credit)
    if (request.has_rsu) {
      forms.push({
        form: 'T2209',
        description: 'Federal Foreign Tax Credits (claim credit for US taxes paid)',
        country: 'CA',
        required: true,
        deadline: 'April 30',
        pdf_url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2209.html',
      });
    }

    // Provincial Foreign Tax Credit Form
    if (request.province && request.has_rsu) {
      const provincialForm = getProvincialFTCForm(request.province);
      if (provincialForm) {
        forms.push(provincialForm);
      }
    }
  }

  return {
    forms: forms.sort((a, b) => {
      // Sort by country (US first), then by required status
      if (a.country !== b.country) {
        return a.country === 'US' ? -1 : 1;
      }
      if (a.required !== b.required) {
        return a.required ? -1 : 1;
      }
      return 0;
    }),
    total_count: forms.length,
  };
}

/**
 * Get provincial foreign tax credit form
 */
function getProvincialFTCForm(province: 'BC' | 'ON' | 'AB'): FormRequirement | null {
  const provinceForms: Record<string, FormRequirement> = {
    BC: {
      form: 'BC428',
      description: 'British Columbia Tax and Credits',
      country: 'CA',
      required: true,
      deadline: 'April 30',
      pdf_url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/5006-tc.html',
    },
    ON: {
      form: 'ON428',
      description: 'Ontario Tax and Credits',
      country: 'CA',
      required: true,
      deadline: 'April 30',
      pdf_url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/5006-tc.html',
    },
    AB: {
      form: 'AB428',
      description: 'Alberta Tax and Credits',
      country: 'CA',
      required: true,
      deadline: 'April 30',
      pdf_url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/5006-tc.html',
    },
  };

  return provinceForms[province] || null;
}

/**
 * Validate forms request
 */
export function validateFormsRequest(data: any): {
  valid: boolean;
  errors?: string[];
  request?: FormsRequest;
} {
  const errors: string[] = [];

  // has_rsu is required
  if (typeof data.has_rsu !== 'boolean') {
    errors.push('has_rsu must be a boolean');
  }

  // Validate optional fields
  if (data.country && !['US', 'CA', 'both'].includes(data.country)) {
    errors.push('country must be one of: US, CA, both');
  }

  if (data.province && !['BC', 'ON', 'AB'].includes(data.province)) {
    errors.push('province must be one of: BC, ON, AB');
  }

  if (data.state && !['WA', 'CA', 'NY', 'TX'].includes(data.state)) {
    errors.push('state must be one of: WA, CA, NY, TX');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    request: {
      country: data.country || 'both',
      province: data.province,
      state: data.state,
      has_rsu: data.has_rsu,
      has_foreign_accounts: data.has_foreign_accounts || false,
    },
  };
}
