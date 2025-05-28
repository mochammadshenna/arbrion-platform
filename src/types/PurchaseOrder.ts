
export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
  images?: string[];
}
