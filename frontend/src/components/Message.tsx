'use client';

import { Message } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface MessageProps {
  message: Message;
}

export default function MessageItem({ message }: MessageProps) {
  const { isEndUser } = useAuth();
  
  // Format the timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine if the message is from the current user
  const isFromCurrentUser = () => {
    return (isEndUser() && !message.isMerchantStaff) || 
           (!isEndUser() && message.isMerchantStaff);
  };

  return (
    <div className={`flex ${isFromCurrentUser() ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`rounded-lg py-2 px-4 max-w-xs md:max-w-md lg:max-w-lg ${
          isFromCurrentUser() 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
      >
        {!isFromCurrentUser() && (
          <div className="font-medium text-sm mb-1">
            {message.senderName}
            {message.isMerchantStaff && isEndUser() && (
              <span className="text-indigo-900 dark:text-indigo-200"> (Staff)</span>
            )}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <div 
          className={`text-xs mt-1 ${
            isFromCurrentUser() ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatTime(message.sentAt)}
        </div>
      </div>
    </div>
  );
} 