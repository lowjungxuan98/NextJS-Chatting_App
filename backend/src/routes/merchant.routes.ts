import express from 'express';
import { getMerchants } from '../controllers/merchant.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Get all merchants
router.get('/', authenticate, getMerchants);

export default router; 