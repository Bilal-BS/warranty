export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  warrantyPeriodMonths: number;
  image?: string;
  createdAt: string;
}

export interface ProductInstance {
  id: string;
  productId: string;
  qrCode: string;
  barcode?: string;
  serialNumber: string;
  isRegistered: boolean;
  createdAt: string;
}

export interface WarrantyRegistration {
  id: string;
  productInstanceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  purchaseDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  status: 'active' | 'expired' | 'expiring_soon';
  registeredAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Legacy interface for backward compatibility
export interface WarrantyRecord {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  purchaseDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  status: 'active' | 'expired' | 'expiring_soon';
  qrCode: string;
}