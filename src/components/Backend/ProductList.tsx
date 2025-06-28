import React from 'react';
import { Product, ProductInstance } from '../../types/warranty';
import { Edit, Trash2, Package, QrCode, Hash } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  instances: ProductInstance[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onGenerateCodes: (productId: string, quantity: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  instances,
  onEdit,
  onDelete,
  onGenerateCodes
}) => {
  const getInstanceCount = (productId: string) => {
    return instances.filter(i => i.productId === productId).length;
  };

  const getRegisteredCount = (productId: string) => {
    return instances.filter(i => i.productId === productId && i.isRegistered).length;
  };

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No products added</h3>
          <p className="text-gray-600">Add your first product to get started</p>
        </div>
      ) : (
        products.map((product) => {
          const instanceCount = getInstanceCount(product.id);
          const registeredCount = getRegisteredCount(product.id);
          
          return (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand} • {product.model}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-sm font-medium text-gray-800">{product.category}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Warranty</p>
                      <p className="text-sm font-medium text-blue-800">{product.warrantyPeriodMonths} months</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">QR Codes</p>
                      <p className="text-sm font-medium text-green-800">{instanceCount}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Registered</p>
                      <p className="text-sm font-medium text-purple-800">{registeredCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <QrCode className="w-4 h-4" />
                    <span>{instanceCount} QR codes generated</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Hash className="w-4 h-4" />
                    <span>{registeredCount} registered</span>
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    const quantity = prompt('How many QR codes to generate?', '10');
                    if (quantity && parseInt(quantity) > 0) {
                      onGenerateCodes(product.id, parseInt(quantity));
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate QR Codes</span>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};