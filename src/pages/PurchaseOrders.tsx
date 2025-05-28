
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { ModernButton } from '@/components/ui/modern-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PurchaseOrderForm from '@/components/PurchaseOrderForm';
import PurchaseOrderPDF from '@/components/PurchaseOrderPDF';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const { purchaseOrders, isLoading, deletePurchaseOrder } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingPDF, setViewingPDF] = useState(null);

  const filteredOrders = purchaseOrders.filter(order =>
    order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['PO Number', 'Vendor', 'Description', 'Amount', 'Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.poNumber,
        `"${order.vendor}"`,
        `"${order.description}"`,
        order.amount,
        order.status,
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Purchase orders exported successfully!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      deletePurchaseOrder(id);
      toast.success('Purchase order deleted successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (viewingPDF) {
    return <PurchaseOrderPDF order={viewingPDF} onClose={() => setViewingPDF(null)} />;
  }

  if (showForm) {
    return (
      <PurchaseOrderForm
        order={editingOrder}
        onClose={() => {
          setShowForm(false);
          setEditingOrder(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-gray-600">Manage purchase orders and track procurement</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {user?.role === 'admin' && (
                <>
                  <ModernButton
                    variant="primary"
                    onClick={() => setShowForm(true)}
                    icon={Plus}
                    className="w-full sm:w-auto"
                  >
                    New PO
                  </ModernButton>
                  <ModernButton
                    variant="success"
                    onClick={exportToCSV}
                    icon={Download}
                    className="w-full sm:w-auto"
                  >
                    Export CSV
                  </ModernButton>
                </>
              )}
            </div>
          </div>

          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <CardTitle>Purchase Orders List</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search purchase orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="space-y-4 p-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{order.poNumber}</p>
                              <p className="text-gray-600 text-sm">{order.vendor}</p>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} border-0 text-xs`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 line-clamp-2">{order.description}</p>
                            <p className="font-semibold text-lg text-green-600">${order.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingPDF(order)}
                              icon={Eye}
                              className="flex-1"
                            >
                              View
                            </ModernButton>
                            {user?.role === 'admin' && (
                              <>
                                <ModernButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingOrder(order);
                                    setShowForm(true);
                                  }}
                                  icon={Edit}
                                  className="flex-1"
                                >
                                  Edit
                                </ModernButton>
                                <ModernButton
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(order.id)}
                                  icon={Trash2}
                                  className="flex-1"
                                >
                                  Delete
                                </ModernButton>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">PO Number</TableHead>
                        <TableHead className="min-w-[150px]">Vendor</TableHead>
                        <TableHead className="min-w-[200px]">Description</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Created Date</TableHead>
                        <TableHead className="min-w-[180px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.poNumber}</TableCell>
                          <TableCell>{order.vendor}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={order.description}>
                              {order.description}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">${order.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.status)} border-0`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <ModernButton
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingPDF(order)}
                                icon={Eye}
                              />
                              {user?.role === 'admin' && (
                                <>
                                  <ModernButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingOrder(order);
                                      setShowForm(true);
                                    }}
                                    icon={Edit}
                                  />
                                  <ModernButton
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(order.id)}
                                    icon={Trash2}
                                  />
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="mb-4">
                    <Search className="w-12 h-12 mx-auto text-gray-300" />
                  </div>
                  <p className="text-lg">No purchase orders found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
