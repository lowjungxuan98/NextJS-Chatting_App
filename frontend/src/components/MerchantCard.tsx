'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Merchant } from '@/services/api';
import { apiService } from '@/services/api';

interface MerchantCardProps {
  merchant: Merchant;
}

export default function MerchantCard({ merchant }: MerchantCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const response = await apiService.startConversation(merchant.id);
      router.push(`/conversations/${response.conversationId}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-4">
          {merchant.logoUrl ? (
            <div className="relative w-12 h-12 mr-3 rounded-full overflow-hidden">
              <Image
                src={merchant.logoUrl}
                alt={`${merchant.name} logo`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 mr-3 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-300">
                {merchant.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{merchant.name}</h3>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{merchant.description}</p>
        
        <button
          onClick={handleStartChat}
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Starting chat...' : 'Start Chat'}
        </button>
      </div>
    </div>
  );
} 