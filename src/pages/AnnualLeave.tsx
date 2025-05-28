
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnualLeave } from '@/hooks/useAnnualLeave';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Edit, Check, X, FileText } from 'lucide-react';
import { AnnualLeave } from '@/types/AnnualLeave';

const AnnualLeavePage = () => {
  const { user } = useAuth();
  const { 
    getLeaveRequests, 
    createLeaveRequest, 
    updateLeaveRequest, 
    approveLeaveRequest, 
    rejectLeaveRequest 
  } = useAnnualLeave();
  
  const [requests, setRequests] = useState<AnnualLeave[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<AnnualLeave | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    const userRequests = user?.role === 'admin' 
      ? getLeaveRequests() 
      : getLeaveRequests(user?.id);
    setRequests(userRequests);
  }, [user, getLeaveRequests]);

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays(formData.startDate, formData.endDate);
    
    if (editingRequest) {
      updateLeaveRequest(editingRequest.id, {
        ...formData,
        days
      });
    } else {
      createLeaveRequest({
        employeeId: user?.id || '',
        employeeName: user?.name || '',
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        reason: formData.reason,
        status: 'pending'
      });
    }
    
    setFormData({ startDate: '', endDate: '', reason: '' });
    setIsCreateDialogOpen(false);
    setEditingRequest(null);
    
    // Refresh requests
    const userRequests = user?.role === 'admin' 
      ? getLeaveRequests() 
      : getLeaveRequests(user?.id);
    setRequests(userRequests);
  };

  const handleApprove = (id: string) => {
    approveLeaveRequest(id, user?.name || '');
    const userRequests = getLeaveRequests();
    setRequests(userRequests);
  };

  const handleReject = (id: string) => {
    rejectLeaveRequest(id, user?.name || '', 'Request rejected');
    const userRequests = getLeaveRequests();
    setRequests(userRequests);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const canEdit = (request: AnnualLeave) => {
    return request.status === 'pending' && request.employeeId === user?.id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annual Leave</h1>
          <p className="text-gray-600">Manage your annual leave requests</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingRequest ? 'Edit Leave Request' : 'New Leave Request'}
              </DialogTitle>
              <DialogDescription>
                Submit your annual leave request for approval.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide reason for leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>
              {formData.startDate && formData.endDate && (
                <div className="text-sm text-gray-600">
                  Total days: {calculateDays(formData.startDate, formData.endDate)}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingRequest(null);
                    setFormData({ startDate: '', endDate: '', reason: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRequest ? 'Update' : 'Submit'} Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Requests */}
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.employeeName}</CardTitle>
                    <CardDescription>
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} ({request.days} days)
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(request.status)}
                    {canEdit(request) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRequest(request);
                          setFormData({
                            startDate: request.startDate,
                            endDate: request.endDate,
                            reason: request.reason
                          });
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Reason:</strong> {request.reason}
                  </div>
                  <div className="text-sm text-gray-600">
                    Applied: {new Date(request.appliedDate).toLocaleDateString()}
                  </div>
                  {request.approvedBy && (
                    <div className="text-sm text-gray-600">
                      {request.status === 'approved' ? 'Approved' : 'Rejected'} by: {request.approvedBy} on {new Date(request.approvedDate!).toLocaleDateString()}
                    </div>
                  )}
                  {request.comments && (
                    <div className="text-sm text-gray-600">
                      <strong>Comments:</strong> {request.comments}
                    </div>
                  )}
                  
                  {/* Admin Actions */}
                  {user?.role === 'admin' && request.status === 'pending' && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any leave requests yet.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnnualLeavePage;
