'use client';

import { Message } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface MessageProps {
  message: Message;
}

// Helper to format timestamp
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function MessageItem({ message }: MessageProps) {
  const { isEndUser } = useAuth();
  const { text, sentAt, senderName, isMerchantStaff } = message;
  
  // Determine if the message is from the current user
  const isFromCurrentUser = (isEndUser() && !isMerchantStaff) || 
                           (!isEndUser() && isMerchantStaff);

  // Determine styling based on message sender
  const containerClasses = isFromCurrentUser ? 'justify-end' : 'justify-start';
  
  const messageClasses = isFromCurrentUser 
    ? 'bg-indigo-600 text-white rounded-br-none' 
    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none';
  
  const timeClasses = isFromCurrentUser 
    ? 'text-indigo-200' 
    : 'text-gray-500 dark:text-gray-400';

  return (
    <div className={`flex ${containerClasses} mb-4`}>
      <div className={`rounded-lg py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg ${messageClasses}`}>
        {!isFromCurrentUser && (
          <div className="font-medium text-sm mb-1">
            {senderName}
            {isMerchantStaff && isEndUser() && (
              <span className="text-indigo-900 dark:text-indigo-200"> (Staff)</span>
            )}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        <div className={`text-xs mt-1 ${timeClasses}`}>
          {formatTime(sentAt)}
        </div>
      </div>
    </div>
  );
} 