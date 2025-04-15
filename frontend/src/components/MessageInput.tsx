'use client';

import { useState, KeyboardEvent } from 'react';
import { apiService } from '@/services/api';

interface MessageInputProps {
  conversationId: number;
  onMessageSent?: () => void;
}

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
);

export default function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isMessageEmpty = !message.trim();
  
  const handleSendMessage = async () => {
    if (isMessageEmpty || isSending) return;
    
    setIsSending(true);
    try {
      await apiService.sendMessage(conversationId, message);
      setMessage('');
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white resize-none"
          placeholder="Type your message... (Enter to send)"
          disabled={isSending}
        />
        <button
          onClick={handleSendMessage}
          disabled={isMessageEmpty || isSending}
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          aria-label="Send message"
        >
          {isSending ? <LoadingSpinner /> : "Send"}
        </button>
      </div>
    </div>
  );
} 