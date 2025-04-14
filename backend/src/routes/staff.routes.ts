import express from 'express';
import { body } from 'express-validator';
import { 
  getStaffMembers, 
  createStaffMember, 
  updateStaffMember, 
  deleteStaffMember 
} from '../controllers/staff.controller';
import { 
  authenticate, 
  authorizeMerchantStaff, 
  authorizeAdminManager 
} from '../middlewares/auth.middleware';

const router = express.Router();

// All staff routes require authentication
router.use(authenticate);
// All staff routes require merchant staff role
router.use(authorizeMerchantStaff);
// All staff management routes require admin or manager role
router.use(authorizeAdminManager);

// Get all staff members for the current merchant
router.get('/', getStaffMembers);

// Create a new staff member
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'staff']).withMessage('Role must be admin, manager, or staff'),
    body('merchantId').isInt().withMessage('Merchant ID must be an integer')
  ],
  createStaffMember
);

// Update a staff member
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'staff']).withMessage('Role must be admin, manager, or staff')
  ],
  updateStaffMember
);

// Delete a staff member
router.delete('/:id', deleteStaffMember);

export default router; 