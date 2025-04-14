import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getStaffMembers = async (req: Request, res: Response) => {
  try {
    // Get staff members for the current merchant
    const merchantId = req.user!.merchantId;

    const staffMembers = await prisma.user.findMany({
      where: {
        merchantId,
        type: 'merchant_staff',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        merchantId: true,
      },
    });

    res.status(200).json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff members:', error);
    res.status(500).json({ message: 'Failed to fetch staff members' });
  }
};

export const createStaffMember = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, merchantId } = req.body;

    // Check if user is authorized to manage this merchant
    if (req.user!.merchantId !== merchantId) {
      return res.status(403).json({ message: 'Not authorized to create staff for this merchant' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new staff member
    const newStaff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type: 'merchant_staff',
        role,
        merchantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        merchantId: true,
      },
    });

    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ message: 'Failed to create staff member' });
  }
};

export const updateStaffMember = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const merchantId = req.user!.merchantId;

    // Find the staff member to update
    const staffMember = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if user is authorized to update this staff member
    if (staffMember.merchantId !== merchantId) {
      return res.status(403).json({ message: 'Not authorized to update this staff member' });
    }

    // Prepare data for update
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;

    // Update staff member
    const updatedStaff = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        merchantId: true,
      },
    });

    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ message: 'Failed to update staff member' });
  }
};

export const deleteStaffMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const merchantId = req.user!.merchantId;

    // Find the staff member to delete
    const staffMember = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if user is authorized to delete this staff member
    if (staffMember.merchantId !== merchantId) {
      return res.status(403).json({ message: 'Not authorized to delete this staff member' });
    }

    // Cannot delete yourself
    if (staffMember.id === req.user!.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete staff member
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
}; 