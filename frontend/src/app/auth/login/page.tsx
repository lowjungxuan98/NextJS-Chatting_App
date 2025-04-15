'use client';

import { useState, ReactNode, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  rightElement?: ReactNode;
}

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  rightElement
}: FormInputProps) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {rightElement}
    </div>
    <input
      id={id}
      name={id}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
      placeholder={placeholder}
    />
  </div>
);

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 dark:bg-indigo-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            C
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Sign in to continue to your account</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          
          <FormInput
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            rightElement={
              <Link href="/auth/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                Forgot password?
              </Link>
            }
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 