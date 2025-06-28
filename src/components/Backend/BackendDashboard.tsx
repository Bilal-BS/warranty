import React, { useState, useEffect } from 'react';
import { Product, ProductInstance, WarrantyRegistration } from '../../types/warranty';
import { db } from '../../services/database';
import { generateQRCode, generateBarcode, generateSerialNumber } from '../../utils/codeGenerator';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { QRCodeList } from './QRCodeList';
import { WarrantyList } from './WarrantyList';
import { Package, QrCode, Shield, Plus, BarChart3, LogOut } from 'lucide-react';

interface BackendDashboardProps {
  onLogout: () => void;
}

export const BackendDashboard: React.FC<BackendDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [instances, setInstances] = useState<ProductInstance[]>([]);
  const [warranties, setWarranties] = useState<WarrantyRegistration[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(db.getProducts());
    setInstances(db.getProductInstances());
    setWarranties(db.getWarrantyRegistrations());
  };

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt'> & { initialQuantity?: number }) => {
    const { initialQuantity = 1, ...product } = productData;
    const newProduct = db.addProduct(product);
    
    // Auto-generate QR codes and barcodes for the initial quantity
    for (let i = 0; i < initialQuantity; i++) {
      const qrCode = generateQRCode(newProduct.id);
      const barcode = generateBarcode(newProduct.id);
      const serialNumber = generateSerialNumber(newProduct.id);
      
      db.addProductInstance({
        productId: newProduct.id,
        qrCode,
        barcode,
        serialNumber,
        isRegistered: false
      });
    }
    
    loadData();
    setShowProductForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleUpdateProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      db.updateProduct(editingProduct.id, productData);
      loadData();
      setShowProductForm(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This will also delete all associated QR codes and barcodes.')) {
      db.deleteProduct(productId);
      loadData();
    }
  };

  const handleGenerateCodes = (productId: string, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      const qrCode = generateQRCode(productId);
      const barcode = generateBarcode(productId);
      const serialNumber = generateSerialNumber(productId);
      
      db.addProductInstance({
        productId,
        qrCode,
        barcode,
        serialNumber,
        isRegistered: false
      });
    }
    loadData();
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'qrcodes', label: 'QR/Barcodes', icon: QrCode, count: instances.length },
    { id: 'warranties', label: 'Warranties', icon: Shield, count: warranties.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null }
  ];

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Codes Generated',
      value: instances.length,
      icon: QrCode,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Active Warranties',
      value: warranties.filter(w => w.status === 'active').length,
      icon: Shield,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Registered Products',
      value: instances.filter(i => i.isRegistered).length,
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Warranty Admin</h1>
                <p className="text-sm text-gray-600">Backend Management System</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === 'products' && (
                <button
                  onClick={() => setShowProductForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              )}
              
              <button
                onClick={onLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'products' && (
            <ProductList
              products={products}
              instances={instances}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onGenerateCodes={handleGenerateCodes}
            />
          )}
          
          {activeTab === 'qrcodes' && (
            <QRCodeList instances={instances} products={products} />
          )}
          
          {activeTab === 'warranties' && (
            <WarrantyList warranties={warranties} products={products} instances={instances} />
          )}
          
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Detailed analytics and reports coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          initialData={editingProduct || undefined}
        />
      )}
    </div>
  );
};