// filepath: src/controllers/leaveBalanceController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Employee, LeaveBalance, LeaveType, AuditLog } from '../models';

export class LeaveBalanceController {
  async getMyLeaveBalances(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: userId } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      
      const balances = await leaveBalanceRepository.find({
        where: { 
          employeeId: employee.id,
          year: currentYear
        },
        relations: ['leaveType']
      });

      // Calculate available balance for each leave type
      const balancesWithAvailable = balances.map(balance => ({
        ...balance,
        available: balance.allocated + balance.carryOver - balance.used - balance.pending
      }));
      
      res.json(balancesWithAvailable);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave balances', error });
    }
  }

  async getEmployeeLeaveBalances(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const userId = (req as any).user.id;
      
      // Check if requester is HR/Admin or the employee's manager
      const employeeRepository = getRepository(Employee);
      const requester = await employeeRepository.findOne({ where: { authUserId: userId } });
      const targetEmployee = await employeeRepository.findOne({ where: { id: employeeId } });
      
      if (!requester || !targetEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Check permissions (this is simplified, you'll need proper role checks)
      const isManager = targetEmployee.managerId === requester.id;
      const isAdmin = true; // Replace with actual admin check
      
      if (!isManager && !isAdmin && requester.id !== targetEmployee.id) {
        res.status(403).json({ message: 'You do not have permission to view these leave balances' });
        return;
      }

      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      
      const balances = await leaveBalanceRepository.find({
        where: { 
          employeeId,
          year: currentYear
        },
        relations: ['leaveType']
      });

      // Calculate available balance for each leave type
      const balancesWithAvailable = balances.map(balance => ({
        ...balance,
        available: balance.allocated + balance.carryOver - balance.used - balance.pending
      }));
      
      res.json(balancesWithAvailable);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave balances', error });
    }
  }

  async adjustLeaveBalance(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, leaveTypeId, adjustment, reason } = req.body;
      const userId = (req as any).user.id;
      
      // Check if requester is HR/Admin
      const employeeRepository = getRepository(Employee);
      const requester = await employeeRepository.findOne({ where: { authUserId: userId } });
      
      if (!requester) {
        res.status(404).json({ message: 'Requester not found' });
        return;
      }

      // Check permissions (simplified)
      const isAdmin = true; // Replace with actual admin check
      
      if (!isAdmin) {
        res.status(403).json({ message: 'You do not have permission to adjust leave balances' });
        return;
      }

      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      
      let balance = await leaveBalanceRepository.findOne({
        where: { 
          employeeId,
          leaveTypeId,
          year: currentYear
        }
      });

      if (!balance) {
        // Create a new balance if it doesn't exist
        const leaveTypeRepository = getRepository(LeaveType);
        const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveTypeId } });
        
        if (!leaveType) {
          res.status(404).json({ message: 'Leave type not found' });
          return;
        }
        
        balance = leaveBalanceRepository.create({
          employeeId,
          leaveTypeId,
          year: currentYear,
          allocated: 0,
          used: 0,
          pending: 0,
          carryOver: 0
        });
      }

      // Store old values for audit
      const oldValues = { ...balance };
      
      // Update the balance
      balance.adjustment = (balance.adjustment || 0) + Number(adjustment);
      balance.adjustmentReason = reason;
      
      const updatedBalance = await leaveBalanceRepository.save(balance);

      // Create audit log
      const auditLogRepository = getRepository(AuditLog);
      await auditLogRepository.save({
        userId: requester.authUserId,
        action: 'ADJUST_BALANCE',
        entityType: 'LeaveBalance',
        entityId: balance.id,
        oldValues,
        newValues: updatedBalance,
        ipAddress: req.ip
      });
      
      res.json({ 
        message: 'Leave balance adjusted successfully',
        balance: {
          ...updatedBalance,
          available: updatedBalance.allocated + updatedBalance.carryOver + updatedBalance.adjustment - updatedBalance.used - updatedBalance.pending
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to adjust leave balance', error });
    }
  }
}