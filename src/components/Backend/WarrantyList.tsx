import React from 'react';
import { WarrantyRegistration, Product, ProductInstance } from '../../types/warranty';
import { Shield, Calendar, User, Mail, Phone, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface WarrantyListProps {
  warranties: WarrantyRegistration[];
  products: Product[];
  instances: ProductInstance[];
}

export const WarrantyList: React.FC<WarrantyListProps> = ({ warranties, products, instances }) => {
  const getProduct = (instanceId: string) => {
    const instance = instances.find(i => i.id === instanceId);
    if (!instance) return null;
    return products.find(p => p.id === instance.productId);
  };

  const getInstance = (instanceId: string) => {
    return instances.find(i => i.id === instanceId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expiring_soon':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const warranty = new Date(endDate);
    return Math.ceil((warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      {warranties.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No warranty registrations</h3>
          <p className="text-gray-600">Customer registrations will appear here</p>
        </div>
      ) : (
        warranties.map((warranty) => {
          const product = getProduct(warranty.productInstanceId);
          const instance = getInstance(warranty.productInstanceId);
          const daysRemaining = getDaysRemaining(warranty.warrantyEndDate);
          
          return (
            <div key={warranty.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{product?.name || 'Unknown Product'}</h3>
                    <p className="text-sm text-gray-600">{product?.brand} {product?.model}</p>
                    <p className="text-xs text-gray-500 font-mono">{instance?.qrCode}</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(warranty.status)}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(warranty.status)}
                    <span className="capitalize">{warranty.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{warranty.customerName}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{warranty.customerEmail}</span>
                </div>
                {warranty.customerPhone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{warranty.customerPhone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Purchase Date</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(warranty.purchaseDate).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Warranty Expires</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(warranty.warrantyEndDate).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-800">
                    {warranty.status === 'active' && `${daysRemaining} days remaining`}
                    {warranty.status === 'expiring_soon' && `Expires in ${daysRemaining} days`}
                    {warranty.status === 'expired' && `Expired ${Math.abs(daysRemaining)} days ago`}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                Registered on: {new Date(warranty.registeredAt).toLocaleString()}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};