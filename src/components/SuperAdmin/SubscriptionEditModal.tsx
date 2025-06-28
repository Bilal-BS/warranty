import React, { useState } from 'react';
import { Settings, Calendar, DollarSign, Save, X, Crown, Star, Zap } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Admin } from '../../types/admin';

interface SubscriptionEditModalProps {
  admin: Admin;
  onClose: () => void;
  onUpdate: () => void;
}

export const SubscriptionEditModal: React.FC<SubscriptionEditModalProps> = ({ admin, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [subscriptionData, setSubscriptionData] = useState({
    plan: admin.subscription.plan,
    status: admin.subscription.status,
    duration: 1,
    startDate: admin.subscription.startDate.split('T')[0],
    endDate: admin.subscription.endDate.split('T')[0]
  });

  const plans = adminService.getSubscriptionPlans();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Update subscription plan
      const planSuccess = adminService.updateSubscription(
        admin.id,
        subscriptionData.plan,
        subscriptionData.duration
      );

      // Update subscription status and dates
      const statusSuccess = adminService.updateAdminProfile(admin.id, {
        subscription: {
          ...admin.subscription,
          plan: subscriptionData.plan as any,
          status: subscriptionData.status as any,
          startDate: new Date(subscriptionData.startDate).toISOString(),
          endDate: new Date(subscriptionData.endDate).toISOString(),
          features: plans.find(p => p.id === subscriptionData.plan)?.features || []
        }
      });

      if (planSuccess && statusSuccess) {
        setMessage({ type: 'success', text: 'Subscription updated successfully!' });
        setTimeout(() => {
          onUpdate();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Failed to update subscription.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating subscription.' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndDate = (startDate: string, duration: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);
    return end.toISOString().split('T')[0];
  };

  const handleDurationChange = (duration: number) => {
    setSubscriptionData(prev => ({
      ...prev,
      duration,
      endDate: calculateEndDate(prev.startDate, duration)
    }));
  };

  const handleStartDateChange = (startDate: string) => {
    setSubscriptionData(prev => ({
      ...prev,
      startDate,
      endDate: calculateEndDate(startDate, prev.duration)
    }));
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Star className="w-5 h-5" />;
      case 'premium':
        return <Crown className="w-5 h-5" />;
      case 'enterprise':
        return <Zap className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'premium':
        return 'border-purple-200 bg-purple-50 text-purple-700';
      case 'enterprise':
        return 'border-gold-200 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const selectedPlan = plans.find(p => p.id === subscriptionData.plan);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Settings className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Edit Subscription</h2>
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

        <div className="p-6 overflow-y-auto max-h-96">
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Subscription Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Subscription</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Plan:</span>
                  <span className="ml-2 font-medium capitalize">{admin.subscription.plan}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    admin.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.subscription.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Start:</span>
                  <span className="ml-2 font-medium">{new Date(admin.subscription.startDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">End:</span>
                  <span className="ml-2 font-medium">{new Date(admin.subscription.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subscription Plan
              </label>
              <div className="grid gap-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      subscriptionData.plan === plan.id
                        ? getPlanColor(plan.id) + ' border-current'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSubscriptionData(prev => ({ ...prev, plan: plan.id }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          subscriptionData.plan === plan.id ? 'bg-white bg-opacity-50' : 'bg-gray-100'
                        }`}>
                          {getPlanIcon(plan.id)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm opacity-75">${plan.price}/month</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        subscriptionData.plan === plan.id
                          ? 'border-current bg-current'
                          : 'border-gray-300'
                      }`}>
                        {subscriptionData.plan === plan.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs ${
                              subscriptionData.plan === plan.id
                                ? 'bg-white bg-opacity-50'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                        {plan.features.length > 3 && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            subscriptionData.plan === plan.id
                              ? 'bg-white bg-opacity-50'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{plan.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Status
              </label>
              <select
                value={subscriptionData.status}
                onChange={(e) => setSubscriptionData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subscription Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 6, 12].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => handleDurationChange(months)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      subscriptionData.duration === months
                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                  >
                    {months} {months === 1 ? 'Month' : 'Months'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={subscriptionData.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={subscriptionData.endDate}
                    onChange={(e) => setSubscriptionData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Selected Plan Summary */}
            {selectedPlan && (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <h4 className="font-medium text-indigo-800 mb-2">Selected Plan Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-indigo-600">Plan:</span>
                    <span className="ml-2 font-medium">{selectedPlan.name}</span>
                  </div>
                  <div>
                    <span className="text-indigo-600">Price:</span>
                    <span className="ml-2 font-medium">${selectedPlan.price}/month</span>
                  </div>
                  <div>
                    <span className="text-indigo-600">Duration:</span>
                    <span className="ml-2 font-medium">{subscriptionData.duration} months</span>
                  </div>
                  <div>
                    <span className="text-indigo-600">Total:</span>
                    <span className="ml-2 font-medium">${selectedPlan.price * subscriptionData.duration}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-indigo-600 text-sm">Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPlan.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs text-indigo-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? 'Updating...' : 'Update Subscription'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};