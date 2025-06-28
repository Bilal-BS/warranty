import { Admin, SubscriptionPlan, AdminSession } from '../types/admin';

class AdminService {
  private admins: Admin[] = [];
  private currentSession: AdminSession | null = null;
  private subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 29,
      duration: 1,
      features: ['Product Management', 'QR Code Generation', 'Basic Analytics'],
      limits: { products: 100, qrCodes: 1000, warranties: 500 }
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 79,
      duration: 1,
      features: ['All Basic Features', 'Advanced Analytics', 'Custom Branding', 'API Access'],
      limits: { products: 500, qrCodes: 5000, warranties: 2500 }
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 199,
      duration: 1,
      features: ['All Premium Features', 'White Label', 'Priority Support', 'Custom Integrations'],
      limits: { products: -1, qrCodes: -1, warranties: -1 } // Unlimited
    }
  ];

  constructor() {
    this.loadFromStorage();
    this.initializeSuperAdmin();
  }

  private loadFromStorage() {
    const admins = localStorage.getItem('warranty_admins');
    const session = localStorage.getItem('warranty_admin_session');
    
    if (admins) this.admins = JSON.parse(admins);
    if (session) this.currentSession = JSON.parse(session);
  }

  private saveToStorage() {
    localStorage.setItem('warranty_admins', JSON.stringify(this.admins));
    if (this.currentSession) {
      localStorage.setItem('warranty_admin_session', JSON.stringify(this.currentSession));
    } else {
      localStorage.removeItem('warranty_admin_session');
    }
  }

  private initializeSuperAdmin() {
    const superAdmin = this.admins.find(a => a.role === 'superadmin');
    if (!superAdmin) {
      const defaultSuperAdmin: Admin = {
        id: 'superadmin_001',
        username: 'superadmin',
        email: 'superadmin@warranty.com',
        password: 'super123',
        pin: '0000',
        role: 'superadmin',
        status: 'approved',
        subscription: {
          plan: 'enterprise',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          features: this.subscriptionPlans.find(p => p.id === 'enterprise')?.features || []
        },
        profile: {
          firstName: 'Super',
          lastName: 'Admin',
          company: 'Warranty System'
        },
        createdAt: new Date().toISOString()
      };
      this.admins.push(defaultSuperAdmin);
      this.saveToStorage();
    }
  }

  // Authentication
  async login(identifier: string, password: string, pin?: string): Promise<AdminSession | null> {
    const admin = this.admins.find(a => 
      (a.username === identifier || a.email === identifier) &&
      a.password === password &&
      (!pin || a.pin === pin) &&
      a.status === 'approved'
    );

    if (!admin) return null;

    // Update last login
    admin.lastLogin = new Date().toISOString();
    
    const session: AdminSession = {
      admin,
      permissions: this.getPermissions(admin),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.currentSession = session;
    this.saveToStorage();
    return session;
  }

  logout() {
    this.currentSession = null;
    localStorage.removeItem('warranty_admin_session');
  }

  getCurrentSession(): AdminSession | null {
    if (!this.currentSession) return null;
    
    // Check if session expired
    if (new Date() > new Date(this.currentSession.expiresAt)) {
      this.logout();
      return null;
    }
    
    return this.currentSession;
  }

  private getPermissions(admin: Admin): string[] {
    const basePermissions = ['dashboard.view', 'products.view', 'warranties.view'];
    
    if (admin.role === 'superadmin') {
      return [
        ...basePermissions,
        'admins.view',
        'admins.create',
        'admins.approve',
        'admins.suspend',
        'admins.delete',
        'admins.edit',
        'subscriptions.manage',
        'system.settings',
        'analytics.advanced'
      ];
    }
    
    // Regular admin permissions based on subscription
    const permissions = [...basePermissions];
    
    if (admin.subscription.status === 'active') {
      permissions.push('products.create', 'products.edit', 'qrcodes.generate');
      
      if (admin.subscription.plan === 'premium' || admin.subscription.plan === 'enterprise') {
        permissions.push('analytics.advanced', 'branding.custom');
      }
      
      if (admin.subscription.plan === 'enterprise') {
        permissions.push('api.access', 'integrations.custom');
      }
    }
    
    return permissions;
  }

  // Admin Management
  registerAdmin(adminData: Omit<Admin, 'id' | 'createdAt' | 'status'>): Admin {
    const newAdmin: Admin = {
      ...adminData,
      id: `admin_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.admins.push(newAdmin);
    this.saveToStorage();
    return newAdmin;
  }

  approveAdmin(adminId: string, approvedBy: string): boolean {
    const admin = this.admins.find(a => a.id === adminId);
    if (!admin || admin.status !== 'pending') return false;
    
    admin.status = 'approved';
    admin.approvedAt = new Date().toISOString();
    admin.approvedBy = approvedBy;
    
    this.saveToStorage();
    return true;
  }

  suspendAdmin(adminId: string): boolean {
    const admin = this.admins.find(a => a.id === adminId);
    if (!admin || admin.role === 'superadmin') return false;
    
    admin.status = 'suspended';
    this.saveToStorage();
    return true;
  }

  deleteAdmin(adminId: string): boolean {
    const adminIndex = this.admins.findIndex(a => a.id === adminId);
    if (adminIndex === -1) return false;
    
    const admin = this.admins[adminIndex];
    if (admin.role === 'superadmin') return false; // Cannot delete superadmin
    
    this.admins.splice(adminIndex, 1);
    this.saveToStorage();
    return true;
  }

  getAllAdmins(): Admin[] {
    return this.admins.filter(a => a.role !== 'superadmin');
  }

  getPendingAdmins(): Admin[] {
    return this.admins.filter(a => a.status === 'pending');
  }

  updateAdminProfile(adminId: string, updates: Partial<Admin>): boolean {
    const admin = this.admins.find(a => a.id === adminId);
    if (!admin) return false;
    
    // Prevent role changes for non-superadmin updates, but allow other sensitive field updates
    const { id, role, createdAt, approvedAt, approvedBy, ...allowedUpdates } = updates;
    
    // Only superadmin can change roles
    const currentSession = this.getCurrentSession();
    if (role && currentSession?.admin.role !== 'superadmin') {
      delete (allowedUpdates as any).role;
    }
    
    Object.assign(admin, allowedUpdates);
    this.saveToStorage();
    return true;
  }

  changePassword(adminId: string, newPassword: string, newPin?: string): boolean {
    const admin = this.admins.find(a => a.id === adminId);
    if (!admin) return false;
    
    admin.password = newPassword;
    if (newPin !== undefined) admin.pin = newPin;
    
    this.saveToStorage();
    return true;
  }

  // Subscription Management
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.subscriptionPlans;
  }

  updateSubscription(adminId: string, planId: string, duration: number = 1): boolean {
    const admin = this.admins.find(a => a.id === adminId);
    const plan = this.subscriptionPlans.find(p => p.id === planId);
    
    if (!admin || !plan) return false;
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);
    
    admin.subscription = {
      plan: plan.id as any,
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      features: plan.features
    };
    
    this.saveToStorage();
    return true;
  }

  checkSubscriptionLimits(adminId: string, type: 'products' | 'qrCodes' | 'warranties', current: number): boolean {
    const admin = this.admins.find(a => a.id === adminId);
    if (!admin || admin.subscription.status !== 'active') return false;
    
    const plan = this.subscriptionPlans.find(p => p.id === admin.subscription.plan);
    if (!plan) return false;
    
    const limit = plan.limits[type];
    return limit === -1 || current < limit; // -1 means unlimited
  }

  hasPermission(permission: string): boolean {
    const session = this.getCurrentSession();
    return session?.permissions.includes(permission) || false;
  }
}

export const adminService = new AdminService();