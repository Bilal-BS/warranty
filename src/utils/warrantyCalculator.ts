import { Product, WarrantyRecord } from '../types/warranty';

export const calculateWarrantyEndDate = (purchaseDate: string, warrantyPeriodMonths: number): string => {
  const startDate = new Date(purchaseDate);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + warrantyPeriodMonths);
  return endDate.toISOString().split('T')[0];
};

export const getWarrantyStatus = (endDate: string): 'active' | 'expired' | 'expiring_soon' => {
  const today = new Date();
  const warranty = new Date(endDate);
  const daysUntilExpiry = Math.ceil((warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'active';
};

export const getDaysRemaining = (endDate: string): number => {
  const today = new Date();
  const warranty = new Date(endDate);
  return Math.ceil((warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const createWarrantyRecord = (
  product: Product,
  customerName: string,
  customerEmail: string,
  purchaseDate: string
): WarrantyRecord => {
  const warrantyEndDate = calculateWarrantyEndDate(purchaseDate, product.warrantyPeriodMonths);
  const status = getWarrantyStatus(warrantyEndDate);
  
  return {
    id: `warranty-${Date.now()}`,
    productId: product.id,
    customerName,
    customerEmail,
    purchaseDate,
    warrantyStartDate: purchaseDate,
    warrantyEndDate,
    status,
    qrCode: product.qrCode
  };
};