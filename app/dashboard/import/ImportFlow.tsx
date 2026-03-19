'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, Download, CheckCircle, XCircle, FileText, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { validateCSVRow, type CSVRow } from '@/lib/validation/csv';
import { ImportFlowTracker, trackError, trackApiError } from '@/lib/analytics/tracking-utils';
import { TaxDisclaimer } from '@/components/legal/tax-disclaimer';

interface ParsedRow {
  data: any;
  valid: boolean;
  errors: string[];
  validatedData?: CSVRow;
}

type Step = 'upload' | 'preview' | 'confirmation';

export default function ImportFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    total: number;
    errors?: Array<{ row: number; message: string; data: any }>;
  } | null>(null);

  // Analytics tracker
  const importTrackerRef = useRef<ImportFlowTracker | null>(null);

  // Initialize import tracker
  useEffect(() => {
    importTrackerRef.current = new ImportFlowTracker();
  }, []);

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);
    setIsProcessing(true);
    setFlowError(null);

    // Track file upload
    importTrackerRef.current?.trackFileUpload(file.name, file.size);
    importTrackerRef.current?.trackStep(1, 'file_upload', {
      file_name: file.name,
      file_size: file.size,
    });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validated: ParsedRow[] = results.data.map((row: any) => {
          const validation = validateCSVRow(row);
          return {
            data: row,
            valid: validation.valid,
            errors: validation.errors,
            validatedData: validation.row,
          };
        });

        setParsedRows(validated);
        setIsProcessing(false);
        setCurrentStep('preview');

        // Track parse success
        const validCount = validated.filter(r => r.valid).length;
        const invalidCount = validated.length - validCount;

        importTrackerRef.current?.trackStep(2, 'preview', {
          total_rows: validated.length,
          valid_rows: validCount,
          invalid_rows: invalidCount,
          validation_rate: validCount / validated.length,
        });
      },
      error: (error) => {
        const errorMsg = `Failed to parse CSV file: ${error.message}. Please check the file format and try again.`;
        setFlowError(errorMsg);
        setIsProcessing(false);

        // Track parse error
        importTrackerRef.current?.trackError(error.message, 'parse');
        trackError(error, {
          context: 'csv_import_parse',
          file_name: file.name,
          file_size: file.size,
        });
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  // Handle import
  const handleImport = async () => {
    const validRows = parsedRows
      .filter((r) => r.valid && r.validatedData)
      .map((r) => r.validatedData);

    if (validRows.length === 0) {
      const errorMsg = 'No valid rows to import. Please fix the errors in your CSV and try again.';
      setFlowError(errorMsg);
      importTrackerRef.current?.trackError(errorMsg, 'validation');
      return;
    }

    if (validRows.length > 1000) {
      const errorMsg = 'Maximum 1,000 rows allowed per import. Please split your file into smaller batches and try again.';
      setFlowError(errorMsg);
      importTrackerRef.current?.trackError(errorMsg, 'validation');
      return;
    }

    setIsProcessing(true);
    setFlowError(null);

    // Track import start
    importTrackerRef.current?.trackStep(3, 'import_start', {
      valid_rows: validRows.length,
    });

    try {
      const response = await fetch('/api/rsu/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows: validRows }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResult(result);
      setCurrentStep('confirmation');

      // Track successful import
      importTrackerRef.current?.trackCompletion(
        result.success || 0,
        result.failed || 0
      );
    } catch (error) {
      const errorMsg = error instanceof Error
        ? error.message
        : 'Import failed. Please check your data and try again.';
      setFlowError(errorMsg);

      // Track import error
      importTrackerRef.current?.trackError(errorMsg, 'import');
      trackApiError(
        '/api/rsu/bulk',
        500,
        errorMsg,
        {
          context: 'csv_import',
          valid_rows: validRows.length,
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Download error report
  const downloadErrorReport = () => {
    if (!importResult?.errors) return;

    const errorRows = importResult.errors.map((err) => ({
      row_number: err.row,
      error_reason: err.message,
      ...err.data,
    }));

    const csv = Papa.unparse(errorRows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Go back to upload step
  const handleBackToUpload = () => {
    setParsedRows([]);
    setFileName('');
    setFlowError(null);
    setCurrentStep('upload');
  };

  // Reset and start over
  const resetFlow = () => {
    setParsedRows([]);
    setFileName('');
    setImportResult(null);
    setFlowError(null);
    setCurrentStep('upload');
  };

  const validCount = parsedRows.filter((r) => r.valid).length;
  const invalidCount = parsedRows.filter((r) => !r.valid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
          `,
        }}
      />

      <div className="relative container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Bulk Import RSU Entries</h1>
          <p className="text-slate-400">Upload a CSV file to import multiple RSU vesting events at once</p>
        </div>

        {/* Tax Disclaimer */}
        <TaxDisclaimer variant="compact" />

        {/* Progress Stepper */}
        <div className="mb-12 flex items-center justify-center gap-4">
          <StepIndicator
            number={1}
            label="Upload"
            active={currentStep === 'upload'}
            completed={currentStep === 'preview' || currentStep === 'confirmation'}
          />
          <div className={`h-0.5 w-24 ${currentStep !== 'upload' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          <StepIndicator
            number={2}
            label="Preview"
            active={currentStep === 'preview'}
            completed={currentStep === 'confirmation'}
          />
          <div className={`h-0.5 w-24 ${currentStep === 'confirmation' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          <StepIndicator
            number={3}
            label="Confirmation"
            active={currentStep === 'confirmation'}
            completed={false}
          />
        </div>

        {/* Inline Error Banner */}
        {flowError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3" role="alert">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">{flowError}</p>
            </div>
            <button
              onClick={() => setFlowError(null)}
              className="ml-auto text-red-400 hover:text-red-300 text-sm flex-shrink-0"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                ${isDragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                }
              `}
              style={{ minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <input {...getInputProps()} />
              <div>
                <Upload className={`mx-auto h-16 w-16 mb-4 ${isDragActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <p className="text-xl font-semibold text-slate-200 mb-2">
                  {isDragActive ? 'Drop your CSV file here' : 'Drag CSV here or click to browse'}
                </p>
                <p className="text-sm text-slate-500">
                  Supports .csv files up to 1,000 rows
                </p>
              </div>
            </div>

            {/* Template Download */}
            <div className="text-center">
              <a
                href="/templates/rsu_import_template.csv"
                download
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download template CSV
              </a>
            </div>

            {isProcessing && (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <span className="text-sm">Parsing CSV file...</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Import Summary</h2>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-slate-400">File</p>
                  <p className="text-slate-100 font-medium">{fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm text-slate-400">Valid Rows</p>
                    <p className="text-emerald-400 font-semibold">{validCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-slate-400">Invalid Rows</p>
                    <p className="text-red-400 font-semibold">{invalidCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Vesting Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Employer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Shares</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">FMV (USD)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, index) => (
                      <tr
                        key={index}
                        className={`
                          border-t border-slate-700
                          ${row.valid ? 'bg-emerald-500/10' : 'bg-red-500/10'}
                        `}
                      >
                        <td className="px-4 py-3 text-sm text-slate-300">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-slate-200">{row.data.vesting_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-200">{row.data.employer || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-200">{row.data.shares || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-200">${row.data.fmv_usd || '-'}</td>
                        <td className="px-4 py-3">
                          {row.valid ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <div className="group relative">
                              <div className="flex items-center gap-1.5 cursor-help">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span className="text-xs text-red-400 hidden sm:inline">
                                  {row.errors.length} {row.errors.length === 1 ? 'error' : 'errors'}
                                </span>
                              </div>
                              <div className="absolute left-0 top-full mt-2 w-72 bg-slate-800 border border-red-500/30 text-slate-200 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                <p className="font-semibold text-red-400 mb-1.5">Validation errors:</p>
                                <ul className="space-y-1">
                                  {row.errors.map((err, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="text-red-400 mt-px">•</span>
                                      <span>{err}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToUpload}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0 || isProcessing}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing {validCount} rows...
                  </>
                ) : (
                  <>Import {validCount} Valid Rows</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 'confirmation' && importResult && (
          <div className="space-y-6">
            {/* Success Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              {importResult.success > 0 && (
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-emerald-400 mb-2">{importResult.success}</h2>
                  <p className="text-slate-300">Successfully imported entries</p>
                </div>
              )}

              {importResult.failed > 0 && (
                <div className={importResult.success > 0 ? 'border-t border-slate-700 pt-6 mt-6' : ''}>
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-red-400 mb-2">{importResult.failed}</h2>
                  <p className="text-slate-300 mb-4">Failed to import entries</p>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <button
                      onClick={downloadErrorReport}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Error Report
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={resetFlow}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              >
                Import Another File
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
          ${completed ? 'bg-emerald-500 text-white' : active ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}
        `}
      >
        {completed ? <CheckCircle className="h-5 w-5" /> : number}
      </div>
      <p className={`text-sm ${active ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}
