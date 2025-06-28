import React, { useState, useEffect } from 'react';
import { BackendDashboard } from './components/Backend/BackendDashboard';
import { SuperAdminDashboard } from './components/SuperAdmin/SuperAdminDashboard';
import { LoginForm } from './components/Auth/LoginForm';
import { CustomerScanner } from './components/Frontend/CustomerScanner';
import { AdminProfile } from './components/Admin/AdminProfile';
import { adminService } from './services/adminService';
import { Settings, QrCode, User } from 'lucide-react';
import { AdminSession } from './types/admin';

function App() {
  const [view, setView] = useState<'backend' | 'frontend'>('frontend');
  const [currentSession, setCurrentSession] = useState<AdminSession | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Check for existing session on app load
    const session = adminService.getCurrentSession();
    if (session) {
      setCurrentSession(session);
      setView('backend');
    }
  }, []);

  const handleLogin = (session: AdminSession) => {
    setCurrentSession(session);
    setView('backend');
  };

  const handleLogout = () => {
    adminService.logout();
    setCurrentSession(null);
    setView('frontend');
    setShowProfile(false);
  };

  const switchToAdmin = () => {
    if (!currentSession) {
      setView('backend');
    }
  };

  const handleProfileUpdate = () => {
    // Refresh session after profile update
    const session = adminService.getCurrentSession();
    if (session) {
      setCurrentSession(session);
    }
  };

  const isAdmin = currentSession?.admin.role === 'admin';
  const isSuperAdmin = currentSession?.admin.role === 'superadmin';

  return (
    <div className="min-h-screen">
      {/* View Toggle - Only show when authenticated */}
      {currentSession && isAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex">
            <button
              onClick={() => setView('backend')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'backend'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => setView('frontend')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'frontend'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              title="Profile Settings"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Access Button - Only show in customer view when not authenticated */}
      {view === 'frontend' && !currentSession && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={switchToAdmin}
            className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-colors group"
            title="Admin Access"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content */}
      {view === 'backend' ? (
        currentSession ? (
          isSuperAdmin ? (
            <SuperAdminDashboard onLogout={handleLogout} />
          ) : (
            <BackendDashboard onLogout={handleLogout} />
          )
        ) : (
          <LoginForm onLogin={handleLogin} onRegister={() => {}} />
        )
      ) : (
        <CustomerScanner />
      )}

      {/* Profile Modal */}
      {showProfile && currentSession && (
        <AdminProfile
          admin={currentSession.admin}
          onClose={() => setShowProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default App;