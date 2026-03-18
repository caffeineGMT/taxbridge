/**
 * Amazon RSU Helper
 * Ticker Symbol: AMZN
 * Typical Vesting: 5/15/40/40 over 4 years
 */

export const getTickerSymbol = (): string => {
  return 'AMZN';
};

export const getTypicalVestingSchedule = (): string => {
  return '5/15/40/40 over 4 years';
};

export const formatVestSchedule = (vestingDate: Date): string => {
  const year = vestingDate.getFullYear();
  const month = vestingDate.toLocaleDateString('en-US', { month: 'short' });
  const day = vestingDate.getDate();

  return `${month} ${day}, ${year} - Amazon RSU Vesting`;
};

export const getEmployerName = (): string => {
  return 'Amazon.com, Inc.';
};

export const getVestingFrequency = (): string => {
  return 'Semi-annual (every 6 months)';
};

export const getVestingNotes = (): string => {
  return 'Amazon RSUs vest semi-annually with a back-loaded schedule: 5% at 1 year, 15% at 1.5 years, 20% every 6 months thereafter. This creates a 5/15/40/40 pattern over 4 years.';
};
