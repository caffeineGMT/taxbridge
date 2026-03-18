/**
 * Meta (Facebook) RSU Helper
 * Ticker Symbol: META
 * Typical Vesting: 25% each year over 4 years
 */

export const getTickerSymbol = (): string => {
  return 'META';
};

export const getTypicalVestingSchedule = (): string => {
  return '25% yearly over 4 years (25/25/25/25)';
};

export const formatVestSchedule = (vestingDate: Date): string => {
  const year = vestingDate.getFullYear();
  const month = vestingDate.toLocaleDateString('en-US', { month: 'short' });
  const day = vestingDate.getDate();

  return `${month} ${day}, ${year} - Meta RSU Vesting`;
};

export const getEmployerName = (): string => {
  return 'Meta Platforms, Inc.';
};

export const getVestingFrequency = (): string => {
  return 'Quarterly';
};

export const getVestingNotes = (): string => {
  return 'Meta RSUs typically vest quarterly over 4 years, with 25% vesting each year. Vesting dates are usually on specific quarterly dates (e.g., Feb 15, May 15, Aug 15, Nov 15).';
};
