/**
 * Google (Alphabet) RSU Helper
 * Ticker Symbol: GOOGL
 * Typical Vesting: 25% each year over 4 years
 */

export const getTickerSymbol = (): string => {
  return 'GOOGL';
};

export const getTypicalVestingSchedule = (): string => {
  return '25% yearly over 4 years (25/25/25/25)';
};

export const formatVestSchedule = (vestingDate: Date): string => {
  const year = vestingDate.getFullYear();
  const month = vestingDate.toLocaleDateString('en-US', { month: 'short' });
  const day = vestingDate.getDate();

  return `${month} ${day}, ${year} - Google RSU Vesting`;
};

export const getEmployerName = (): string => {
  return 'Alphabet Inc. (Google)';
};

export const getVestingFrequency = (): string => {
  return 'Monthly';
};

export const getVestingNotes = (): string => {
  return 'Google RSUs typically vest monthly over 4 years after a 1-year cliff, resulting in 25% vesting per year. The monthly vesting provides more frequent liquidity events compared to quarterly vesting.';
};
