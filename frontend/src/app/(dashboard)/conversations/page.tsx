'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function ConversationsEmptyState() {
  const { isEndUser } = useAuth();

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6 text-indigo-500 dark:text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isEndUser() ? 'Welcome to Customer Support' : 'Customer Conversations'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isEndUser() 
            ? 'Select a conversation from the sidebar or start a new one by visiting our merchants list.' 
            : 'Select a conversation from the sidebar to view and respond to customer inquiries.'}
        </p>
      </div>
    </div>
  );
} 