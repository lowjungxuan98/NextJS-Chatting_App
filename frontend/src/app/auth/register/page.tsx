'use client';

import { useState, ReactNode, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/services/api';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  rightElement?: ReactNode;
  hint?: string;
}

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  rightElement,
  hint
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
    {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Register user (end users only)
      const response = await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: 'end_user',
      });

      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/conversations');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">Create Account</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Join our community today</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          
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
            hint="Password must be at least 6 characters"
          />
          
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 dark:bg-indigo-700 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 