'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Conversation } from '@/services/api';
import ConversationListItem from '@/components/ConversationListItem';

// UI Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="p-4 text-red-700 dark:text-red-400 text-sm">
    {message}
  </div>
);

const EmptyConversations = ({ isEndUser }: { isEndUser: boolean }) => (
  <div className="p-4 text-center">
    <p className="text-gray-600 dark:text-gray-400 mb-4">No conversations yet</p>
    {isEndUser && (
      <Link 
        href="/merchants" 
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
      >
        Find Merchants
      </Link>
    )}
  </div>
);

const SidebarHeader = ({ title, isEndUser, isMerchantStaff }) => (
  <div className="p-4 border-b dark:border-gray-700 hidden md:flex items-center justify-between">
    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
    
    {isEndUser && (
      <Link 
        href="/merchants" 
        className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors text-sm"
      >
        New Chat
      </Link>
    )}
    
    {isMerchantStaff && (
      <Link 
        href="/merchant/dashboard" 
        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
      >
        Dashboard
      </Link>
    )}
  </div>
);

const MobileHeader = ({ title, toggleSidebar }: { title: string, toggleSidebar: () => void }) => (
  <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
    <button
      onClick={toggleSidebar}
      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
);

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isEndUser, isMerchantStaff } = useAuth();
  const pathname = usePathname();
  const isConversationSelected = pathname !== '/conversations';
  
  const toggleSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const title = isEndUser() ? 'My Conversations' : 'Customer Conversations';

  // Fetch conversations for the sidebar
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await apiService.getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    const intervalId = setInterval(fetchConversations, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Render sidebar content
  const renderSidebarContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (conversations.length === 0) return <EmptyConversations isEndUser={isEndUser()} />;
    
    return (
      <div>
        {conversations.map((conversation) => (
          <ConversationListItem 
            key={conversation.id} 
            conversation={conversation} 
            isActive={pathname === `/conversations/${conversation.id}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      <MobileHeader title={title} toggleSidebar={toggleSidebar} />

      {/* Sidebar for conversations list */}
      <div className={`
        md:w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-hidden flex flex-col
        ${mobileSidebarOpen ? 'block' : 'hidden'} md:block
        ${isConversationSelected ? 'hidden md:block' : 'block'}
      `}>
        <SidebarHeader 
          title={title} 
          isEndUser={isEndUser()} 
          isMerchantStaff={isMerchantStaff()} 
        />

        <div className="flex-1 overflow-y-auto">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
} 