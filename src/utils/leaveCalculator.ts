// src/utils/leaveCalculator.ts

export class LeaveCalculator {
    // Calculate business days between two dates (excluding weekends and holidays)
    calculateBusinessDays(startDate: Date, endDate: Date, holidays: Date[]): number {
      let count = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        
        // Skip weekends
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Check if it's not a holiday
          const isHoliday = holidays.some(holiday => 
            holiday.getDate() === currentDate.getDate() &&
            holiday.getMonth() === currentDate.getMonth() &&
            holiday.getFullYear() === currentDate.getFullYear()
          );
          
          if (!isHoliday) {
            count++;
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return count;
    }
  
    // Check if employee has sufficient balance
    // async checkSufficientBalance(
    //   employeeId: string,
    //   leaveTypeId: string,
    //   days: number
    // ): Promise<boolean> {
    //   // Get employee's current balance
    //   // Return true if balance >= days
    // }
  }