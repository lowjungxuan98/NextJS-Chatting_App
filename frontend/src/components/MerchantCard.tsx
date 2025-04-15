'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Merchant } from '@/services/api';
import { apiService } from '@/services/api';

interface MerchantCardProps {
  merchant: Merchant;
}

// Logo component to handle merchant logo or initial
const MerchantLogo = ({ name, logoUrl }: { name: string; logoUrl?: string }) => {
  if (logoUrl) {
    return (
      <div className="relative w-12 h-12 mr-3 rounded-full overflow-hidden">
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          className="object-cover"
        />
      </div>
    );
  }
  
  return (
    <div className="w-12 h-12 mr-3 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
      <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-300">
        {name.charAt(0)}
      </span>
    </div>
  );
};

export default function MerchantCard({ merchant }: MerchantCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id, name, description, logoUrl } = merchant;

  const handleStartChat = async () => {
    setLoading(true);
    
    try {
      // Create conversation and send initial message
      const response = await apiService.startConversation(id);
      await apiService.sendMessage(
        response.conversationId, 
        `Hello! I'd like to chat with ${name}.`
      );
      
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
          <MerchantLogo name={name} logoUrl={logoUrl} />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{name}</h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{description}</p>
        
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