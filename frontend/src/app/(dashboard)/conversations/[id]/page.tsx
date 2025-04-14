'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Message, Conversation } from '@/services/api';
import MessageItem from '@/components/Message';
import MessageInput from '@/components/MessageInput';
import { initializeSocket, joinConversation, leaveConversation, getSocket, SocketMessage, ConversationAssigned } from '@/services/socket';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  // Unwrap params using the use hook
  const { id } = use(params);
  const conversationId = parseInt(id);
  const { user, token, isEndUser, isAdmin, isManager } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;
    
    initializeSocket(token);
    
    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [token, conversationId]);

  // Join conversation channel and listen for messages
  useEffect(() => {
    if (!conversationId || !token) return;
    
    const socket = getSocket();
    if (!socket) return;
    
    joinConversation(conversationId);
    
    // Listen for new messages
    const handleNewMessage = (data: SocketMessage) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
    };
    
    // Listen for conversation assignments
    const handleConversationAssigned = (data: ConversationAssigned) => {
      if (data.conversationId === conversationId) {
        setConversation(prev => 
          prev ? {
            ...prev,
            assignedStaffId: data.staffId,
            assignedStaffName: data.staffName
          } : null
        );
      }
    };
    
    socket.on('message', handleNewMessage);
    socket.on('conversation_assigned', handleConversationAssigned);
    
    return () => {
      socket.off('message', handleNewMessage);
      socket.off('conversation_assigned', handleConversationAssigned);
    };
  }, [conversationId, token]);

  // Fetch conversation data
  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;
      
      try {
        setLoading(true);
        const data = await apiService.getConversation(conversationId);
        console.log('API Response:', data);
        setConversation(data.conversation);
        setMessages(data.messages);
        console.log('Conversation:', data.conversation);
        console.log('Messages:', data.messages);
      } catch (err: any) {
        console.error('Error fetching conversation:', err);
        setError('Failed to load conversation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle assigning the conversation to a staff member
  const handleAssignStaff = async () => {
    if (!conversation || !user || !user.id) return;
    
    try {
      await apiService.assignConversation(conversation.id, user.id);
      // The UI will update via the socket event
    } catch (err) {
      console.error('Error assigning conversation:', err);
      alert('Failed to assign conversation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400 text-center max-w-md w-full">
          {error}
        </div>
      </div>
    );
  }

  console.log("Before rendering, conversation:", conversation);
  console.log("Before rendering, messages:", messages);
  
  // Show messages even if conversation is null
  if (!conversation && messages.length > 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chat</h1>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t dark:border-gray-700 border-gray-200 bg-white dark:bg-gray-800 p-4">
          <MessageInput 
            conversationId={conversationId} 
            onMessageSent={() => {
              // Messages will update via socket
            }} 
          />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-yellow-700 dark:text-yellow-400 text-center max-w-md w-full">
          Conversation not found or you don't have permission to view it.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Conversation header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEndUser() ? conversation.merchantName : `User #${conversation.userId}`}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEndUser() && conversation.assignedStaffName && (
                <span>Speaking with: {conversation.assignedStaffName}</span>
              )}
              {!isEndUser() && conversation.assignedStaffName ? (
                <span>Assigned to: {conversation.assignedStaffName}</span>
              ) : !isEndUser() ? (
                <span className="text-yellow-600 dark:text-yellow-500">Unassigned</span>
              ) : null}
            </p>
          </div>
          
          <div className="flex items-center">
            {!isEndUser() && !conversation.assignedStaffName && (isAdmin() || isManager() || !conversation.assignedStaffId) && (
              <button
                onClick={handleAssignStaff}
                className="ml-2 bg-indigo-600 dark:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                {isAdmin() || isManager() ? 'Assign to me' : 'Take conversation'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No messages yet. Start the conversation by sending a message below.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input with improved styling */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <MessageInput 
          conversationId={conversationId} 
          onMessageSent={() => {
            // Messages will update via socket
          }} 
        />
      </div>
    </div>
  );
} 