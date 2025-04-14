'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already authenticated
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Redirect based on user type
        if (userData.type === 'end_user') {
          router.push('/merchants');
        } else if (userData.type === 'merchant_staff') {
          router.push('/conversations');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // In case of error, we still show the landing page
        setIsLoading(false);
      }
    } else {
      // No authentication, show the landing page
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="max-w-3xl w-full text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Customer Service Chat
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with merchants and get real-time support through our platform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Register
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Real-time Chat</h2>
            <p className="text-gray-600">
              Instant messaging with merchants to resolve your inquiries quickly.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Staff Support</h2>
            <p className="text-gray-600">
              Get help from dedicated merchant staff members.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Secure & Private</h2>
            <p className="text-gray-600">
              Your conversations are private and securely stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
