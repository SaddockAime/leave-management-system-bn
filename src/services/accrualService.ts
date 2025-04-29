// filepath: src/services/accrualService.ts
import { getRepository } from 'typeorm';
import { LeaveBalance, LeaveType, Employee } from '../models';

export class AccrualService {
  async calculateMonthlyAccrual(
    employee: Employee,
    leaveType: LeaveType,
    month: number,
    year: number
  ): Promise<number> {
    // PTO accrues at 1.66 days per month
    if (leaveType.name === 'PTO') {
      return 1.66;
    }
    
    // Other leave types might have different accrual rates
    return leaveType.accrualRate || 0;
  }

  async runMonthlyAccrual(month: number, year: number): Promise<void> {
    try {
      const employeeRepository = getRepository(Employee);
      const leaveTypeRepository = getRepository(LeaveType);
      const leaveBalanceRepository = getRepository(LeaveBalance);

      // Get all active employees
      const employees = await employeeRepository.find();
      
      // Get all leave types
      const leaveTypes = await leaveTypeRepository.find({ where: { active: true } });
      
      // Process each employee
      for (const employee of employees) {
        // Process each leave type that accrues
        for (const leaveType of leaveTypes) {
          if (leaveType.accrualRate > 0) {
            // Calculate accrual for this month
            const accrual = await this.calculateMonthlyAccrual(
              employee, 
              leaveType, 
              month, 
              year
            );
            
            // Find or create employee's leave balance for this type and year
            let balance = await leaveBalanceRepository.findOne({
              where: {
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                year
              }
            });
            
            if (!balance) {
              balance = leaveBalanceRepository.create({
                employeeId: employee.id,
                leaveTypeId: leaveType.id,
                year,
                allocated: 0,
                used: 0,
                pending: 0,
                carryOver: 0
              });
            }
            
            // Update the allocation
            balance.allocated += accrual;
            
            // Save the updated balance
            await leaveBalanceRepository.save(balance);
          }
        }
      }
      
      console.log(`Monthly accrual completed for ${month}/${year}`);
    } catch (error) {
      console.error('Error running monthly accrual:', error);
      throw error;
    }
  }

  async processYearEndCarryover(year: number): Promise<void> {
    try {
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const leaveTypeRepository = getRepository(LeaveType);
      
      // Get all leave balances for the current year
      const balances = await leaveBalanceRepository.find({
        where: { year },
        relations: ['leaveType']
      });
      
      const nextYear = year + 1;
      
      // Process each balance
      for (const balance of balances) {
        // Calculate remaining balance
        const remainingBalance = 
          balance.allocated + 
          balance.carryOver + 
          balance.adjustment - 
          balance.used - 
          balance.pending;
        
        if (remainingBalance <= 0) {
          continue;
        }
        
        // Get or create next year's balance
        let nextYearBalance = await leaveBalanceRepository.findOne({
          where: {
            employeeId: balance.employeeId,
            leaveTypeId: balance.leaveTypeId,
            year: nextYear
          }
        });
        
        if (!nextYearBalance) {
          nextYearBalance = leaveBalanceRepository.create({
            employeeId: balance.employeeId,
            leaveTypeId: balance.leaveTypeId,
            year: nextYear,
            allocated: 0,
            used: 0,
            pending: 0,
            carryOver: 0
          });
        }
        
        // Handle carryover based on leave type
        if (balance.leaveType.name === 'PTO') {
          // PTO: Max 5 days carryover
          const carryOver = Math.min(remainingBalance, 5);
          nextYearBalance.carryOver = carryOver;
          
          // Set expiry date for carried over balance
          if (carryOver > 0) {
            nextYearBalance.expiryDate = new Date(nextYear, 0, 31); // Jan 31st of next year
          }
        } else {
          // Other leave types may have different carryover rules
          // Implement as needed
        }
        
        // Save next year's balance
        await leaveBalanceRepository.save(nextYearBalance);
      }
      
      console.log(`Year-end carryover process completed for ${year}`);
    } catch (error) {
      console.error('Error processing year-end carryover:', error);
      throw error;
    }
  }
}