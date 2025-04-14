'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, StaffMember, CreateStaffRequest } from '@/services/api';

export default function StaffManagementPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState<number | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const { user, isAdmin, isManager } = useAuth();
  const router = useRouter();

  // Form state for new staff member
  const [formData, setFormData] = useState<CreateStaffRequest>({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    merchantId: user?.merchantId || 0,
  });

  // Load staff members
  useEffect(() => {
    // Only admins and managers can access this page
    if (!isAdmin() && !isManager()) {
      router.push('/merchant/dashboard');
      return;
    }

    const fetchStaffMembers = async () => {
      try {
        setLoading(true);
        const data = await apiService.getStaffMembers();
        setStaffMembers(data);
      } catch (err: any) {
        console.error('Error fetching staff members:', err);
        setError('Failed to load staff members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, [isAdmin, isManager, router, user?.merchantId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add new staff member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      await apiService.createStaffMember({
        ...formData,
        merchantId: user?.merchantId || 0,
      });
      
      // Reset form and refresh list
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        merchantId: user?.merchantId || 0,
      });
      setIsAddingStaff(false);
      
      // Reload staff list
      const updatedStaff = await apiService.getStaffMembers();
      setStaffMembers(updatedStaff);
    } catch (err: any) {
      console.error('Error adding staff member:', err);
      setError('Failed to add staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update staff role
  const handleUpdateRole = async (staffId: number, newRole: 'admin' | 'manager' | 'staff') => {
    try {
      setLoading(true);
      await apiService.updateStaffMember(staffId, { role: newRole });
      
      // Reload staff list
      const updatedStaff = await apiService.getStaffMembers();
      setStaffMembers(updatedStaff);
      setIsEditingStaff(null);
    } catch (err: any) {
      console.error('Error updating staff role:', err);
      setError('Failed to update staff role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async (staffId: number) => {
    try {
      setLoading(true);
      await apiService.deleteStaffMember(staffId);
      
      // Reload staff list
      const updatedStaff = await apiService.getStaffMembers();
      setStaffMembers(updatedStaff);
      setDeleteConfirmation(null);
    } catch (err: any) {
      console.error('Error deleting staff member:', err);
      setError('Failed to delete staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && staffMembers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
        <Link 
          href="/merchant/dashboard" 
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400 mb-6">
          {error}
          <button
            className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Add staff button */}
      {!isAddingStaff && (
        <div className="mb-6">
          <button
            onClick={() => setIsAddingStaff(true)}
            className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Add New Staff Member
          </button>
        </div>
      )}

      {/* Add staff form */}
      {isAddingStaff && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Staff Member</h2>
          <form onSubmit={handleAddStaff}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  {isAdmin() && <option value="admin">Admin</option>}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {staffMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No staff members found
                </td>
              </tr>
            ) : (
              staffMembers.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{staff.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditingStaff === staff.id ? (
                      <select
                        defaultValue={staff.role}
                        onChange={(e) => handleUpdateRole(staff.id, e.target.value as 'admin' | 'manager' | 'staff')}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        disabled={loading}
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        {isAdmin() && <option value="admin">Admin</option>}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${staff.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 
                          staff.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                        {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* Don't show edit/delete for current user */}
                    {staff.id !== user?.id && (
                      <>
                        {isEditingStaff === staff.id ? (
                          <button
                            onClick={() => setIsEditingStaff(null)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Done
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsEditingStaff(staff.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Edit
                          </button>
                        )}
                        
                        {deleteConfirmation === staff.id ? (
                          <>
                            <button
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              disabled={loading}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmation(null)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmation(staff.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 