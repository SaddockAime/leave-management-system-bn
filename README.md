# Leave Management System - Backend API

A comprehensive REST API for managing employee leave requests, balances, and approvals with JWT authentication and role-based access control.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v11+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SaddockAime/leave-management-system-bn.git
   cd leave-management-system-bn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your database and other configurations
   ```

4. **Database Setup**
   ```bash
   npm run createAllTables
   npm run seed:all
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000` with documentation at `http://localhost:3000/api-docs`

## 🔧 Environment Variables

Create a `.env` file with these required variables:

```env
# Database
DATABASE_URL=postgres://username:password@localhost:5432/leave_management

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Server
PORT=3000
NODE_ENV=development
```

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based internal authentication system
- **File Storage**: Cloudinary for images and documents
- **Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.IO for notifications
- **Logging**: Winston for structured logging
- **Validation**: Joi for request validation

### Key Features
- **🔐 Authentication & Authorization**: Complete JWT-based auth system with user registration, login, logout, password reset, email verification, and Google OAuth
- **👥 HR Management**: Comprehensive HR module with employee analytics, department performance, bulk operations, and workforce insights
- **🎯 Recruitment System**: Full recruitment lifecycle with job postings, application tracking, interview scheduling, and recruitment analytics
- **💰 Compensation Management**: Salary administration, bonus tracking, benefits enrollment, and compensation analytics
- **📚 Employee Onboarding**: Structured onboarding processes with task templates, progress tracking, and completion analytics
- **📋 Leave Management**: Advanced leave system with multiple types, approval workflows, balance tracking, and manager tools
- **👨‍💼 Manager Tools**: Team management, performance tracking, leave approvals, and department oversight
- **📁 Document Management**: Cloudinary-integrated file storage for profiles, documents, and attachments
- **🔔 Real-time Notifications**: Socket.IO notifications with email integration and preference management
- **📊 Advanced Analytics**: Comprehensive reporting across HR, recruitment, compensation, and leave modules
- **🕵️ Audit & Compliance**: Complete activity tracking, security logging, and compliance reporting
- **🏢 Organizational Structure**: Department management, manager hierarchies, and team relationships

## 📚 API Documentation

### Access
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/api-docs.json`

### Authentication
The API uses internal JWT-based authentication. Users can register, login, and manage their sessions:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john@company.com", "password": "password123"}'

# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@company.com", "password": "password123"}'

# Use token in protected requests
curl -X GET http://localhost:3000/api/leave-requests/my-leaves \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Logout (invalidates token)
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### User Roles & Permissions
- **ADMIN**: Full system access, user management, system configuration
- **HR_MANAGER**: Employee management, department oversight, leave policies
- **MANAGER**: Team management, leave approvals for direct reports
- **EMPLOYEE**: Basic access, personal leave requests, profile management

## 🛠️ Development

### Scripts
```bash
npm run dev              # Start development server
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run createAllTables  # Create database tables
npm run deleteAllTables  # Drop all database tables
npm run seed:all         # Seed database with initial data
npm run swagger:generate # Generate API documentation
npm run format           # Format code with Prettier
```

### Project Structure
```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Database entities
├── routes/          # API route definitions
├── middleware/      # Custom middleware
├── validations/     # Request validation schemas
├── config/          # Configuration files
├── utils/           # Utility functions
└── scripts/         # Database seeders
```

### Code Standards
- TypeScript for type safety
- Joi for request validation
- Winston for structured logging
- ESLint and Prettier for code formatting

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions by user role
- **Input Validation**: Comprehensive request validation with Joi
- **File Upload Security**: Type and size validation for uploads
- **Audit Logging**: Complete activity tracking
- **Error Handling**: Secure error responses without sensitive data

## 🗄️ Database

### Core Models
- **User**: Authentication and basic user data
- **Employee**: Extended employee profiles (linked to Users)
- **Department**: Organizational structure
- **Role**: User roles and permissions

### Leave Management Models
- **LeaveRequest**: Leave applications and status
- **LeaveType**: Different types of leave (Annual, Sick, etc.)
- **LeaveBalance**: Available leave balances by type

### HR & Management Models
- **JobPosting**: Recruitment job listings
- **JobApplication**: Candidate applications
- **Interview**: Interview scheduling and tracking
- **Onboarding**: Employee onboarding processes
- **OnboardingTask**: Individual onboarding tasks

### Compensation Models
- **Salary**: Employee salary information
- **Bonus**: Bonus allocations and tracking
- **Benefit**: Company benefits catalog
- **EmployeeBenefit**: Employee benefit enrollments

### System Models
- **Document**: File attachments with Cloudinary integration
- **Notification**: System notifications and preferences
- **AuditLog**: Comprehensive activity tracking
- **NotificationTemplate**: Email and notification templates

### Relationships
- Users have one Employee profile (created by HR/Admin)
- Employees belong to Departments
- Employees can have Managers (hierarchical structure)
- Leave Requests belong to Employees
- Documents are attached to Leave Requests

## 📊 API Modules Overview

The system provides **17 comprehensive API modules** with hundreds of endpoints:

### 🔐 Authentication & User Management (`/api/auth`)
- User registration, login, logout with JWT tokens
- Password reset and email verification workflows
- Google OAuth integration
- User role and status management (Admin only)
- Token refresh and blacklisting for security

### 👤 Profile Management (`/api/profile`)
- User profile viewing and updating
- Profile picture upload with Cloudinary integration

### 👥 Employee Management (`/api/employees`)
- HR-controlled employee profile creation and management
- Employee search and filtering with pagination
- Department-based employee viewing for managers
- Employee analytics and insights

### 👨‍💼 Manager Tools (`/api/manager`)
- Team management and hierarchy viewing
- Team leave approval and oversight
- Performance tracking and analytics
- Direct report management

### 🏢 HR Management (`/api/hr`)
- Comprehensive HR dashboard and analytics
- Employee overview and workforce insights
- Department performance metrics
- Bulk employee operations
- HR reporting with multiple report types

### 🎯 Recruitment System (`/api/recruitment`)
- Job posting creation and management
- Application tracking and processing
- Interview scheduling and management
- Candidate evaluation and hiring workflows
- Recruitment analytics and metrics

### 💰 Compensation Management (`/api/compensation`)
- Salary administration and tracking
- Bonus allocation and management
- Benefits enrollment and administration
- Compensation analytics and reporting
- Payroll integration capabilities

### 📚 Onboarding System (`/api/onboarding`)
- Structured onboarding process creation
- Task templates and checklist management
- Progress tracking and completion monitoring
- Onboarding analytics and optimization

### 📋 Leave Management (`/api/leave-requests`, `/api/leave-types`, `/api/leave-balances`)
- Advanced leave request workflows
- Multiple leave types and balance tracking
- Manager approval processes
- Leave analytics and reporting
- Department and team leave oversight

### 📁 Document Management (`/api/documents`)
- Cloudinary-integrated file storage
- Document upload for leave requests
- File categorization and management
- Secure document access control

### 🔔 Notification System (`/api/notifications`)
- Real-time notifications via Socket.IO
- Email notification preferences
- Notification history and management
- Custom notification templates

### 🏢 Department Management (`/api/departments`)
- Organizational structure management
- Department creation and administration
- Manager assignment and hierarchies

### 📊 Reporting & Analytics (`/api/reports`)
- Cross-module reporting capabilities
- Advanced analytics and insights
- Data export in multiple formats
- Custom report generation

### 🕵️ Audit & Compliance (`/api/audit`)
- Comprehensive activity logging
- Security event tracking
- Compliance reporting
- Audit trail management

### 🛡️ Additional Modules
- **Protected Routes**: Role-based access control across all endpoints
- **Real-time Features**: Socket.IO integration for live updates
- **Email Services**: SMTP integration for notifications and workflows

For complete API documentation, visit `/api-docs` when the server is running.

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify `DATABASE_URL` in `.env`

2. **JWT Authentication Errors**
   - Check `JWT_SECRET` is set in `.env`
   - Verify token format in Authorization header
   - Ensure token hasn't expired or been blacklisted

3. **File Upload Issues**
   - Verify Cloudinary credentials in `.env`
   - Check file size limits (10MB max)

4. **TypeScript Compilation Errors**
   - Run `npx tsc --noEmit` to check for errors
   - Ensure all dependencies are installed

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Related Repositories

- [Frontend Application](https://github.com/SaddockAime/leave-management-system-fn) - React frontend (if available)

## 🆕 System Capabilities

This is a **comprehensive enterprise HR management system** with:

- ✅ **Complete HR Suite**: Full employee lifecycle from recruitment to onboarding to performance management
- ✅ **Advanced Analytics**: Detailed reporting across all modules with data-driven insights
- ✅ **Enterprise Security**: JWT authentication, audit logging, role-based access control
- ✅ **Workflow Automation**: Automated leave approvals, onboarding processes, and notifications
- ✅ **Integration Ready**: Cloudinary for files, SMTP for emails, Socket.IO for real-time updates
- ✅ **Scalable Architecture**: TypeScript, TypeORM, comprehensive validation, and structured logging
- ✅ **API-First Design**: Complete REST API with Swagger documentation for frontend integration

---

**Need help?** Check the Swagger documentation at `/api-docs` or open an issue on GitHub.
