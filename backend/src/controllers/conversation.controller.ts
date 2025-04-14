import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient, UserType } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

const prisma = new PrismaClient();

// Reference to Socket.IO server (will be set from index.ts)
let io: SocketIOServer;

export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

/**
 * Start a new conversation
 * POST /api/conversations
 * Only end users can start conversations
 */
export const startConversation = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { merchantId } = req.body;
    const userId = req.user!.id;

    // Verify merchant exists
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    });

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        endUserId: userId,
        merchantId: merchantId,
        // No staff assigned initially
      }
    });

    return res.status(201).json({
      message: 'Conversation started',
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get my conversations
 * GET /api/conversations
 * End users see their conversations
 * Merchant staff see all conversations for their merchant
 */
export const getMyConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userType = req.user!.type;
    const merchantId = req.user!.merchantId;
    
    let conversations;
    
    if (userType === UserType.end_user) {
      // End users see their own conversations
      conversations = await prisma.conversation.findMany({
        where: {
          endUserId: userId
        },
        include: {
          merchant: {
            select: {
              name: true
            }
          },
          assignedTo: {
            select: {
              name: true
            }
          },
          messages: {
            orderBy: {
              sentAt: 'desc'
            },
            take: 1,
            select: {
              messageText: true,
              sentAt: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Format the response for end users
      const formattedConversations = conversations.map(conv => {
        return {
          id: conv.id,
          merchantName: conv.merchant.name,
          lastMessage: conv.messages[0]?.messageText || null,
          lastMessageTime: conv.messages[0]?.sentAt || null,
          assignedToName: conv.assignedTo?.name || null,
          startedAt: conv.startedAt
        };
      });

      return res.json(formattedConversations);
    } else {
      // Merchant staff see conversations for their merchant
      conversations = await prisma.conversation.findMany({
        where: {
          merchantId: merchantId
        },
        include: {
          endUser: {
            select: {
              name: true
            }
          },
          assignedTo: {
            select: {
              name: true
            }
          },
          messages: {
            orderBy: {
              sentAt: 'desc'
            },
            take: 1,
            select: {
              messageText: true,
              sentAt: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Format the response for merchant staff
      const formattedConversations = conversations.map(conv => {
        return {
          id: conv.id,
          endUserName: conv.endUser.name,
          lastMessage: conv.messages[0]?.messageText || null,
          lastMessageTime: conv.messages[0]?.sentAt || null,
          assignedToName: conv.assignedTo?.name || null,
          startedAt: conv.startedAt
        };
      });

      return res.json(formattedConversations);
    }
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get conversation details
 * GET /api/conversations/:id
 * Returns the conversation with its messages
 */
export const getConversationDetails = async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id);

    // Get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        endUser: {
          select: {
            id: true,
            name: true
          }
        },
        merchant: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        messages: {
          orderBy: {
            sentAt: 'asc'
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Format the messages
    const formattedMessages = conversation.messages.map(msg => {
      return {
        id: msg.id,
        senderName: msg.sender.name,
        senderId: msg.sender.id,
        text: msg.messageText,
        sentAt: msg.sentAt,
        isMerchantStaff: msg.sender.type === UserType.merchant_staff
      };
    });

    // Format the response
    const response = {
      id: conversation.id,
      endUserName: conversation.endUser.name,
      merchantName: conversation.merchant.name,
      assignedToName: conversation.assignedTo?.name || null,
      assignedToId: conversation.assignedTo?.id || null,
      messages: formattedMessages,
      startedAt: conversation.startedAt
    };

    return res.json(response);
  } catch (error) {
    console.error('Error getting conversation details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send a message in a conversation
 * POST /api/conversations/:id/messages
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conversationId = parseInt(req.params.id);
    const userId = req.user!.id;
    const userType = req.user!.type;
    const { text } = req.body;

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        merchant: true,
        endUser: true
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Handle staff replies - auto-assign if not already assigned
    if (userType === UserType.merchant_staff && !conversation.assignedToId) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { assignedToId: userId }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        messageText: text
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    // Update conversation lastUpdated timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Emit message to conversation room via Socket.IO
    if (io) {
      const roomName = `conversation_${conversationId}`;
      io.to(roomName).emit('message', {
        id: message.id,
        conversationId,
        senderName: message.sender.name,
        senderId: message.sender.id,
        text: message.messageText,
        sentAt: message.sentAt,
        isMerchantStaff: message.sender.type === UserType.merchant_staff
      });
    }

    return res.status(201).json({
      message: 'Message sent',
      messageId: message.id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Assign a conversation to a staff member
 * PUT /api/conversations/:id/assign
 * Only merchant admins and managers can assign conversations
 */
export const assignConversation = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conversationId = parseInt(req.params.id);
    const { staffId } = req.body;
    const merchantId = req.user!.merchantId;

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Ensure conversation belongs to the staff's merchant
    if (conversation.merchantId !== merchantId) {
      return res.status(403).json({ message: 'Cannot assign conversation from a different merchant' });
    }

    // Verify staff exists and belongs to this merchant
    const staff = await prisma.user.findFirst({
      where: {
        id: staffId,
        type: UserType.merchant_staff,
        merchantId: merchantId
      }
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found or does not belong to your merchant' });
    }

    // Assign the conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { assignedToId: staffId }
    });

    // Emit assignment update via Socket.IO
    if (io) {
      const roomName = `conversation_${conversationId}`;
      io.to(roomName).emit('conversation_assigned', {
        conversationId,
        staffId,
        staffName: staff.name
      });
    }

    return res.json({
      message: 'Conversation assigned successfully',
      staffId,
      staffName: staff.name
    });
  } catch (error) {
    console.error('Error assigning conversation:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 