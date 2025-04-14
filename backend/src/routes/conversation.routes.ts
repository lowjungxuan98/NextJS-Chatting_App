import express from 'express';
import { body } from 'express-validator';
import {
  startConversation,
  getMyConversations,
  getConversationDetails,
  sendMessage,
  assignConversation
} from '../controllers/conversation.controller';
import { 
  authenticate, 
  authorizeEndUser, 
  authorizeMerchantStaff, 
  authorizeAdminManager,
  authorizeConversationAccess
} from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Start conversation (end users only)
router.post(
  '/',
  [
    body('merchantId').isInt().withMessage('Merchant ID must be an integer')
  ],
  authorizeEndUser,
  startConversation
);

// Get my conversations (both end users and merchant staff)
router.get('/', getMyConversations);

// Get conversation details (participants only)
router.get('/:id', authorizeConversationAccess, getConversationDetails);

// Send message (participants only)
router.post(
  '/:id/messages',
  [
    body('text').notEmpty().withMessage('Message text is required')
  ],
  authorizeConversationAccess,
  sendMessage
);

// Assign conversation (admin and managers only)
router.put(
  '/:id/assign',
  [
    body('staffId').isInt().withMessage('Staff ID must be an integer')
  ],
  authorizeMerchantStaff,
  authorizeAdminManager,
  assignConversation
);

export default router; 