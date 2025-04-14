'use client';

import { useRouter } from 'next/navigation';
import { Conversation } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export default function ConversationListItem({ conversation, isActive = false }: ConversationListItemProps) {
  const router = useRouter();
  const { isEndUser } = useAuth();
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      // Ensure we have a valid date string
      if (!dateString) return '';
      
      const date = new Date(dateString);
      
      // Check for invalid date
      if (isNaN(date.getTime())) {
        console.error(`Invalid date format: ${dateString}`);
        return '';
      }
      
      const now = new Date();
      
      // If it's today, show only time
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // If it's within the last week, show day name
      if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
      
      // Otherwise show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleClick = () => {
    router.push(`/conversations/${conversation.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-colors ${
        isActive 
          ? 'bg-indigo-50 dark:bg-indigo-900/40 border-l-4 border-l-indigo-600' 
          : conversation.unreadCount > 0 
            ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium ${isActive ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>
            {isEndUser() ? conversation.merchantName : `${conversation.endUserName}`}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
            {conversation.assignedStaffName && !isEndUser() && (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium mr-1">
                {conversation.assignedStaffId ? `Assigned to: ${conversation.assignedStaffName}` : 'Unassigned'}
              </span>
            )}
          </p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(conversation.lastMessageTime)}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
        {conversation.lastMessage}
      </p>
      
      {conversation.unreadCount > 0 && (
        <div className="flex justify-end">
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 dark:bg-indigo-500 rounded-full">
            {conversation.unreadCount}
          </span>
        </div>
      )}
    </div>
  );
} 