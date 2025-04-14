import { PrismaClient, UserType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  // Clear existing data
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.merchant.deleteMany({});

  console.log('Seeding database...');

  // Create merchants
  const merchant1 = await prisma.merchant.create({
    data: {
      name: 'TechStore Inc.',
    },
  });

  const merchant2 = await prisma.merchant.create({
    data: {
      name: 'Fashion Outlet',
    },
  });

  console.log('Created merchants');

  // Create users - both end users and merchant staff
  // End users
  const endUser1 = await prisma.user.create({
    data: {
      name: 'John Customer',
      email: 'john@example.com',
      password: await hashPassword('password123'),
      type: UserType.end_user,
    },
  });

  const endUser2 = await prisma.user.create({
    data: {
      name: 'Sarah Buyer',
      email: 'sarah@example.com',
      password: await hashPassword('password123'),
      type: UserType.end_user,
    },
  });

  // Merchant 1 staff
  const adminUser1 = await prisma.user.create({
    data: {
      name: 'Admin Smith',
      email: 'admin@techstore.com',
      password: await hashPassword('admin123'),
      type: UserType.merchant_staff,
      role: UserRole.admin,
      merchantId: merchant1.id,
    },
  });

  const managerUser1 = await prisma.user.create({
    data: {
      name: 'Mike Manager',
      email: 'manager@techstore.com',
      password: await hashPassword('manager123'),
      type: UserType.merchant_staff,
      role: UserRole.manager,
      merchantId: merchant1.id,
    },
  });

  const staffUser1 = await prisma.user.create({
    data: {
      name: 'Steve Support',
      email: 'staff1@techstore.com',
      password: await hashPassword('staff123'),
      type: UserType.merchant_staff,
      role: UserRole.staff,
      merchantId: merchant1.id,
    },
  });

  // Merchant 2 staff
  const adminUser2 = await prisma.user.create({
    data: {
      name: 'Fashion Admin',
      email: 'admin@fashion.com',
      password: await hashPassword('admin123'),
      type: UserType.merchant_staff,
      role: UserRole.admin,
      merchantId: merchant2.id,
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      name: 'Taylor Rep',
      email: 'staff@fashion.com',
      password: await hashPassword('staff123'),
      type: UserType.merchant_staff,
      role: UserRole.staff,
      merchantId: merchant2.id,
    },
  });

  console.log('Created users');

  // Create conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      endUserId: endUser1.id,
      merchantId: merchant1.id,
      assignedToId: staffUser1.id,
    },
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      endUserId: endUser2.id,
      merchantId: merchant2.id,
      assignedToId: staffUser2.id,
    },
  });

  const conversation3 = await prisma.conversation.create({
    data: {
      endUserId: endUser1.id,
      merchantId: merchant2.id,
      // Intentionally left unassigned
    },
  });

  console.log('Created conversations');

  // Create messages
  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: endUser1.id,
      messageText: 'Hello, I have a question about my recent order #12345.',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: staffUser1.id,
      messageText: 'Hi John, this is Steve from TechStore. How can I help you with your order today?',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: endUser1.id,
      messageText: 'I ordered a laptop but received a tablet instead.',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation2.id,
      senderId: endUser2.id,
      messageText: 'Do you have the blue dress in size medium?',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation2.id,
      senderId: staffUser2.id,
      messageText: 'Hi Sarah, this is Taylor. Let me check our inventory for you.',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation3.id,
      senderId: endUser1.id,
      messageText: 'I need to return an item I purchased last week.',
    },
  });

  console.log('Created messages');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 