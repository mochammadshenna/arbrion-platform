
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnualLeave } from '@/hooks/useAnnualLeave';
import { ModernButton } from '@/components/ui/modern-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnnualLeaveFormProps {
  request?: any;
  onClose?: () => void;
}

const AnnualLeaveForm: React.FC<AnnualLeaveFormProps> = ({ request, onClose }) => {
  const { user } = useAuth();
  const { createLeaveRequest, updateLeaveRequest } = useAnnualLeave();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: request?.startDate || '',
    endDate: request?.endDate || '',
    reason: request?.reason || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    try {
      if (request) {
        updateLeaveRequest(request.id, {
          ...formData,
          days,
        });
        toast.success('Leave request updated successfully!');
      } else {
        createLeaveRequest({
          employeeId: user.id,
          employeeName: user.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          days,
          reason: formData.reason,
          status: 'pending',
        });
        toast.success('Leave request submitted successfully!');
      }
      
      if (onClose) {
        onClose();
      } else {
        navigate('/annual-leave');
      }
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start <= end) {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    return 0;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <ModernButton
          variant="outline"
          size="sm"
          onClick={() => onClose ? onClose() : navigate('/annual-leave')}
          icon={ArrowLeft}
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          Back
        </ModernButton>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {request ? 'Edit Leave Request' : 'New Leave Request'}
          </h1>
          <p className="text-gray-600">
            {request ? 'Update your leave request details' : 'Submit a new annual leave request'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave Request Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  Total Days: <span className="font-bold">{calculateDays()}</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Leave</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for your leave request..."
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <ModernButton
                type="submit"
                variant="primary"
                icon={Save}
                className="flex-1"
              >
                {request ? 'Update Request' : 'Submit Request'}
              </ModernButton>
              <ModernButton
                type="button"
                variant="outline"
                onClick={() => onClose ? onClose() : navigate('/annual-leave')}
                className="flex-1"
              >
                Cancel
              </ModernButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnualLeaveForm;
