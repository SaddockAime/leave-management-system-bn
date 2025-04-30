// filepath: src/controllers/leaveRequestController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { LeaveRequest, Employee, LeaveType, LeaveBalance, Holiday } from '../models';
import { LeaveCalculator } from '../utils/leaveCalculator';
import { LeaveBalanceInitializer } from '../utils/leaveBalanceInitializer';
import { NotificationService } from '../services/notificationService';

export class LeaveRequestController {
  private leaveCalculator = new LeaveCalculator();

  async getMyLeaves(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: userId } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaves = await leaveRequestRepository.find({
        where: { employeeId: employee.id },
        relations: ['leaveType'],
        order: { createdAt: 'DESC' }
      });
      
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave requests', error });
    }
  }

  // Add to the LeaveRequestController
async getAllLeaves(req: Request, res: Response): Promise<void> {
  try {
    const leaveRequestRepository = getRepository(LeaveRequest);
    const leaves = await leaveRequestRepository.find({
      relations: ['leaveType', 'employee', 'employee.department'],
      order: { startDate: 'DESC' }
    });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve leave requests', error });
  }
}

async getLeavesByDepartment(req: Request, res: Response): Promise<void> {
  try {
    const { departmentId } = req.params;
    
    const leaveRequestRepository = getRepository(LeaveRequest);
    const leaves = await leaveRequestRepository
      .createQueryBuilder('lr')
      .innerJoin('lr.employee', 'e')
      .where('e.departmentId = :deptId', { deptId: departmentId })
      .leftJoinAndSelect('lr.leaveType', 'lt')
      .leftJoinAndSelect('lr.employee', 'emp')
      .orderBy('lr.startDate', 'ASC')
      .getMany();
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve department leave requests', error });
  }
}

  async getTeamLeaves(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: userId } });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // If manager, get team's leaves
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaves = await leaveRequestRepository
        .createQueryBuilder('lr')
        .innerJoin('lr.employee', 'e')
        .where('e.departmentId = :deptId', { deptId: employee.departmentId })
        .andWhere('lr.status = :status', { status: 'APPROVED' })
        .andWhere('lr.endDate >= :today', { today: new Date() })
        .leftJoinAndSelect('lr.leaveType', 'lt')
        .leftJoinAndSelect('lr.employee', 'emp')
        .orderBy('lr.startDate', 'ASC')
        .getMany();

      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve team leave requests', error });
    }
  }

  async getLeaveRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({ 
        where: { id },
        relations: ['leaveType', 'employee', 'documents']
      });

      if (!leaveRequest) {
        res.status(404).json({ message: 'Leave request not found' });
        return;
      }

      res.json(leaveRequest);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave request', error });
    }
  }

  async createLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: userId } });
  
      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }
  
      const { leaveTypeId, startDate, endDate, reason } = req.body;
      
      // Validate leave type exists
      const leaveTypeRepository = getRepository(LeaveType);
      const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveTypeId } });
      if (!leaveType) {
        res.status(404).json({ message: 'Leave type not found' });
        return;
      }
      
      // Calculate business days
      const holidayRepository = getRepository(Holiday);
      const holidays = await holidayRepository.find();
      const holidayDates = holidays.map(h => h.date);
      
      // Create a new instance of LeaveCalculator here to avoid 'this' context issues
      const leaveCalculator = new LeaveCalculator();
      const days = leaveCalculator.calculateBusinessDays(
        new Date(startDate), 
        new Date(endDate),
        holidayDates
      );
  
      // Ensure a minimal number of days
      if (days <= 0) {
        res.status(400).json({ message: 'Leave request must include at least one business day' });
        return;
      }
  
      // Get or initialize leave balance
      const currentYear = new Date().getFullYear();
      const balance = await LeaveBalanceInitializer.ensureLeaveBalance(
        employee.id, 
        leaveTypeId, 
        currentYear
      );
  
      // Check if employee has enough balance
      if ((balance.allocated - balance.used - balance.pending) < days) {
        res.status(400).json({ 
          message: 'Insufficient leave balance',
          available: balance.allocated - balance.used - balance.pending,
          requested: days
        });
        return;
      }
  
      // Create leave request
      const leaveRequestRepository = getRepository(LeaveRequest);
      const newRequest = leaveRequestRepository.create({
        employeeId: employee.id,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: 'PENDING'
      });
  
      const savedRequest = await leaveRequestRepository.save(newRequest);
  
      // Update pending balance
      balance.pending += days;
      await getRepository(LeaveBalance).save(balance);

      // In createLeaveRequest method - after successfully creating and saving the request:
const notificationService = new NotificationService();
await notificationService.sendLeaveRequestCreatedNotification(savedRequest.id);
  
      res.status(201).json(savedRequest);
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      res.status(500).json({ message: 'Failed to create leave request', error: error.message });
    }
  }

  async approveLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const userId = (req as any).user.id;
      
      const employeeRepository = getRepository(Employee);
      const approver = await employeeRepository.findOne({ where: { authUserId: userId } });
      
      if (!approver) {
        res.status(404).json({ message: 'Approver not found' });
        return;
      }
  
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({ 
        where: { id },
        relations: ['employee']
      });
  
      if (!leaveRequest) {
        res.status(404).json({ message: 'Leave request not found' });
        return;
      }
  
      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ message: `Leave request is already ${leaveRequest.status}` });
        return;
      }
  
      // Update the leave request
      leaveRequest.status = 'APPROVED';
      leaveRequest.approvedById = approver.id;
      leaveRequest.approvalDate = new Date();
      leaveRequest.comments = comments;
      
      await leaveRequestRepository.save(leaveRequest);
  
      // Update leave balances
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      const balance = await leaveBalanceRepository.findOne({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: currentYear
        }
      });
  
      if (balance) {
        // Convert to numbers and then back to ensure proper numeric format
        const used = Number(balance.used) + Number(leaveRequest.days);
        const pending = Number(balance.pending) - Number(leaveRequest.days);
        
        // Update with properly formatted numeric values
        balance.used = used;
        balance.pending = pending;
        
        await leaveBalanceRepository.save(balance);
      }

      // In approveLeaveRequest method - after successfully approving the request:
const notificationService = new NotificationService();
await notificationService.sendLeaveStatusUpdateNotification(leaveRequest.id, true);
  
      res.json({ message: 'Leave request approved successfully' });
    } catch (error) {
      console.error('Error approving leave request:', error);
      res.status(500).json({ message: 'Failed to approve leave request', error });
    }
  }

  async rejectLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const userId = (req as any).user.id;
      
      const employeeRepository = getRepository(Employee);
      const approver = await employeeRepository.findOne({ where: { authUserId: userId } });
      
      if (!approver) {
        res.status(404).json({ message: 'Approver not found' });
        return;
      }
  
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({ 
        where: { id }
      });
  
      if (!leaveRequest) {
        res.status(404).json({ message: 'Leave request not found' });
        return;
      }
  
      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ message: `Leave request is already ${leaveRequest.status}` });
        return;
      }
  
      // Update the leave request
      leaveRequest.status = 'REJECTED';
      leaveRequest.approvedById = approver.id;
      leaveRequest.approvalDate = new Date();
      leaveRequest.comments = comments;
      
      await leaveRequestRepository.save(leaveRequest);
  
      // Update pending balance
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      const balance = await leaveBalanceRepository.findOne({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: currentYear
        }
      });
  
      if (balance) {
        // Convert to number and then back to ensure proper numeric format
        const pending = Number(balance.pending) - Number(leaveRequest.days);
        balance.pending = pending;
        
        await leaveBalanceRepository.save(balance);
      }

      // In rejectLeaveRequest method - after successfully rejecting the request:
const notificationService = new NotificationService();
await notificationService.sendLeaveStatusUpdateNotification(leaveRequest.id, false);
  
      res.json({ message: 'Leave request rejected successfully' });
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      res.status(500).json({ message: 'Failed to reject leave request', error });
    }
  }
  
  async cancelLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: userId } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }
  
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({ 
        where: { id, employeeId: employee.id }
      });
  
      if (!leaveRequest) {
        res.status(404).json({ message: 'Leave request not found or you do not have permission to cancel it' });
        return;
      }
  
      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ message: `Cannot cancel a ${leaveRequest.status} leave request` });
        return;
      }
  
      // Update the leave request
      leaveRequest.status = 'CANCELLED';
      await leaveRequestRepository.save(leaveRequest);
  
      // Update pending balance
      const leaveBalanceRepository = getRepository(LeaveBalance);
      const currentYear = new Date().getFullYear();
      const balance = await leaveBalanceRepository.findOne({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year: currentYear
        }
      });
  
      if (balance) {
        // Convert to number and then back to ensure proper numeric format
        const pending = Number(balance.pending) - Number(leaveRequest.days);
        balance.pending = pending;
        
        await leaveBalanceRepository.save(balance);
      }

      // In cancelLeaveRequest method - after successfully cancelling the request:
const notificationService = new NotificationService();
await notificationService.sendLeaveCancellationNotification(leaveRequest.id);
  
      res.json({ message: 'Leave request cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      res.status(500).json({ message: 'Failed to cancel leave request', error });
    }
  }
}