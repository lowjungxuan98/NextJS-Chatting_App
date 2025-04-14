'use client';

import { io, Socket } from 'socket.io-client';
import { Message } from './api';

// Define socket event types
export interface SocketMessage extends Message {}

export interface ConversationAssigned {
  conversationId: number;
  staffId: number;
  staffName: string;
}

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket) return socket;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  socket = io(API_URL, {
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const joinConversation = (conversationId: number): void => {
  if (!socket) return;
  socket.emit('join_conversation', conversationId);
};

export const leaveConversation = (conversationId: number): void => {
  if (!socket) return;
  socket.emit('leave_conversation', conversationId);
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
}; 