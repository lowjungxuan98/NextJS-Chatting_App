'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Conversation, StaffMember } from '@/services/api';
import ConversationListItem from '@/components/ConversationListItem';
import StaffSelector from '@/components/StaffSelector';

export default function MerchantDashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAdmin, isManager, isMerchantStaff } = useAuth();
  const router = useRouter();

  // Redirect if not merchant staff
  useEffect(() => {
    if (!loading && !isMerchantStaff()) {
      router.push('/conversations');
    }
  }, [loading, isMerchantStaff, router]);

  // Fetch conversations and staff members
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [conversationsData, staffData] = await Promise.all([
          apiService.getConversations(),
          (isAdmin() || isManager()) ? apiService.getStaffMembers() : Promise.resolve([])
        ]);
        
        setConversations(conversationsData);
        setStaffMembers(staffData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, isManager]);

  // Filter conversations by assignment status
  const unassignedConversations = conversations.filter(
    conv => conv.assignedStaffId === null
  );
  const assignedToMeConversations = conversations.filter(
    conv => conv.assignedStaffId === user?.id
  );
  const otherAssignedConversations = conversations.filter(
    conv => conv.assignedStaffId !== null && conv.assignedStaffId !== user?.id
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Merchant Dashboard</h1>
        
        <div className="flex space-x-4">
          <Link 
            href="/conversations" 
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            View All Conversations
          </Link>
          
          {(isAdmin() || isManager()) && (
            <Link 
              href="/merchant/staff" 
              className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Manage Staff
            </Link>
          )}
        </div>
      </div>

      {/* Dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unassigned</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{unassignedConversations.length}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Assigned to me</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{assignedToMeConversations.length}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total active</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{conversations.length}</p>
        </div>
      </div>

      {/* Unassigned conversations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Unassigned Conversations</h2>
        
        {unassignedConversations.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-gray-500 dark:text-gray-400 text-center">
            No unassigned conversations
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {unassignedConversations.map((conversation) => (
              <div key={conversation.id} className="border-b dark:border-gray-700 last:border-b-0">
                <div className="p-4">
                  <ConversationListItem conversation={conversation} />
                  
                  {(isAdmin() || isManager()) && (
                    <div className="mt-2 flex justify-end">
                      <StaffSelector
                        conversationId={conversation.id}
                        staffMembers={staffMembers}
                        currentAssignedStaffId={conversation.assignedStaffId}
                        onAssignmentChange={() => {
                          // Refresh conversations after assignment
                          apiService.getConversations().then(setConversations);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My assigned conversations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Conversations</h2>
        
        {assignedToMeConversations.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-gray-500 dark:text-gray-400 text-center">
            No conversations assigned to you
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {assignedToMeConversations.map((conversation) => (
              <ConversationListItem key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}
      </div>

      {/* Other assigned conversations */}
      {(isAdmin() || isManager()) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Other Assigned Conversations</h2>
          
          {otherAssignedConversations.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-gray-500 dark:text-gray-400 text-center">
              No conversations assigned to other staff members
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              {otherAssignedConversations.map((conversation) => (
                <div key={conversation.id} className="border-b dark:border-gray-700 last:border-b-0">
                  <div className="p-4">
                    <ConversationListItem conversation={conversation} />
                    
                    <div className="mt-2 flex justify-end">
                      <StaffSelector
                        conversationId={conversation.id}
                        staffMembers={staffMembers}
                        currentAssignedStaffId={conversation.assignedStaffId}
                        onAssignmentChange={() => {
                          // Refresh conversations after assignment
                          apiService.getConversations().then(setConversations);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 