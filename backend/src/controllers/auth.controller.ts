import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, type, role, merchantId } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate merchant staff registration
    if (type === UserType.merchant_staff) {
      if (!role) {
        return res.status(400).json({ message: 'Role is required for merchant staff' });
      }
      
      if (!merchantId) {
        return res.status(400).json({ message: 'Merchant ID is required for merchant staff' });
      }

      // Verify merchant exists
      const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId }
      });

      if (!merchant) {
        return res.status(400).json({ message: 'Merchant not found' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type: type as UserType,
        role: role as UserRole,
        merchantId: type === UserType.merchant_staff ? merchantId : null
      }
    });

    // Create JWT token
    const payload = {
      id: newUser.id,
      type: newUser.type,
      role: newUser.role,
      merchantId: newUser.merchantId
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret_change_this',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
        role: newUser.role,
        merchantId: newUser.merchantId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login an existing user
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      id: user.id,
      type: user.type,
      role: user.role,
      merchantId: user.merchantId
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret_change_this',
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        role: user.role,
        merchantId: user.merchantId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 