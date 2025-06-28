import React from 'react';
import { WarrantyRecord } from '../../types/warranty';
import { WarrantyCard } from '../WarrantyCard/WarrantyCard';
import { Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardProps {
  warranties: WarrantyRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ warranties }) => {
  const activeWarranties = warranties.filter(w => w.status === 'active');
  const expiringWarranties = warranties.filter(w => w.status === 'expiring_soon');
  const expiredWarranties = warranties.filter(w => w.status === 'expired');

  const stats = [
    {
      label: 'Total Products',
      value: warranties.length,
      icon: Package,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Active Warranties',
      value: activeWarranties.length,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Expiring Soon',
      value: expiringWarranties.length,
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      label: 'Expired',
      value: expiredWarranties.length,
      icon: Clock,
      color: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Warranties List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Warranties</h2>
        {warranties.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No warranties registered</h3>
            <p className="text-gray-600">Scan a QR code to register your first product</p>
          </div>
        ) : (
          <div className="space-y-4">
            {warranties.map((warranty) => (
              <WarrantyCard key={warranty.id} warranty={warranty} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};