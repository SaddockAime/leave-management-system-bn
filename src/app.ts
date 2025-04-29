// filepath: src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import leaveTypeRoutes from './routes/leaveTypeRoutes';
import leaveRequestRoutes from './routes/leaveRequestRoutes';
import leaveBalanceRoutes from './routes/leaveBalanceRoutes';
import reportRoutes from './routes/reportRoutes';
import protectedRoutes from './routes/protectedRoutes';
import { errorHandler } from './middleware/errorHandler';

// Initialize database
initializeDatabase().catch(err => {
  console.error('Database initialization failed', err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/leave-balances', leaveBalanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', protectedRoutes);

// Error handling
app.use(errorHandler);

export default app;