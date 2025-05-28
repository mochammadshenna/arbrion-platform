
import React from 'react';
import { ModernButton } from '@/components/ui/modern-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, ImageIcon } from 'lucide-react';
import { PurchaseOrder } from '@/types/PurchaseOrder';

interface PurchaseOrderPDFProps {
  order: PurchaseOrder;
  onClose: () => void;
}

const PurchaseOrderPDF: React.FC<PurchaseOrderPDFProps> = ({ order, onClose }) => {
  const generatePDF = () => {
    const imagesHtml = order.images && order.images.length > 0 
      ? `
        <div style="page-break-before: always;">
          <h3>Attachments</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
            ${order.images.map((image, index) => `
              <div style="text-align: center;">
                <img src="${image}" alt="Attachment ${index + 1}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px;" />
                <p style="margin-top: 8px; font-size: 12px; color: #666;">Attachment ${index + 1}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `
      : '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order - ${order.poNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
            .header h1 { color: #3b82f6; margin: 0; }
            .header h2 { color: #666; margin: 10px 0 0 0; }
            .info-section { margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            .info-group h3 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; color: #374151; }
            .total-row { background-color: #f0f9ff; font-weight: bold; }
            .status { padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; display: inline-block; }
            .status.pending { background-color: #f59e0b; }
            .status.approved { background-color: #10b981; }
            .status.rejected { background-color: #ef4444; }
            .status.completed { background-color: #3b82f6; }
            .amount { color: #059669; font-weight: bold; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Arbrion Platform</h1>
            <h2>Purchase Order</h2>
          </div>
          
          <div class="info-section">
            <div class="info-group">
              <h3>Order Information</h3>
              <p><strong>PO Number:</strong> ${order.poNumber}</p>
              <p><strong>Created Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Created By:</strong> ${order.createdBy}</p>
              <p><strong>Status:</strong> <span class="status ${order.status}">${order.status.toUpperCase()}</span></p>
            </div>
            <div class="info-group">
              <h3>Vendor Information</h3>
              <p><strong>Vendor:</strong> ${order.vendor}</p>
              <p><strong>Description:</strong> ${order.description}</p>
            </div>
          </div>

          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">$${item.unitPrice.toFixed(2)}</td>
                  <td style="text-align: right; color: #059669; font-weight: bold;">$${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" style="text-align: right; font-size: 16px;">Grand Total:</td>
                <td style="text-align: right; font-size: 18px; color: #059669;">$${order.amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          ${imagesHtml}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ModernButton 
            variant="outline" 
            onClick={onClose}
            icon={ArrowLeft}
          >
            Back
          </ModernButton>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Order Preview</h1>
        </div>
        <ModernButton 
          onClick={generatePDF} 
          variant="primary"
          icon={Download}
          className="w-full sm:w-auto"
        >
          Download PDF
        </ModernButton>
      </div>

      <Card>
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl">Arbrion Platform</CardTitle>
          <p className="text-xl">Purchase Order</p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Order Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">PO Number:</span>
                  <span className="font-semibold">{order.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Created Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Created By:</span>
                  <span>{order.createdBy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'approved' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Vendor Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Vendor:</span>
                  <span className="font-semibold">{order.vendor}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Description:</span>
                  <p className="mt-1 text-gray-800">{order.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">{item.description}</td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-green-600">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                    <td colSpan={3} className="border border-gray-300 px-4 py-4 text-right font-bold text-lg">Grand Total:</td>
                    <td className="border border-gray-300 px-4 py-4 text-right font-bold text-xl text-green-600">${order.amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {order.images && order.images.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Attachments ({order.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {order.images.map((image, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                      <img
                        src={image}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">Attachment {index + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderPDF;
