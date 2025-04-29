// filepath: src/middleware/validation.ts
import { body } from 'express-validator';

export const leaveRequestValidation = [
  body('leaveTypeId')
    .notEmpty()
    .withMessage('Leave type is required'),
  body('startDate')
    .isDate()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isDate()
    .withMessage('Valid end date is required')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('reason')
    .optional(),
];

export const leaveTypeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Leave type name is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('accrualRate')
    .isNumeric()
    .withMessage('Accrual rate must be a number'),
  body('requiresDocumentation')
    .isBoolean()
    .withMessage('Requires documentation must be a boolean'),
  body('requiresApproval')
    .isBoolean()
    .withMessage('Requires approval must be a boolean'),
];

export const leaveBalanceAdjustmentValidation = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
  body('leaveTypeId')
    .notEmpty()
    .withMessage('Leave type ID is required'),
  body('adjustment')
    .isNumeric()
    .withMessage('Adjustment must be a number'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required for audit purposes'),
];