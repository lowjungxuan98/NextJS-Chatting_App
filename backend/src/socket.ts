import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './index';
import { verifyToken } from './middlewares/auth.middleware';
import { JwtPayload } from 'jsonwebtoken';

export function setupSocket(io: SocketIOServer) {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = verifyToken(token) as JwtPayload;
      socket.data.user = {
        id: decoded.id,
        type: decoded.type,
        role: decoded.role,
        merchantId: decoded.merchantId
      };
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join conversation room
    socket.on('join_conversation', async (conversationId: number) => {
      try {
        const userId = socket.data.user.id;
        const userType = socket.data.user.type;
        const merchantId = socket.data.user.merchantId;

        // Verify if user has access to this conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        if (!conversation) {
          socket.emit('error', 'Conversation not found');
          return;
        }

        let hasAccess = false;

        if (userType === 'end_user') {
          // End user can only access their own conversations
          hasAccess = conversation.endUserId === userId;
        } else if (userType === 'merchant_staff') {
          // Staff can only access conversations related to their merchant
          hasAccess = conversation.merchantId === merchantId;
        }

        if (!hasAccess) {
          socket.emit('error', 'Unauthorized access to conversation');
          return;
        }

        const roomName = `conversation_${conversationId}`;
        socket.join(roomName);
        console.log(`User ${userId} joined room ${roomName}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', 'Failed to join conversation');
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: number) => {
      const roomName = `conversation_${conversationId}`;
      socket.leave(roomName);
      console.log(`User left room ${roomName}`);
    });

    // New message handler is implemented in the message controller
    // This is just the socket connection handling

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
} 