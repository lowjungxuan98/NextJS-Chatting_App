'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './theme-toggle';

// Navigation link component with active state handling
const NavLink = ({ href, isActive, children, isMobile = false }) => {
  const baseClasses = "rounded-md text-sm font-medium";
  const mobileClasses = isMobile 
    ? "block px-3 py-2 text-base" 
    : "px-3 py-2";
  const activeClasses = isActive
    ? (isMobile ? "bg-indigo-800 dark:bg-indigo-800/60" : "bg-indigo-700 dark:bg-indigo-800")
    : (isMobile ? "hover:bg-indigo-800 dark:hover:bg-indigo-800/60" : "hover:bg-indigo-700 dark:hover:bg-indigo-800");

  return (
    <Link 
      href={href} 
      className={`${baseClasses} ${mobileClasses} ${activeClasses}`}
    >
      {children}
    </Link>
  );
};

// User avatar and dropdown
const UserMenu = ({ user, logout, isMenuOpen, setIsMenuOpen, isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="border-t border-indigo-800 dark:border-indigo-700 pt-2 mt-2">
        <div className="px-3 py-2 text-white">
          <div className="font-medium">{user.name}</div>
          <div className="text-indigo-200 dark:text-indigo-300 text-sm">{user.email}</div>
        </div>
        <button
          onClick={logout}
          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-800 dark:hover:bg-indigo-800/60"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="ml-4 relative">
      <button
        className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="sr-only">Open user menu</span>
        <div className="h-8 w-8 rounded-full bg-indigo-800 dark:bg-indigo-700 flex items-center justify-center">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
            <div className="font-medium">{user.name}</div>
            <div className="text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

// Menu toggle button with animated icon
const MenuToggle = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none"
  >
    <span className="sr-only">Open main menu</span>
    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
    </svg>
  </button>
);

export default function Navbar() {
  const { user, logout, isEndUser, isMerchantStaff, isAdmin, isManager } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  if (!user) return null;

  // Navigation links based on user type
  const getNavLinks = (isMobile = false) => {
    const links = [];
    
    if (isEndUser()) {
      links.push(
        <NavLink key="merchants" href="/merchants" isActive={isActive('/merchants')} isMobile={isMobile}>
          Merchants
        </NavLink>,
        <NavLink key="my-conv" href="/conversations" isActive={isActive('/conversations')} isMobile={isMobile}>
          My Conversations
        </NavLink>
      );
    }

    if (isMerchantStaff()) {
      links.push(
        <NavLink key="dashboard" href="/merchant/dashboard" isActive={isActive('/merchant/dashboard')} isMobile={isMobile}>
          Dashboard
        </NavLink>,
        <NavLink key="conversations" href="/conversations" isActive={isActive('/conversations')} isMobile={isMobile}>
          Conversations
        </NavLink>
      );
      
      if (isAdmin() || isManager()) {
        links.push(
          <NavLink key="staff" href="/merchant/staff" isActive={isActive('/merchant/staff')} isMobile={isMobile}>
            Manage Staff
          </NavLink>
        );
      }
    }
    
    return links;
  };

  return (
    <nav className="bg-indigo-600 dark:bg-indigo-950 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Customer Service Chat
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {getNavLinks()}
            <div className="ml-2">
              <ThemeToggle />
            </div>
            <UserMenu 
              user={user} 
              logout={logout} 
              isMenuOpen={isMenuOpen} 
              setIsMenuOpen={setIsMenuOpen} 
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <MenuToggle isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-700 dark:bg-indigo-900 pb-3 pt-2">
          <div className="px-2 space-y-1">
            {getNavLinks(true)}
            <UserMenu 
              user={user} 
              logout={logout}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              isMobile={true} 
            />
          </div>
        </div>
      )}
    </nav>
  );
} 