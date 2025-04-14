import express from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/auth.controller';

const router = express.Router();

// Register endpoint
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('type').isIn(['end_user', 'merchant_staff']).withMessage('Type must be either end_user or merchant_staff'),
    body('role').optional().isIn(['admin', 'manager', 'staff']).withMessage('Role must be admin, manager, or staff'),
    body('merchantId').optional().isInt().withMessage('Merchant ID must be an integer')
  ],
  register
);

// Login endpoint
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

export default router; 