// src/config/database.ts

import { createConnection, Connection } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();
import { 
  Employee, 
  Department, 
  LeaveType, 
  LeaveRequest, 
  LeaveBalance, 
  Document, 
  Holiday, 
  Notification,
  AuditLog,
  Setting,
} from '../models';

export const initializeDatabase = async (): Promise<Connection> => {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Saddock_2000',
      database: process.env.DB_NAME || 'leave_management',
      entities: [
        Employee,
        Department,
        LeaveType,
        LeaveRequest,
        LeaveBalance,
        Document,
        Holiday,
        Notification,
        AuditLog,
        Setting,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Be careful with this in production
      logging: process.env.NODE_ENV !== 'production',
    });
    
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed', error);
    throw error;
  }
};