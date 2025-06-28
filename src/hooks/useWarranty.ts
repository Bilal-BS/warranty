import { useState, useEffect } from 'react';
import { WarrantyRecord, Product } from '../types/warranty';
import { products } from '../data/products';
import { createWarrantyRecord, getWarrantyStatus } from '../utils/warrantyCalculator';

export const useWarranty = () => {
  const [warranties, setWarranties] = useState<WarrantyRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load warranties from localStorage
    const saved = localStorage.getItem('warranties');
    if (saved) {
      const parsedWarranties = JSON.parse(saved);
      // Update status for all warranties
      const updatedWarranties = parsedWarranties.map((warranty: WarrantyRecord) => ({
        ...warranty,
        status: getWarrantyStatus(warranty.warrantyEndDate)
      }));
      setWarranties(updatedWarranties);
    }
  }, []);

  const saveWarranties = (newWarranties: WarrantyRecord[]) => {
    setWarranties(newWarranties);
    localStorage.setItem('warranties', JSON.stringify(newWarranties));
  };

  const registerProduct = async (
    qrCode: string,
    customerName: string,
    customerEmail: string,
    purchaseDate: string
  ): Promise<WarrantyRecord | null> => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const product = products.find(p => p.qrCode === qrCode);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if already registered
      const existing = warranties.find(w => w.qrCode === qrCode && w.customerEmail === customerEmail);
      if (existing) {
        throw new Error('Product already registered for this customer');
      }

      const newWarranty = createWarrantyRecord(product, customerName, customerEmail, purchaseDate);
      const updatedWarranties = [...warranties, newWarranty];
      saveWarranties(updatedWarranties);
      
      return newWarranty;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getWarrantyByQR = (qrCode: string): WarrantyRecord | null => {
    return warranties.find(w => w.qrCode === qrCode) || null;
  };

  const getWarrantiesByEmail = (email: string): WarrantyRecord[] => {
    return warranties.filter(w => w.customerEmail === email);
  };

  return {
    warranties,
    loading,
    registerProduct,
    getWarrantyByQR,
    getWarrantiesByEmail
  };
};