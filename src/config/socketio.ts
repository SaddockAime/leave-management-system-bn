import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Employee, LeaveRequest } from '../models';
import { getRepository } from 'typeorm';

export class SocketService {
  private io: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initializeSocketAuth();
  }

  private initializeSocketAuth() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        // Decode the JWT token from the authorization system
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const userId = decoded.id;
        // Since we're working with an external auth system, we need to extract roles from the JWT
        const userRoles = decoded.roles || [];

        // Store user connection information
        socket.data.userId = userId;
        socket.data.roles = userRoles;
        this.userSockets.set(userId, socket.id);

        // Join role-based rooms based on the roles from JWT
        if (userRoles.includes('ROLE_ADMIN')) {
          socket.join('admins');
        }
        
        if (userRoles.includes('ROLE_MANAGER')) {
          socket.join('managers');
        }
        
        // Join user's personal room
        socket.join(`user:${userId}`);
        
        // Load user's employee info if it exists
        const employeeRepository = getRepository(Employee);
        const employee = await employeeRepository.findOne({ 
          where: { authUserId: userId },
          relations: ['department']
        });

        if (employee) {
          socket.data.employeeId = employee.id;
          socket.data.departmentId = employee.departmentId;
          
          // Join department room
          if (employee.departmentId) {
            socket.join(`department:${employee.departmentId}`);
          }
        }

        next();
      } catch (error) {
        return next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.userId}, roles: ${socket.data.roles?.join(', ')}`);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.userId}`);
        if (socket.data.userId) {
          this.userSockets.delete(socket.data.userId);
        }
      });
    });
  }

  // Send notification to specific user by their auth user ID
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send notification to all users with admin role
  public sendToAdmins(event: string, data: any) {
    this.io.to('admins').emit(event, data);
  }

  // Send notification to all users with manager role
  public sendToManagers(event: string, data: any) {
    this.io.to('managers').emit(event, data);
  }

  // Send notification to users with admin or manager roles
  public sendToManagersAndAdmins(event: string, data: any) {
    this.io.to(['managers', 'admins']).emit(event, data);
  }

  // Send notification about leave request to relevant parties based on roles
  public async notifyAboutLeaveRequest(leaveRequestId: string, type: 'created' | 'approved' | 'rejected' | 'canceled') {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['employee', 'employee.department', 'leaveType']
      });

      if (!leaveRequest) return;

      const { employee, leaveType } = leaveRequest;
      const eventData = {
        id: leaveRequestId,
        type,
        employee: {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          profilePicture: employee.profilePicture
        },
        leaveType: {
          name: leaveType.name,
          color: leaveType.color
        },
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        days: leaveRequest.days,
        status: leaveRequest.status,
        timestamp: new Date()
      };

      switch (type) {
        case 'created':
        case 'canceled':
          // Notify all managers and admins
          this.sendToManagersAndAdmins(`leave_request_${type}`, eventData);
          break;
          
        case 'approved':
        case 'rejected':
          // Notify the employee who requested the leave
          if (employee.authUserId) {
            this.sendToUser(employee.authUserId, `leave_request_${type}`, eventData);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to notify about leave request:', error);
    }
  }
}

// Export a singleton instance
let socketService: SocketService | null = null;

export const initializeSocketService = (server: http.Server): SocketService => {
  if (!socketService) {
    socketService = new SocketService(server);
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
};