/**
 * Stripe Integration Service
 * 
 * This module handles all Stripe-related operations for:
 * - User subscription management
 * - Payment method handling
 * - Invoice retrieval
 * - Admin revenue dashboards
 * 
 * Note: Actual Stripe calls should be made through the backend API
 * to keep the secret key secure. This frontend service calls our backend endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Types
export interface StripeSubscription {
  id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid';
  planId: string;
  planName: string;
  priceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'sepa_debit' | 'ideal';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface StripeInvoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amountDue: number;
  amountPaid: number;
  currency: string;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
}

export interface StripePlan {
  id: string;
  name: string;
  description?: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
}

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

// API Functions

/**
 * Get current user's subscription
 */
export async function getSubscription(): Promise<StripeSubscription | null> {
  const res = await fetch(`${API_BASE}/api/stripe/subscription`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch subscription');
  }
  
  return res.json();
}

/**
 * Get available subscription plans
 */
export async function getPlans(): Promise<StripePlan[]> {
  const res = await fetch(`${API_BASE}/api/stripe/plans`);
  
  if (!res.ok) {
    throw new Error('Failed to fetch plans');
  }
  
  return res.json();
}

/**
 * Create a checkout session for new subscription
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  
  if (!res.ok) {
    throw new Error('Failed to create checkout session');
  }
  
  return res.json();
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createPortalSession(params: CreatePortalSessionParams): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/api/stripe/portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  
  if (!res.ok) {
    throw new Error('Failed to create portal session');
  }
  
  return res.json();
}

/**
 * Get payment methods for current user
 */
export async function getPaymentMethods(): Promise<StripePaymentMethod[]> {
  const res = await fetch(`${API_BASE}/api/stripe/payment-methods`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch payment methods');
  }
  
  return res.json();
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/stripe/payment-methods/${paymentMethodId}/default`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to set default payment method');
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/stripe/payment-methods/${paymentMethodId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to delete payment method');
  }
}

/**
 * Get invoices for current user
 */
export async function getInvoices(limit = 10): Promise<StripeInvoice[]> {
  const res = await fetch(`${API_BASE}/api/stripe/invoices?limit=${limit}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch invoices');
  }
  
  return res.json();
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
  const res = await fetch(`${API_BASE}/api/stripe/subscription/${subscriptionId}/cancel`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to cancel subscription');
  }
  
  return res.json();
}

/**
 * Resume a canceled subscription (before period ends)
 */
export async function resumeSubscription(subscriptionId: string): Promise<StripeSubscription> {
  const res = await fetch(`${API_BASE}/api/stripe/subscription/${subscriptionId}/resume`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to resume subscription');
  }
  
  return res.json();
}

// Admin Functions (for owner dashboard)

export interface AdminRevenueStats {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

export interface AdminRevenueByPeriod {
  period: string;
  revenue: number;
  subscriptions: number;
  newCustomers: number;
  churnedCustomers: number;
}

/**
 * Get revenue statistics (admin only)
 */
export async function getAdminRevenueStats(): Promise<AdminRevenueStats> {
  const res = await fetch(`${API_BASE}/api/admin/stripe/stats`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch revenue stats');
  }
  
  return res.json();
}

/**
 * Get revenue by period (admin only)
 */
export async function getAdminRevenueByPeriod(
  interval: 'day' | 'week' | 'month' = 'month',
  limit = 12
): Promise<AdminRevenueByPeriod[]> {
  const res = await fetch(
    `${API_BASE}/api/admin/stripe/revenue?interval=${interval}&limit=${limit}`,
    { credentials: 'include' }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  
  return res.json();
}

/**
 * Get all subscriptions (admin only)
 */
export async function getAdminSubscriptions(
  status?: StripeSubscription['status'],
  limit = 50
): Promise<{ subscriptions: StripeSubscription[]; total: number }> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('limit', String(limit));
  
  const res = await fetch(
    `${API_BASE}/api/admin/stripe/subscriptions?${params.toString()}`,
    { credentials: 'include' }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch subscriptions');
  }
  
  return res.json();
}
