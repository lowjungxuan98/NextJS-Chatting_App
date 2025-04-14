'use client';

import { useState } from 'react';
import { apiService } from '@/services/api';

interface StaffMember {
  id: number;
  name: string;
  role: string;
}

interface StaffSelectorProps {
  conversationId: number;
  staffMembers: StaffMember[];
  currentAssignedStaffId: number | null;
  onAssignmentChange: () => void;
}

export default function StaffSelector({
  conversationId,
  staffMembers,
  currentAssignedStaffId,
  onAssignmentChange
}: StaffSelectorProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | string>(
    currentAssignedStaffId || ''
  );

  const handleAssign = async () => {
    if (!selectedStaffId || isAssigning) return;
    
    setIsAssigning(true);
    try {
      await apiService.assignConversation(conversationId, Number(selectedStaffId));
      onAssignmentChange();
    } catch (error) {
      console.error('Failed to assign conversation:', error);
      alert('Failed to assign conversation. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selectedStaffId}
        onChange={(e) => setSelectedStaffId(e.target.value)}
        className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        disabled={isAssigning}
      >
        <option value="">Select staff member</option>
        {staffMembers.map((staff) => (
          <option key={staff.id} value={staff.id}>
            {staff.name} ({staff.role})
          </option>
        ))}
      </select>
      
      <button
        onClick={handleAssign}
        disabled={!selectedStaffId || isAssigning}
        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
      >
        {isAssigning ? (
          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        ) : (
          'Assign'
        )}
      </button>
    </div>
  );
} 