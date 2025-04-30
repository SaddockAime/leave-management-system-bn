// filepath: src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error occurred: ${err.message}`);
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'Internal server error',
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
};