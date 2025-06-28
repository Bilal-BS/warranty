import React, { useState, useMemo } from 'react';
import { ProductInstance, Product } from '../../types/warranty';
import { QrCode, Copy, Check, Download, Filter, BarChart3, Search, X } from 'lucide-react';

interface QRCodeListProps {
  instances: ProductInstance[];
  products: Product[];
}

export const QRCodeList: React.FC<QRCodeListProps> = ({ instances, products }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'available'>('all');
  const [productNameFilter, setProductNameFilter] = useState('');

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadQRCodes = () => {
    const filteredInstances = getFilteredInstances();
    const csvContent = [
      'QR Code,Barcode,Serial Number,Product Name,Brand,Model,Status,Created Date',
      ...filteredInstances.map(instance => {
        const product = getProduct(instance.productId);
        return [
          instance.qrCode,
          instance.barcode || 'N/A',
          instance.serialNumber,
          product?.name || 'Unknown',
          product?.brand || 'Unknown',
          product?.model || 'Unknown',
          instance.isRegistered ? 'Registered' : 'Available',
          new Date(instance.createdAt).toLocaleDateString()
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredInstances = useMemo(() => {
    let filtered = instances;

    // Filter by status
    switch (statusFilter) {
      case 'registered':
        filtered = filtered.filter(i => i.isRegistered);
        break;
      case 'available':
        filtered = filtered.filter(i => !i.isRegistered);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }

    // Filter by product name
    if (productNameFilter.trim()) {
      const searchTerm = productNameFilter.toLowerCase().trim();
      filtered = filtered.filter(instance => {
        const product = getProduct(instance.productId);
        if (!product) return false;
        
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          product.model.toLowerCase().includes(searchTerm) ||
          instance.qrCode.toLowerCase().includes(searchTerm) ||
          instance.serialNumber.toLowerCase().includes(searchTerm) ||
          (instance.barcode && instance.barcode.toLowerCase().includes(searchTerm))
        );
      });
    }

    return filtered;
  }, [instances, statusFilter, productNameFilter]);

  const filteredInstances = getFilteredInstances;

  // Get unique product names for suggestions
  const uniqueProductNames = useMemo(() => {
    const names = new Set<string>();
    instances.forEach(instance => {
      const product = getProduct(instance.productId);
      if (product) {
        names.add(product.name);
      }
    });
    return Array.from(names).sort();
  }, [instances, products]);

  const clearProductFilter = () => {
    setProductNameFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status ({instances.length})</option>
              <option value="registered">Registered ({instances.filter(i => i.isRegistered).length})</option>
              <option value="available">Available ({instances.filter(i => !i.isRegistered).length})</option>
            </select>
          </div>

          {/* Product Name Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productNameFilter}
              onChange={(e) => setProductNameFilter(e.target.value)}
              placeholder="Search by product name, brand, model, or code..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {productNameFilter && (
              <button
                onClick={clearProductFilter}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Export Button */}
          {filteredInstances.length > 0 && (
            <button
              onClick={downloadQRCodes}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Quick Product Filter Buttons */}
        {uniqueProductNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-gray-600 py-1">Quick filters:</span>
            {uniqueProductNames.slice(0, 5).map((productName) => (
              <button
                key={productName}
                onClick={() => setProductNameFilter(productName)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  productNameFilter === productName
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {productName}
              </button>
            ))}
            {productNameFilter && (
              <button
                onClick={clearProductFilter}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredInstances.length} of {instances.length} codes
          {statusFilter !== 'all' && ` (${statusFilter})`}
          {productNameFilter && ` matching "${productNameFilter}"`}
        </div>
      </div>

      {/* Results */}
      {filteredInstances.length === 0 ? (
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {instances.length === 0 ? 'No codes found' : 'No matching codes found'}
          </h3>
          <p className="text-gray-600">
            {instances.length === 0 
              ? 'Generate QR codes and barcodes for your products to see them here'
              : 'Try adjusting your filters or search terms'
            }
          </p>
          {(statusFilter !== 'all' || productNameFilter) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setProductNameFilter('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInstances.map((instance) => {
            const product = getProduct(instance.productId);
            
            return (
              <div key={instance.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <QrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      {/* Product Info Header */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {product?.brand} {product?.model} • {product?.category}
                        </p>
                      </div>

                      {/* Codes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-700">QR Code</h4>
                            <button
                              onClick={() => copyToClipboard(instance.qrCode)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy QR code"
                            >
                              {copiedCode === instance.qrCode ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <p className="font-mono text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                            {instance.qrCode}
                          </p>
                        </div>
                        
                        {instance.barcode && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Barcode</h4>
                              <button
                                onClick={() => copyToClipboard(instance.barcode!)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Copy barcode"
                              >
                                {copiedCode === instance.barcode ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                            </div>
                            <p className="font-mono text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg flex items-center space-x-2">
                              <BarChart3 className="w-4 h-4 text-gray-500" />
                              <span>{instance.barcode}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Additional Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Serial:</span> {instance.serialNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(instance.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right md:text-left">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            instance.isRegistered 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {instance.isRegistered ? 'Registered' : 'Available'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};