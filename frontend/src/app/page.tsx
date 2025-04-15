'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard = ({ title, description }: FeatureCardProps) => (
  <div className="p-6 border border-gray-200 rounded-lg">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      setIsLoading(false);
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      const route = user.type === 'end_user' ? '/merchants' : '/conversations';
      router.push(route);
    } catch (error) {
      console.error('Error parsing user data:', error);
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

  const features = [
    {
      title: "Real-time Chat",
      description: "Instant messaging with merchants to resolve your inquiries quickly."
    },
    {
      title: "Staff Support",
      description: "Get help from dedicated merchant staff members."
    },
    {
      title: "Secure & Private",
      description: "Your conversations are private and securely stored."
    }
  ];

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
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
