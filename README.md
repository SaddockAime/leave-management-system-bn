# Leave Management System Backend

Welcome to the Leave Management System backend repository! This project provides a comprehensive REST API for managing employee leave requests, tracking leave balances, handling approvals, and managing departments.

## Features

- **Authentication & Authorization**
  - Secure login and registration that use java/spring
  that can be found in this repo: https://github.com/SaddockAime/spring-boot-auth-bn
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Employee)

- **Leave Management**
  - Submit, approve, reject, and cancel leave requests
  - Track multiple leave types (Annual, Sick, Maternity, etc.)
  - Real-time notifications for leave status changes

- **Employee Management**
  - Employee onboarding
  - Department assignment
  - Manager relationships

- **Leave Balances**
  - Track available leave balances by type
  - Automatic balance calculation
  - Balance adjustment by administrators

- **Reporting**
  - Leave reports by department
  - Leave reports by employee
  - Leave calendar
  - Export to CSV and Excel

- **Real-time Notifications**
  - Socket.IO integration for instant updates
  - Email notifications
  - Notification management API

## Technology Stack

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time Communication**: Socket.IO
- **Email Service**: Nodemailer
- **API Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v11+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SaddockAime/leave-management-system-bn.git
   cd leave-management-system-bn

2. Install dependencies:
   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env` and add values to all variables.

4. Start the server:
   ```sh
   npm run dev
   ```
5. Set up the database:
   ```sh
   npm run db:migrate
   or
   yarn db:migrate
   ```

6. Seed the database with test data:
   ```sh
   npm run seed:departments
   npm run seed:holidays
   ```

7. Start the development server:
   ```sh
   npm run dev
   or
   yarn dev
   ```

## TABLE OF API ENDPOINTS SPECIFICATION AND DESCRIPTION

| No  | VERBS  | ENDPOINTS                                       | STATUS      | ACCESS   | DESCRIPTION                         |
| --- | ------ | ----------------------------------------------- | ----------- | -------- | ----------------------------------- |
| 1   | POST   | /api/auth/register                              | 201 CREATED | public   | Register a new user                 |
| 2   | POST   | /api/auth/login                                 | 200 OK      | public   | Login and get token                 |
| 3   | POST   | /api/auth/validate-token                        | 200 OK      | private  | Validate token                      |
| 4   | GET    | /api/leave-requests/my-leaves                   | 200 OK      | private  | Get current user's leaves           |
| 5   | GET    | /api/leave-requests/admin/all-leaves            | 200 OK      | admin    | Get all leaves (admin only)         |
| 6   | GET    | /api/leave-requests/department/{departmentId}   | 200 OK      | private  | Get department leaves               |
| 7   | GET    | /api/leave-requests/team-leaves                 | 200 OK      | manager  | Get team leaves (managers)          |
| 8   | GET    | /api/leave-requests/{id}                        | 200 OK      | private  | Get specific leave request          |
| 9   | POST   | /api/leave-requests                             | 201 CREATED | private  | Create new leave request            |
| 10  | PUT    | /api/leave-requests/{id}/approve                | 200 OK      | manager  | Approve leave request               |
| 11  | PUT    | /api/leave-requests/{id}/reject                 | 200 OK      | manager  | Reject leave request                |
| 12  | PUT    | /api/leave-requests/{id}/cancel                 | 200 OK      | private  | Cancel leave request                |
| 13  | GET    | /api/leave-balances/my-balances                 | 200 OK      | private  | Get current user's leave balances   |
| 14  | GET    | /api/leave-balances/employee/{employeeId}       | 200 OK      | manager  | Get employee leave balances         |
| 15  | POST   | /api/leave-balances/adjust                      | 200 OK      | admin    | Adjust leave balance (admin only)   |
| 16  | GET    | /api/leave-types                                | 200 OK      | private  | Get all leave types                 |
| 17  | POST   | /api/leave-types                                | 201 CREATED | admin    | Create new leave type (admin only)  |
| 18  | GET    | /api/leave-types/{id}                           | 200 OK      | private  | Get specific leave type             |
| 19  | PUT    | /api/leave-types/{id}                           | 200 OK      | admin    | Update leave type (admin only)      |
| 20  | DELETE | /api/leave-types/{id}                           | 200 OK      | admin    | Delete leave type (admin only)      |
| 21  | GET    | /api/notifications                              | 200 OK      | private  | Get user's notifications            |
| 22  | GET    | /api/notifications/unread-count                 | 200 OK      | private  | Get count of unread notifications   |
| 23  | PUT    | /api/notifications/{id}/read                    | 200 OK      | private  | Mark notification as read           |
| 24  | PUT    | /api/notifications/mark-all-read                | 200 OK      | private  | Mark all notifications as read      |
| 25  | DELETE | /api/notifications/{id}                         | 200 OK      | private  | Delete notification                 |
| 26  | POST   | /api/employees/onboard                          | 201 CREATED | private  | Employee self-onboarding            |
| 27  | GET    | /api/employees                                  | 200 OK      | manager  | Get all employees (admin/manager)   |
| 28  | POST   | /api/employees                                  | 201 CREATED | admin    | Create employee (admin only)        |
| 29  | GET    | /api/employees/{id}                             | 200 OK      | private  | Get specific employee               |
| 30  | PUT    | /api/employees/{id}                             | 200 OK      | admin    | Update employee (admin only)        |
| 31  | GET    | /api/departments                                | 200 OK      | private  | Get all departments                 |
| 32  | POST   | /api/departments                                | 201 CREATED | admin    | Create new department (admin only)  |
| 33  | GET    | /api/departments/{id}                           | 200 OK      | private  | Get specific department             |
| 34  | PUT    | /api/departments/{id}                           | 200 OK      | admin    | Update department (admin only)      |
| 35  | DELETE | /api/departments/{id}                           | 200 OK      | admin    | Delete department (admin only)      |
| 36  | GET    | /api/reports/leave-by-department                | 200 OK      | manager  | Get department leave report         |
| 37  | GET    | /api/reports/leave-by-employee/{employeeId}     | 200 OK      | manager  | Get employee leave report           |
| 38  | GET    | /api/reports/leave-by-type                      | 200 OK      | manager  | Get leave type report               |
| 39  | GET    | /api/reports/leave-calendar                     | 200 OK      | private  | Get leave calendar                  |
| 40  | GET    | /api/reports/export/csv                         | 200 OK      | admin    | Export to CSV (admin only)          |
| 41  | GET    | /api/reports/export/excel                       | 200 OK      | admin    | Export to Excel (admin only)        |