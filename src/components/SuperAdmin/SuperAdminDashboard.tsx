import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Admin } from '../../types/admin';
import { Users, UserCheck, UserX, Crown, Calendar, DollarSign, CheckCircle, XCircle, Clock, Edit, Trash2, Key, User, Mail, Settings } from 'lucide-react';
import { AdminEditModal } from './AdminEditModal';
import { SubscriptionEditModal } from './SubscriptionEditModal';

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Admin | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    setAdmins(adminService.getAllAdmins());
    setPendingAdmins(adminService.getPendingAdmins());
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleApproveAdmin = async (adminId: string) => {
    setLoading(true);
    const session = adminService.getCurrentSession();
    if (session && adminService.approveAdmin(adminId, session.admin.id)) {
      loadAdmins();
      showMessage('success', 'Admin approved successfully!');
    } else {
      showMessage('error', 'Failed to approve admin.');
    }
    setLoading(false);
  };

  const handleSuspendAdmin = async (adminId: string) => {
    if (confirm('Are you sure you want to suspend this admin? They will lose access immediately.')) {
      setLoading(true);
      if (adminService.suspendAdmin(adminId)) {
        loadAdmins();
        showMessage('success', 'Admin suspended successfully!');
      } else {
        showMessage('error', 'Failed to suspend admin.');
      }
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (confirm('Are you sure you want to permanently delete this admin? This action cannot be undone.')) {
      setLoading(true);
      if (adminService.deleteAdmin(adminId)) {
        loadAdmins();
        showMessage('success', 'Admin deleted successfully!');
      } else {
        showMessage('error', 'Failed to delete admin.');
      }
      setLoading(false);
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
  };

  const handleEditSubscription = (admin: Admin) => {
    setEditingSubscription(admin);
  };

  const handleAdminUpdate = () => {
    loadAdmins();
    setEditingAdmin(null);
    showMessage('success', 'Admin updated successfully!');
  };

  const handleSubscriptionUpdate = () => {
    loadAdmins();
    setEditingSubscription(null);
    showMessage('success', 'Subscription updated successfully!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'suspended':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      label: 'Total Admins',
      value: admins.length,
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Pending Approval',
      value: pendingAdmins.length,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      label: 'Active Admins',
      value: admins.filter(a => a.status === 'approved').length,
      icon: UserCheck,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Suspended',
      value: admins.filter(a => a.status === 'suspended').length,
      icon: UserX,
      color: 'bg-red-100 text-red-600'
    }
  ];

  const tabs = [
    { id: 'pending', label: 'Pending Approval', count: pendingAdmins.length },
    { id: 'active', label: 'Active Admins', count: admins.filter(a => a.status === 'approved').length },
    { id: 'all', label: 'All Admins', count: admins.length }
  ];

  const getFilteredAdmins = () => {
    switch (activeTab) {
      case 'pending':
        return pendingAdmins;
      case 'active':
        return admins.filter(a => a.status === 'approved');
      case 'all':
      default:
        return admins;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">SuperAdmin Dashboard</h1>
                <p className="text-sm text-gray-600">Complete Admin Management System</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center space-x-3 ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium flex-1">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-current hover:opacity-70 transition-opacity"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

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
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            {getFilteredAdmins().length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No admins found</h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' ? 'No pending admin registrations' : 'No admins in this category'}
                </p>
              </div>
            ) : (
              getFilteredAdmins().map((admin) => (
                <div key={admin.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {admin.profile.firstName[0]}{admin.profile.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-800">
                              {admin.profile.firstName} {admin.profile.lastName}
                            </h3>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(admin.status)}`}>
                              {getStatusIcon(admin.status)}
                              <span className="ml-1 capitalize">{admin.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>@{admin.username}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{admin.email}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Subscription Plan</p>
                          <p className="text-sm font-semibold text-gray-800 capitalize">{admin.subscription.plan}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Plan Status</p>
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(admin.subscription.status)}`}>
                            {admin.subscription.status}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Company</p>
                          <p className="text-sm font-medium text-gray-800">{admin.profile.company || 'N/A'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Registered</p>
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Subscription Details */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Expires: {new Date(admin.subscription.endDate).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>Plan: {admin.subscription.plan}</span>
                            </span>
                          </div>
                          {admin.lastLogin && (
                            <span className="text-xs text-gray-500">
                              Last login: {new Date(admin.lastLogin).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-6">
                      {/* Edit Admin Button */}
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                        title="Edit Admin Details"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Admin</span>
                      </button>

                      {/* Edit Subscription Button */}
                      <button
                        onClick={() => handleEditSubscription(admin)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                        title="Edit Subscription"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Edit Plan</span>
                      </button>

                      {/* Status Actions */}
                      {admin.status === 'pending' && (
                        <button
                          onClick={() => handleApproveAdmin(admin.id)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                      )}
                      
                      {admin.status === 'approved' && (
                        <button
                          onClick={() => handleSuspendAdmin(admin.id)}
                          disabled={loading}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Suspend</span>
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <AdminEditModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onUpdate={handleAdminUpdate}
        />
      )}

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <SubscriptionEditModal
          admin={editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onUpdate={handleSubscriptionUpdate}
        />
      )}
    </div>
  );
};