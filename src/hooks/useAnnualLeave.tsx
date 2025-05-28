
import { useState } from 'react';
import { AnnualLeave } from '@/types/AnnualLeave';

// Mock data
const mockLeaveRequests: AnnualLeave[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Admin User',
    startDate: '2024-01-15',
    endDate: '2024-01-19',
    days: 5,
    reason: 'Family vacation',
    status: 'approved',
    appliedDate: '2024-01-01',
    approvedBy: 'HR Manager',
    approvedDate: '2024-01-02'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'John Doe',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    days: 3,
    reason: 'Medical appointment',
    status: 'pending',
    appliedDate: '2024-01-25'
  },
  {
    id: '3',
    employeeId: '2',
    employeeName: 'John Doe',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    days: 5,
    reason: 'Personal leave',
    status: 'rejected',
    appliedDate: '2024-02-15',
    approvedBy: 'Admin User',
    approvedDate: '2024-02-16',
    comments: 'Peak season, please reschedule'
  }
];

export const useAnnualLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState<AnnualLeave[]>(mockLeaveRequests);

  const getLeaveRequests = (employeeId?: string) => {
    if (employeeId) {
      return leaveRequests.filter(request => request.employeeId === employeeId);
    }
    return leaveRequests;
  };

  const createLeaveRequest = (request: Omit<AnnualLeave, 'id' | 'appliedDate'>) => {
    const newRequest: AnnualLeave = {
      ...request,
      id: (leaveRequests.length + 1).toString(),
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests([...leaveRequests, newRequest]);
    return newRequest;
  };

  const updateLeaveRequest = (id: string, updates: Partial<AnnualLeave>) => {
    setLeaveRequests(leaveRequests.map(request => 
      request.id === id ? { ...request, ...updates } : request
    ));
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaveRequests(leaveRequests.filter(request => request.id !== id));
  };

  const approveLeaveRequest = (id: string, approvedBy: string, comments?: string) => {
    updateLeaveRequest(id, {
      status: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString().split('T')[0],
      comments
    });
  };

  const rejectLeaveRequest = (id: string, approvedBy: string, comments?: string) => {
    updateLeaveRequest(id, {
      status: 'rejected',
      approvedBy,
      approvedDate: new Date().toISOString().split('T')[0],
      comments
    });
  };

  return {
    leaveRequests,
    getLeaveRequests,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest
  };
};
