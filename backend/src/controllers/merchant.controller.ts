import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMerchants = async (req: Request, res: Response) => {
  try {
    const merchants = await prisma.merchant.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.status(200).json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ message: 'Failed to fetch merchants' });
  }
}; 