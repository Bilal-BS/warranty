import React, { useState } from 'react';
import { User, Mail, Phone, Building, Key, Lock, Save, X, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Admin } from '../../types/admin';

interface AdminEditModalProps {
  admin: Admin;
  onClose: () => void;
  onUpdate: () => void;
}

export const AdminEditModal: React.FC<AdminEditModalProps> = ({ admin, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'credentials'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: admin.profile.firstName,
    lastName: admin.profile.lastName,
    email: admin.email,
    phone: admin.profile.phone || '',
    company: admin.profile.company || ''
  });

  const [credentialsData, setCredentialsData] = useState({
    username: admin.username,
    newPassword: '',
    confirmPassword: '',
    newPin: admin.pin || '',
    confirmPin: admin.pin || ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const success = adminService.updateAdminProfile(admin.id, {
        email: profileData.email,
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone || undefined,
          company: profileData.company || undefined
        }
      });

      if (success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          onUpdate();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate passwords
    if (credentialsData.newPassword && credentialsData.newPassword !== credentialsData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (credentialsData.newPin && credentialsData.newPin !== credentialsData.confirmPin) {
      setMessage({ type: 'error', text: 'New PINs do not match.' });
      setIsLoading(false);
      return;
    }

    try {
      let success = true;

      // Update username if changed
      if (credentialsData.username !== admin.username) {
        success = adminService.updateAdminProfile(admin.id, {
          username: credentialsData.username
        });
      }

      // Update password/PIN if provided
      if (success && credentialsData.newPassword) {
        success = adminService.changePassword(
          admin.id,
          credentialsData.newPassword,
          credentialsData.newPin || undefined
        );
      } else if (success && credentialsData.newPin !== admin.pin) {
        success = adminService.changePassword(
          admin.id,
          admin.password, // Keep existing password
          credentialsData.newPin || undefined
        );
      }

      if (success) {
        setMessage({ type: 'success', text: 'Credentials updated successfully!' });
        setCredentialsData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
        setTimeout(() => {
          onUpdate();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Failed to update credentials.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Edit Admin</h2>
                <p className="text-sm text-gray-600">{admin.profile.firstName} {admin.profile.lastName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'credentials'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login Credentials
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{isLoading ? 'Updating...' : 'Update Profile'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleCredentialsUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={credentialsData.username}
                    onChange={(e) => setCredentialsData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentialsData.newPassword}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Leave blank to keep current"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentialsData.confirmPassword}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={credentialsData.newPin}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-center font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••"
                      maxLength={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm PIN
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={credentialsData.confirmPin}
                      onChange={(e) => setCredentialsData(prev => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-center font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••"
                      maxLength={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Lock className="w-5 h-5" />
                <span>{isLoading ? 'Updating...' : 'Update Credentials'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};