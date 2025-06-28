export interface Admin {
  id: string;
  username: string;
  email: string;
  password: string;
  pin?: string;
  role: 'admin' | 'superadmin';
  status: 'pending' | 'approved' | 'suspended';
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'expired' | 'suspended';
    startDate: string;
    endDate: string;
    features: string[];
  };
  profile: {
    firstName: string;
    lastName: string;
    company?: string;
    phone?: string;
  };
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastLogin?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
  limits: {
    products: number;
    qrCodes: number;
    warranties: number;
  };
}

export interface AdminSession {
  admin: Admin;
  permissions: string[];
  expiresAt: string;
}