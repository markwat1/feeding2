import { subMonths, subYears, format } from 'date-fns';
import { TimePeriod } from '../components/common/PeriodSelector';
import { WeightRecord } from '../types';

/**
 * Get start date based on selected time period
 */
export const getStartDateForPeriod = (period: TimePeriod): Date | null => {
  const now = new Date();
  
  switch (period) {
    case '1month':
      return subMonths(now, 1);
    case '3months':
      return subMonths(now, 3);
    case '6months':
      return subMonths(now, 6);
    case '1year':
      return subYears(now, 1);
    case 'all':
      return null; // No start date filter for all records
    default:
      return subMonths(now, 6); // Default to 6 months
  }
};

/**
 * Format date for API calls
 */
export const formatDateForApi = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Filter weight records by period
 */
export const filterWeightRecordsByPeriod = (
  records: WeightRecord[],
  period: TimePeriod
): WeightRecord[] => {
  if (period === 'all') {
    return records;
  }
  
  const startDate = getStartDateForPeriod(period);
  if (!startDate) {
    return records;
  }
  
  return records.filter(record => {
    const recordDate = new Date(record.measuredDate);
    return recordDate >= startDate;
  });
};

/**
 * Get date range for API calls
 */
export const getDateRangeForPeriod = (period: TimePeriod): { startDate?: string; endDate?: string } => {
  const startDate = getStartDateForPeriod(period);
  const endDate = new Date();
  
  if (!startDate) {
    return {}; // No date range for 'all' period
  }
  
  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};