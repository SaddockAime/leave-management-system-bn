import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Employee } from '../models/Employee';

export class EmployeeController {
  async createSelfProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const userData = (req as any).user;
      const { position, departmentId, hireDate } = req.body;
      
      const employeeRepository = getRepository(Employee);
      
      // Check if profile already exists
      const existingEmployee = await employeeRepository.findOne({ where: { authUserId: userId } });
      
      if (existingEmployee) {
        res.status(400).json({ message: 'Employee profile already exists' });
        return;
      }
      
      // Create employee profile
      const newEmployee = employeeRepository.create({
        authUserId: userId,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        profilePicture: userData.profilePicture || null,
        position,
        departmentId,
        hireDate: hireDate || new Date()
      });
      
      const savedEmployee = await employeeRepository.save(newEmployee);
      
      res.status(201).json(savedEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create employee profile', error });
    }
  }
  
  async createEmployeeProfile(req: Request, res: Response): Promise<void> {
    try {
      const {
        authUserId,
        firstName,
        lastName,
        email,
        position,
        departmentId,
        hireDate,
        managerId,
        profilePicture
      } = req.body;
      
      const employeeRepository = getRepository(Employee);
      
      // Check if profile already exists
      const existingEmployee = await employeeRepository.findOne({ where: { authUserId } });
      
      if (existingEmployee) {
        res.status(400).json({ message: 'Employee profile already exists' });
        return;
      }
      
      // Create employee profile
      const newEmployee = employeeRepository.create({
        authUserId,
        firstName,
        lastName,
        email,
        profilePicture,
        position,
        departmentId,
        hireDate: hireDate || new Date(),
        managerId
      });
      
      const savedEmployee = await employeeRepository.save(newEmployee);
      
      res.status(201).json(savedEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create employee profile', error });
    }
  }

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      const userRoles = (req as any).user.roles || [];
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);
      
      // Get the current employee
      const currentEmployee = await employeeRepository.findOne({ 
        where: { authUserId: userId }
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      let employees;
      
      // If admin, get all employees
      if (userRoles.includes('ROLE_ADMIN')) {
        employees = await employeeRepository.find({
          relations: ['department']
        });
      } 
      // If manager, only get direct reports and team members
      else if (userRoles.includes('ROLE_MANAGER')) {
        employees = await employeeRepository.find({
          where: { departmentId: currentEmployee.departmentId },
          relations: ['department']
        });
      } 
      // Otherwise, don't allow access
      else {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve employees', error });
    }
  }

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRoles = (req as any).user.roles || [];
      const userId = (req as any).user.id;
      
      const employeeRepository = getRepository(Employee);
      
      // Get the current employee
      const currentEmployee = await employeeRepository.findOne({ 
        where: { authUserId: userId }
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Get the requested employee
      const employee = await employeeRepository.findOne({ 
        where: { id },
        relations: ['department', 'manager']
      });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }
      
      // Check permissions:
      // Admin can view any employee
      // Manager can view employees in their department
      // Employee can view themselves
      if (
        userRoles.includes('ROLE_ADMIN') || 
        (userRoles.includes('ROLE_MANAGER') && employee.departmentId === currentEmployee.departmentId) ||
        employee.id === currentEmployee.id
      ) {
        res.json(employee);
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
      
      res.json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update employee', error });
    }
  }
}