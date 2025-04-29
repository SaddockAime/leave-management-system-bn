// filepath: src/utils/dateUtils.ts
/**
 * Utility functions for date handling
 */

/**
 * Get the number of working days between two dates
 * @param startDate Start date
 * @param endDate End date
 * @param holidays Array of holiday dates to exclude
 * @returns Number of working days
 */
export const getWorkingDaysBetweenDates = (
    startDate: Date,
    endDate: Date,
    holidays: Date[] = []
  ): number => {
    // Copy dates to avoid modifying originals
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Normalize to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Initial count and date counter
    let count = 0;
    const current = new Date(start);
    
    // Loop through days
    while (current <= end) {
      // Check if it's a weekday (not Saturday or Sunday)
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Check if it's not a holiday
        const isHoliday = holidays.some(holiday => 
          holiday.getFullYear() === current.getFullYear() &&
          holiday.getMonth() === current.getMonth() &&
          holiday.getDate() === current.getDate()
        );
        
        if (!isHoliday) {
          count++;
        }
      }
      
      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };
  
  /**
   * Format a date in the specified format
   * @param date The date to format
   * @param format The format string
   * @returns Formatted date string
   */
  export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  };
  
  /**
   * Check if a date is in the past
   * @param date The date to check
   * @returns boolean
   */
  export const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  /**
   * Calculate the last day of the month
   * @param year Year
   * @param month Month (1-12)
   * @returns Date object for the last day of the month
   */
  export const getLastDayOfMonth = (year: number, month: number): Date => {
    return new Date(year, month, 0);
  };