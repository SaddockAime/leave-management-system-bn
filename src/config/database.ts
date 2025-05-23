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
      url: process.env.DATABASE_URL,
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
      ssl: {
        rejectUnauthorized: false 
      },
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