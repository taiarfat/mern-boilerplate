/**
 * Date Range Helper
 * 
 * This utility provides functions to generate date ranges for filtering data.
 * It supports various time periods like last month, quarter, year, etc.
 */

/**
 * Date range object with start and end dates
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
  startYearMonth: string;
  endYearMonth: string;
}

/**
 * Get date range for a specific time period
 * 
 * @param period - Time period (last-month, last-quarter, last-year, last-2-years, half-year, custom)
 * @param customStartDate - Custom start date (for custom period)
 * @param customEndDate - Custom end date (for custom period)
 * @returns Date range object
 */
export const getDateRange = (
  period: string,
  customStartDate?: string,
  customEndDate?: string
): DateRange => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now);
  
  // Set end date to end of current month
  endDate.setHours(23, 59, 59, 999);
  
  switch (period) {
    case 'last-month':
      // Last month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
      
    case 'last-3-months':
      // Last 3 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
      
    case 'last-6-months':
    case 'half-year':
      // Last 6 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
      
    case 'last-quarter':
      // Last quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarterStartMonth = (currentQuarter - 1 < 0 ? 3 + currentQuarter - 1 : currentQuarter - 1) * 3;
      const lastQuarterYear = currentQuarter - 1 < 0 ? now.getFullYear() - 1 : now.getFullYear();
      
      startDate = new Date(lastQuarterYear, lastQuarterStartMonth, 1);
      endDate = new Date(lastQuarterYear, lastQuarterStartMonth + 3, 0);
      break;
      
    case 'current-quarter':
      // Current quarter
      const currQuarter = Math.floor(now.getMonth() / 3);
      const currQuarterStartMonth = currQuarter * 3;
      
      startDate = new Date(now.getFullYear(), currQuarterStartMonth, 1);
      endDate = new Date(now.getFullYear(), currQuarterStartMonth + 3, 0);
      break;
      
    case 'year-to-date':
      // Year to date
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
      
    case 'last-year':
      // Last year
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
      
    case 'last-2-years':
      // Last 2 years
      startDate = new Date(now.getFullYear() - 2, 0, 1);
      break;
      
    case 'all-time':
      // All time (3 years back by default)
      startDate = new Date(now.getFullYear() - 3, 0, 1);
      break;
      
    case 'custom':
      // Custom date range
      if (!customStartDate || !customEndDate) {
        throw new Error('Custom date range requires both start and end dates');
      }
      
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
      break;
      
    default:
      // Default to last month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date();
  }
  
  // Format dates for yearMonth query (YYYY-MM)
  const startYearMonth = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const endYearMonth = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}`;
  
  return {
    startDate,
    endDate,
    startYearMonth,
    endYearMonth
  };
};

/**
 * Generate an array of months between start and end dates
 * 
 * @param startYearMonth - Start year-month (YYYY-MM)
 * @param endYearMonth - End year-month (YYYY-MM)
 * @returns Array of year-month strings
 */
export const generateMonthsArray = (startYearMonth: string, endYearMonth: string): string[] => {
  const [startYear, startMonth] = startYearMonth.split('-').map(Number);
  const [endYear, endMonth] = endYearMonth.split('-').map(Number);
  
  const months: string[] = [];
  
  let currentYear = startYear;
  let currentMonth = startMonth;
  
  while (
    currentYear < endYear || 
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    months.push(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`);
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  
  return months;
};

/**
 * Group months by quarter
 * 
 * @param months - Array of year-month strings
 * @returns Object with quarters as keys and arrays of months as values
 */
export const groupMonthsByQuarter = (months: string[]): Record<string, string[]> => {
  const quarters: Record<string, string[]> = {};
  
  months.forEach(month => {
    const [year, monthNum] = month.split('-').map(Number);
    const quarter = Math.ceil(monthNum / 3);
    const quarterKey = `${year}-Q${quarter}`;
    
    if (!quarters[quarterKey]) {
      quarters[quarterKey] = [];
    }
    
    quarters[quarterKey].push(month);
  });
  
  return quarters;
};

export default {
  getDateRange,
  generateMonthsArray,
  groupMonthsByQuarter
};
