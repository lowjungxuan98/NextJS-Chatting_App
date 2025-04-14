'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: Array<'end_user' | 'merchant_staff'>;
  allowedRoles?: Array<'admin' | 'manager' | 'staff'>;
}

export default function ProtectedRoute({
  children,
  allowedUserTypes,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!isLoading && isAuthenticated && user) {
      // Check for user type restrictions
      if (allowedUserTypes && !allowedUserTypes.includes(user.type)) {
        router.push('/unauthorized');
        return;
      }

      // Check for role restrictions (for merchant staff)
      if (
        user.type === 'merchant_staff' &&
        allowedRoles &&
        user.role && 
        !allowedRoles.includes(user.role)
      ) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isLoading, isAuthenticated, router, user, allowedUserTypes, allowedRoles]);

  // Show nothing while loading or redirecting
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
} 