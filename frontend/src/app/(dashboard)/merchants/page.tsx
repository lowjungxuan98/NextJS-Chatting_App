'use client';

import { useState, useEffect } from 'react';
import { apiService, Merchant } from '@/services/api';
import MerchantCard from '@/components/MerchantCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isEndUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only end users should access this page
    if (!isEndUser()) {
      router.push('/conversations');
      return;
    }

    const fetchMerchants = async () => {
      try {
        const data = await apiService.getMerchants();
        setMerchants(data);
      } catch (err: any) {
        console.error('Error fetching merchants:', err);
        setError('Failed to load merchants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, [isEndUser, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Merchants</h1>
        <a 
          href="/conversations" 
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
        >
          View My Conversations
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400 text-center">
          {error}
        </div>
      ) : merchants.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-md text-center">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No merchants available</h3>
          <p className="text-gray-600 dark:text-gray-400">Check back later for available support options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}
    </div>
  );
} 