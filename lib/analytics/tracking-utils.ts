/**
 * Advanced Analytics Tracking Utilities
 *
 * Provides helpers for:
 * - Device/platform detection (mobile vs desktop)
 * - Field-level engagement tracking
 * - Form completion & drop-off tracking
 * - Error event tracking
 * - Performance monitoring
 */

import { trackEvent, PostHogEvent } from './posthog';

/**
 * Device Detection
 */
export function getDeviceInfo() {
  if (typeof window === 'undefined') return null;

  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // Screen size detection
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const deviceType = isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop';

  // Browser detection
  const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);
  const isEdge = /Edge/i.test(ua);

  // Connection info (if available)
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connectionType = connection?.effectiveType || 'unknown';

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isIOS,
    isAndroid,
    browser: isChrome ? 'chrome' : isSafari ? 'safari' : isFirefox ? 'firefox' : isEdge ? 'edge' : 'other',
    screenWidth,
    screenHeight,
    connectionType,
    userAgent: ua,
  };
}

/**
 * Field-Level Engagement Tracking
 * Tracks when users interact with form fields
 */
export class FieldTracker {
  private fieldInteractions: Map<string, {
    focused: boolean;
    startTime?: number;
    endTime?: number;
    valueChanged: boolean;
    blurCount: number;
  }> = new Map();

  private formId: string;
  private formStartTime: number;

  constructor(formId: string) {
    this.formId = formId;
    this.formStartTime = Date.now();
  }

  /**
   * Track field focus
   */
  trackFieldFocus(fieldName: string) {
    const existing = this.fieldInteractions.get(fieldName) || {
      focused: false,
      valueChanged: false,
      blurCount: 0,
    };

    this.fieldInteractions.set(fieldName, {
      ...existing,
      focused: true,
      startTime: Date.now(),
    });

    trackEvent('page_viewed', {
      event_type: 'field_focus',
      form_id: this.formId,
      field_name: fieldName,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track field blur (when user leaves field)
   */
  trackFieldBlur(fieldName: string, hasValue: boolean) {
    const field = this.fieldInteractions.get(fieldName);
    if (!field) return;

    const timeSpent = field.startTime ? Date.now() - field.startTime : 0;

    this.fieldInteractions.set(fieldName, {
      ...field,
      focused: false,
      endTime: Date.now(),
      blurCount: field.blurCount + 1,
    });

    trackEvent('page_viewed', {
      event_type: 'field_blur',
      form_id: this.formId,
      field_name: fieldName,
      time_spent_ms: timeSpent,
      has_value: hasValue,
      blur_count: field.blurCount + 1,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track field value change
   */
  trackFieldChange(fieldName: string, value: any) {
    const field = this.fieldInteractions.get(fieldName);
    if (!field) return;

    this.fieldInteractions.set(fieldName, {
      ...field,
      valueChanged: true,
    });

    trackEvent('page_viewed', {
      event_type: 'field_change',
      form_id: this.formId,
      field_name: fieldName,
      has_value: !!value,
      value_length: typeof value === 'string' ? value.length : undefined,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track form completion
   */
  trackFormCompletion(success: boolean, metadata?: Record<string, any>) {
    const totalTime = Date.now() - this.formStartTime;
    const fieldsInteracted = Array.from(this.fieldInteractions.keys());
    const fieldsCompleted = Array.from(this.fieldInteractions.values()).filter(f => f.valueChanged).length;

    trackEvent('page_viewed', {
      event_type: 'form_completion',
      form_id: this.formId,
      success,
      total_time_ms: totalTime,
      fields_interacted: fieldsInteracted.length,
      fields_completed: fieldsCompleted,
      completion_rate: fieldsCompleted / fieldsInteracted.length,
      ...metadata,
      ...getDeviceInfo(),
    });

    return {
      totalTime,
      fieldsInteracted,
      fieldsCompleted,
    };
  }

  /**
   * Track form abandonment
   */
  trackFormAbandonment(lastFieldTouched?: string) {
    const totalTime = Date.now() - this.formStartTime;
    const fieldsInteracted = Array.from(this.fieldInteractions.keys());
    const fieldsCompleted = Array.from(this.fieldInteractions.values()).filter(f => f.valueChanged).length;

    trackEvent('page_viewed', {
      event_type: 'form_abandonment',
      form_id: this.formId,
      total_time_ms: totalTime,
      fields_interacted: fieldsInteracted.length,
      fields_completed: fieldsCompleted,
      last_field_touched: lastFieldTouched,
      abandonment_rate: 1 - (fieldsCompleted / fieldsInteracted.length),
      ...getDeviceInfo(),
    });
  }

  /**
   * Get field-level analytics summary
   */
  getSummary() {
    const fields = Array.from(this.fieldInteractions.entries()).map(([name, data]) => ({
      name,
      ...data,
      timeSpent: data.startTime && data.endTime ? data.endTime - data.startTime : 0,
    }));

    return {
      formId: this.formId,
      totalTime: Date.now() - this.formStartTime,
      fields,
      totalFields: fields.length,
      completedFields: fields.filter(f => f.valueChanged).length,
    };
  }
}

/**
 * Calculator Engagement Tracker
 * Specialized tracking for tax calculator interactions
 */
export class CalculatorTracker {
  private calculatorId: string;
  private startTime: number;
  private calculations: number = 0;
  private fieldChanges: Map<string, number> = new Map();

  constructor(calculatorId: string) {
    this.calculatorId = calculatorId;
    this.startTime = Date.now();

    trackEvent('calculator_page_viewed', {
      calculator_id: calculatorId,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track calculation performed
   */
  trackCalculation(inputs: Record<string, any>, results: Record<string, any>) {
    this.calculations++;

    trackEvent('tax_calculation_viewed', {
      calculator_id: this.calculatorId,
      calculation_number: this.calculations,
      ...inputs,
      ...results,
      time_since_start_ms: Date.now() - this.startTime,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track input field change
   */
  trackInputChange(fieldName: string, value: any) {
    const changeCount = (this.fieldChanges.get(fieldName) || 0) + 1;
    this.fieldChanges.set(fieldName, changeCount);

    trackEvent('page_viewed', {
      event_type: 'calculator_input_change',
      calculator_id: this.calculatorId,
      field_name: fieldName,
      change_count: changeCount,
      has_value: !!value,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track calculator completion (e.g., email submission)
   */
  trackCompletion(email?: string, metadata?: Record<string, any>) {
    const totalTime = Date.now() - this.startTime;

    trackEvent('page_viewed', {
      event_type: 'calculator_completion',
      calculator_id: this.calculatorId,
      total_calculations: this.calculations,
      total_time_ms: totalTime,
      email_submitted: !!email,
      ...metadata,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track drop-off
   */
  trackDropOff(reason?: string) {
    const totalTime = Date.now() - this.startTime;

    trackEvent('page_viewed', {
      event_type: 'calculator_dropoff',
      calculator_id: this.calculatorId,
      total_calculations: this.calculations,
      total_time_ms: totalTime,
      dropoff_reason: reason,
      ...getDeviceInfo(),
    });
  }
}

/**
 * Error Tracking
 */
export function trackError(error: Error, context?: Record<string, any>) {
  trackEvent('page_viewed', {
    event_type: 'error',
    error_message: error.message,
    error_name: error.name,
    error_stack: error.stack?.substring(0, 500), // Truncate stack trace
    ...context,
    ...getDeviceInfo(),
  });
}

/**
 * Track API Errors
 */
export function trackApiError(
  endpoint: string,
  status: number,
  errorMessage: string,
  context?: Record<string, any>
) {
  trackEvent('page_viewed', {
    event_type: 'api_error',
    endpoint,
    status_code: status,
    error_message: errorMessage,
    ...context,
    ...getDeviceInfo(),
  });
}

/**
 * Import Flow Tracker
 */
export class ImportFlowTracker {
  private startTime: number;
  private currentStep: number = 0;

  constructor() {
    this.startTime = Date.now();

    trackEvent('csv_import_started', {
      ...getDeviceInfo(),
    });
  }

  /**
   * Track import step progression
   */
  trackStep(stepNumber: number, stepName: string, metadata?: Record<string, any>) {
    this.currentStep = stepNumber;

    trackEvent('page_viewed', {
      event_type: 'import_step',
      step_number: stepNumber,
      step_name: stepName,
      time_since_start_ms: Date.now() - this.startTime,
      ...metadata,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track file upload
   */
  trackFileUpload(fileName: string, fileSize: number, rowCount?: number) {
    trackEvent('page_viewed', {
      event_type: 'import_file_upload',
      file_name: fileName,
      file_size_bytes: fileSize,
      row_count: rowCount,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track import completion
   */
  trackCompletion(rowsImported: number, rowsFailed: number) {
    const totalTime = Date.now() - this.startTime;

    trackEvent('csv_import_completed', {
      rows_imported: rowsImported,
      rows_failed: rowsFailed,
      success_rate: rowsImported / (rowsImported + rowsFailed),
      total_time_ms: totalTime,
      steps_completed: this.currentStep,
      ...getDeviceInfo(),
    });
  }

  /**
   * Track import error
   */
  trackError(errorMessage: string, step?: string) {
    trackEvent('page_viewed', {
      event_type: 'import_error',
      error_message: errorMessage,
      current_step: step,
      step_number: this.currentStep,
      ...getDeviceInfo(),
    });
  }
}

/**
 * Performance Tracking
 */
export function trackPerformance(metricName: string, value: number, metadata?: Record<string, any>) {
  trackEvent('page_viewed', {
    event_type: 'performance',
    metric_name: metricName,
    metric_value: value,
    ...metadata,
    ...getDeviceInfo(),
  });
}

/**
 * Track page load time
 */
export function trackPageLoadTime() {
  if (typeof window === 'undefined') return;

  // Use Navigation Timing API
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        trackPerformance('page_load_time', perfData.loadEventEnd - perfData.fetchStart, {
          dns_time: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp_time: perfData.connectEnd - perfData.connectStart,
          request_time: perfData.responseStart - perfData.requestStart,
          response_time: perfData.responseEnd - perfData.responseStart,
          dom_processing: perfData.domComplete - perfData.domInteractive,
        });
      }
    }, 0);
  });
}

/**
 * Track Web Vitals (already handled by WebVitalsTracker, but useful for custom metrics)
 */
export function trackWebVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
  trackEvent('page_viewed', {
    event_type: 'web_vital',
    metric_name: name,
    metric_value: value,
    rating,
    ...getDeviceInfo(),
  });
}
