import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Employee } from '../models/Employee';
import { User } from '../models/User';

export class EmployeeController {
  async createEmployeeProfile(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId, // Changed from authUserId to userId
        position,
        departmentId,
        hireDate,
        managerId,
      } = req.body;

      const employeeRepository = getRepository(Employee);
      const userRepository = getRepository(User);

      // Check if profile already exists through User relationship
      const existingEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingEmployee) {
        res.status(400).json({ message: 'Employee profile already exists' });
        return;
      }

      // Get the user first
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Create employee profile - link to user via relationship
      const newEmployee = employeeRepository.create({
        user: user,
        position,
        departmentId,
        hireDate: hireDate || new Date(),
        managerId,
      });

      const savedEmployee = await employeeRepository.save(newEmployee);

      res.status(201).json(savedEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create employee profile', error });
    }
  }

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      // This endpoint is only for HR/Admin - no role checks needed (handled by route authorization)
      const employeeRepository = getRepository(Employee);

      // Get query parameters for filtering and pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const searchTerm = req.query.search as string;
      const departmentId = req.query.departmentId as string;
      const position = req.query.position as string;
      const status = req.query.status as string;

      let query = employeeRepository
        .createQueryBuilder('emp')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('emp.user', 'user')
        .leftJoinAndSelect('emp.manager', 'manager');

      // Apply filters
      if (departmentId) {
        query = query.andWhere('emp.departmentId = :departmentId', { departmentId });
      }

      if (position) {
        query = query.andWhere('emp.position ILIKE :position', { position: `%${position}%` });
      }

      if (status) {
        query = query.andWhere('emp.status = :status', { status });
      }

      if (searchTerm) {
        query = query.andWhere(
          '(user.firstName ILIKE :searchTerm OR user.lastName ILIKE :searchTerm OR user.email ILIKE :searchTerm OR emp.position ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        );
      }

      // No role filtering needed - route authorization handles access control

      // Get total count for pagination
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by name
      query = query.orderBy('user.firstName', 'ASC').addOrderBy('user.lastName', 'ASC');

      const employees = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: employees,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employees',
        error: error.message,
      });
    }
  }

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const employeeRepository = getRepository(Employee);

      // Get the current employee through user relationship
      const currentEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Get the requested employee
      const employee = await employeeRepository.findOne({
        where: { id },
        relations: ['department', 'manager'],
      });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Access control:
      // HR/Admin have full access (handled by route authorization)
      // Others can view: themselves or same department
      const userRole = (req as any).user?.role || '';
      const hasFullAccess = userRole === 'HR_MANAGER' || userRole === 'ADMIN';
      const canView = hasFullAccess || 
        employee.id === currentEmployee.id || 
        employee.departmentId === currentEmployee.departmentId;
      
      if (canView) {
        res.status(200).json(employee);
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve employee', error });
    }
  }

  async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeRepository = getRepository(Employee);

      const employee = await employeeRepository.findOne({ where: { id } });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Update employee with provided fields
      employeeRepository.merge(employee, req.body);

      const updatedEmployee = await employeeRepository.save(employee);

      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update employee', error });
    }
  }

  async getMyDepartmentEmployees(req: Request, res: Response): Promise<void> {
    try {
      // This endpoint is only for Managers - get employees in their department
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);

      // Get current manager's information
      const currentEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Get query parameters for filtering and pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const searchTerm = req.query.search as string;
      const position = req.query.position as string;
      const status = req.query.status as string;

      let query = employeeRepository
        .createQueryBuilder('emp')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('emp.user', 'user')
        .leftJoinAndSelect('emp.manager', 'manager')
        .where('emp.departmentId = :departmentId', { departmentId: currentEmployee.departmentId });

      // Apply filters
      if (position) {
        query = query.andWhere('emp.position ILIKE :position', { position: `%${position}%` });
      }

      if (status) {
        query = query.andWhere('emp.status = :status', { status });
      }

      if (searchTerm) {
        query = query.andWhere(
          '(user.firstName ILIKE :searchTerm OR user.lastName ILIKE :searchTerm OR user.email ILIKE :searchTerm OR emp.position ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        );
      }

      // Get total count for pagination
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by name
      query = query.orderBy('user.firstName', 'ASC').addOrderBy('user.lastName', 'ASC');

      const employees = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: employees,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve department employees', error });
    }
  }
}
