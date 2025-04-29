// src/models/Employee.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  OneToMany,
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn
} from 'typeorm';
import { Department } from './Department';
import { LeaveRequest } from './LeaveRequest';
import { LeaveBalance } from './LeaveBalance';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'auth_user_id', unique: true })
  authUserId!: string; // This will store the ID from your Java auth service

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  profilePicture!: string;

  @Column()
  position!: string;

  @Column({ name: 'hire_date' })
  hireDate!: Date;

  @Column({ nullable: true })
  managerId!: string;

  @ManyToOne(() => Employee, employee => employee.directReports)
  @JoinColumn({ name: 'manager_id' })
  manager!: Employee;

  @OneToMany(() => Employee, employee => employee.manager)
  directReports!: Employee[];

  @Column()
  departmentId!: string;

  @ManyToOne(() => Department, department => department.employees)
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.employee)
  leaveRequests!: LeaveRequest[];

  @OneToMany(() => LeaveBalance, leaveBalance => leaveBalance.employee)
  leaveBalances!: LeaveBalance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}