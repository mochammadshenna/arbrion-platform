
import { useState, useEffect } from 'react';
import { PurchaseOrder } from '@/types/PurchaseOrder';

// Demo purchase orders data
const demoPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    vendor: 'Office Supplies Inc.',
    description: 'Office supplies for Q1',
    amount: 1250.00,
    status: 'approved',
    createdBy: 'admin@company.com',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    items: [
      {
        id: '1',
        description: 'A4 Paper (Box of 5)',
        quantity: 10,
        unitPrice: 25.00,
        totalPrice: 250.00
      },
      {
        id: '2',
        description: 'Printer Cartridges',
        quantity: 5,
        unitPrice: 200.00,
        totalPrice: 1000.00
      }
    ],
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=400&fit=crop'
    ]
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    vendor: 'Tech Solutions Ltd.',
    description: 'IT Equipment Purchase',
    amount: 5500.00,
    status: 'pending',
    createdBy: 'admin@company.com',
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    items: [
      {
        id: '3',
        description: 'Wireless Mouse',
        quantity: 20,
        unitPrice: 25.00,
        totalPrice: 500.00
      },
      {
        id: '4',
        description: 'USB-C Hub',
        quantity: 10,
        unitPrice: 500.00,
        totalPrice: 5000.00
      }
    ],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop'
    ]
  }
];

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const savedOrders = localStorage.getItem('arbrion_purchase_orders');
      if (savedOrders) {
        setPurchaseOrders(JSON.parse(savedOrders));
      } else {
        setPurchaseOrders(demoPurchaseOrders);
        localStorage.setItem('arbrion_purchase_orders', JSON.stringify(demoPurchaseOrders));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedOrders = [...purchaseOrders, newOrder];
    setPurchaseOrders(updatedOrders);
    localStorage.setItem('arbrion_purchase_orders', JSON.stringify(updatedOrders));
  };

  const updatePurchaseOrder = (id: string, updatedOrder: Partial<PurchaseOrder>) => {
    const updatedOrders = purchaseOrders.map(order =>
      order.id === id 
        ? { ...order, ...updatedOrder, updatedAt: new Date().toISOString() }
        : order
    );
    setPurchaseOrders(updatedOrders);
    localStorage.setItem('arbrion_purchase_orders', JSON.stringify(updatedOrders));
  };

  const deletePurchaseOrder = (id: string) => {
    const updatedOrders = purchaseOrders.filter(order => order.id !== id);
    setPurchaseOrders(updatedOrders);
    localStorage.setItem('arbrion_purchase_orders', JSON.stringify(updatedOrders));
  };

  return {
    purchaseOrders,
    isLoading,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };
};
