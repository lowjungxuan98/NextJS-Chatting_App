import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { UserType, UserRole } from '@prisma/client';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        type: UserType;
        role?: UserRole;
        merchantId?: number;
      };
    }
  }
}

// Verify JWT token
export function verifyToken(token: string): jwt.JwtPayload | string {
  const secret = process.env.JWT_SECRET || 'default_secret_change_this';
  return jwt.verify(token, secret);
}

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as jwt.JwtPayload;
    
    req.user = {
      id: decoded.id,
      type: decoded.type as UserType,
      role: decoded.role as UserRole | undefined,
      merchantId: decoded.merchantId
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Authorization middleware for end users only
export const authorizeEndUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.type !== UserType.end_user) {
    return res.status(403).json({ message: 'Only end users can perform this action' });
  }
  next();
};

// Authorization middleware for merchant staff only
export const authorizeMerchantStaff = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.type !== UserType.merchant_staff) {
    return res.status(403).json({ message: 'Only merchant staff can perform this action' });
  }
  next();
};

// Authorization middleware for admins and managers
export const authorizeAdminManager = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.type !== UserType.merchant_staff || 
      !(req.user.role === UserRole.admin || req.user.role === UserRole.manager)) {
    return res.status(403).json({ message: 'Only admins and managers can perform this action' });
  }
  next();
};

// Conversation access middleware
export const authorizeConversationAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    let hasAccess = false;

    if (req.user.type === UserType.end_user) {
      // End user can only access their own conversations
      hasAccess = conversation.endUserId === req.user.id;
    } else if (req.user.type === UserType.merchant_staff) {
      // Staff can only access conversations for their merchant
      hasAccess = conversation.merchantId === req.user.merchantId;
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Unauthorized access to this conversation' });
    }

    next();
  } catch (error) {
    console.error('Error in conversation access middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 