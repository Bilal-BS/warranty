export const generateQRCode = (productId: string): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const productCode = productId.slice(-4).toUpperCase();
  return `QR${productCode}${timestamp}${random}`;
};

export const generateBarcode = (productId: string): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const productCode = productId.slice(-4).replace(/\D/g, '').padStart(4, '0');
  return `${productCode}${timestamp}${random}`;
};

export const generateSerialNumber = (productId: string): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const productCode = productId.slice(-4).toUpperCase();
  return `SN${productCode}${timestamp}${random}`;
};

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