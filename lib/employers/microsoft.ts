/**
 * Microsoft RSU Helper
 * Ticker Symbol: MSFT
 * Typical Vesting: 25% each year over 4 years
 */

export const getTickerSymbol = (): string => {
  return 'MSFT';
};

export const getTypicalVestingSchedule = (): string => {
  return '25% yearly over 4 years (25/25/25/25)';
};

export const formatVestSchedule = (vestingDate: Date): string => {
  const year = vestingDate.getFullYear();
  const month = vestingDate.toLocaleDateString('en-US', { month: 'short' });
  const day = vestingDate.getDate();

  return `${month} ${day}, ${year} - Microsoft RSU Vesting`;
};

export const getEmployerName = (): string => {
  return 'Microsoft Corporation';
};

export const getVestingFrequency = (): string => {
  return 'Quarterly';
};

export const getVestingNotes = (): string => {
  return 'Microsoft RSUs typically vest quarterly over 5 years (20% per year), though some grants may vest over 4 years. Vesting occurs on specific dates: August 31, November 30, February 28, and May 31.';
};
