'use client';

import { useRouter } from 'next/navigation';
import { Conversation } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

// Helper for formatting dates
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isWithinWeek = now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
    
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isWithinWeek) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export default function ConversationListItem({ conversation, isActive = false }: ConversationListItemProps) {
  const router = useRouter();
  const { isEndUser } = useAuth();
  const { id, merchantName, endUserName, assignedStaffName, assignedStaffId, lastMessageTime, lastMessage, unreadCount } = conversation;
  
  const handleClick = () => router.push(`/conversations/${id}`);

  // Determine background styles based on status
  const getBgClasses = () => {
    if (isActive) return 'bg-indigo-50 dark:bg-indigo-900/40 border-l-4 border-l-indigo-600';
    if (unreadCount > 0) return 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30';
    return 'hover:bg-gray-50 dark:hover:bg-gray-700/40';
  };

  // Determine title text styles
  const getTitleClasses = () => 
    isActive ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100';

  // Determine conversation name to display
  const displayName = isEndUser() ? merchantName : endUserName;

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-colors ${getBgClasses()}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium ${getTitleClasses()}`}>{displayName}</h3>
          
          {assignedStaffName && !isEndUser() && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium mr-1">
                {assignedStaffId ? `Assigned to: ${assignedStaffName}` : 'Unassigned'}
              </span>
            </p>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(lastMessageTime)}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
        {lastMessage}
      </p>
      
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 dark:bg-indigo-500 rounded-full">
            {unreadCount}
          </span>
        </div>
      )}
    </div>
  );
} 