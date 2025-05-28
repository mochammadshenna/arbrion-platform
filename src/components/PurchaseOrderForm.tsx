import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { ModernButton } from '@/components/ui/modern-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/PurchaseOrder';
import { ImageUpload } from '@/components/ImageUpload';

interface PurchaseOrderFormProps {
  order?: PurchaseOrder | null;
  onClose: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ order, onClose }) => {
  const { user } = useAuth();
  const { addPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders();
  
  const [formData, setFormData] = useState({
    poNumber: '',
    vendor: '',
    description: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'completed',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }] as PurchaseOrderItem[],
    images: [] as string[]
  });

  useEffect(() => {
    if (order) {
      setFormData({
        poNumber: order.poNumber,
        vendor: order.vendor,
        description: order.description,
        status: order.status,
        items: order.items.length > 0 ? order.items : [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
        images: order.images || []
      });
    } else {
      const poNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      setFormData(prev => ({ ...prev, poNumber }));
    }
  }, [order]);

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateGrandTotal = () => {
    return formData.items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = calculateItemTotal(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice
      );
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendor || !formData.description || formData.items.some(item => !item.description)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const orderData = {
      ...formData,
      amount: calculateGrandTotal(),
      createdBy: user?.email || '',
      items: formData.items.map((item, index) => ({
        ...item,
        id: item.id || (index + 1).toString()
      }))
    };

    if (order) {
      updatePurchaseOrder(order.id, orderData);
      toast.success('Purchase order updated successfully!');
    } else {
      addPurchaseOrder(orderData);
      toast.success('Purchase order created successfully!');
    }
    
    onClose();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <ModernButton 
          variant="outline" 
          onClick={onClose}
          icon={ArrowLeft}
        >
          Back
        </ModernButton>
        <h1 className="text-2xl font-bold text-gray-900">
          {order ? 'Edit Purchase Order' : 'Create Purchase Order'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poNumber">PO Number *</Label>
                <Input
                  id="poNumber"
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'pending' | 'approved' | 'rejected' | 'completed') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="vendor">Vendor *</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <ModernButton 
              type="button" 
              variant="primary"
              onClick={addItem} 
              size="sm"
              icon={Plus}
            >
              Add Item
            </ModernButton>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <Card key={index} className="border-2 border-gray-100">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label>Total</Label>
                          <Input
                            value={`$${item.totalPrice.toFixed(2)}`}
                            readOnly
                            className="bg-gray-50 font-semibold text-green-600"
                          />
                        </div>
                        {formData.items.length > 1 && (
                          <ModernButton
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeItem(index)}
                            icon={Trash2}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Grand Total:</span>
                <span className="text-2xl font-bold text-green-600">${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <ModernButton 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </ModernButton>
          <ModernButton 
            type="submit" 
            variant="primary"
            icon={Save}
            className="w-full sm:w-auto"
          >
            {order ? 'Update' : 'Create'} Purchase Order
          </ModernButton>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
