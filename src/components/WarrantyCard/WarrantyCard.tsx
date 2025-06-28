import React from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { WarrantyRecord } from '../../types/warranty';
import { products } from '../../data/products';
import { getDaysRemaining } from '../../utils/warrantyCalculator';

interface WarrantyCardProps {
  warranty: WarrantyRecord;
}

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ warranty }) => {
  const product = products.find(p => p.id === warranty.productId);
  const daysRemaining = getDaysRemaining(warranty.warrantyEndDate);

  const getStatusIcon = () => {
    switch (warranty.status) {
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

  const getStatusColor = () => {
    switch (warranty.status) {
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

  const getStatusText = () => {
    switch (warranty.status) {
      case 'active':
        return `${daysRemaining} days remaining`;
      case 'expiring_soon':
        return `Expires in ${daysRemaining} days`;
      case 'expired':
        return `Expired ${Math.abs(daysRemaining)} days ago`;
      default:
        return 'Unknown status';
    }
  };

  if (!product) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-32 h-32 sm:h-auto">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.brand} • {product.model}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span className="capitalize">{warranty.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Purchased: {new Date(warranty.purchaseDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Expires: {new Date(warranty.warrantyEndDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Warranty Status</p>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};