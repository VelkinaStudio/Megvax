import { z } from 'zod';

// Authentication Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Campaign Schemas
export const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Name too long'),
  objective: z.enum(['awareness', 'traffic', 'engagement', 'leads', 'sales'], {
    message: 'Please select a valid objective',
  }),
  budget: z.number().positive('Budget must be greater than 0'),
  budgetType: z.enum(['daily', 'lifetime']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  status: z.enum(['active', 'paused', 'draft']).optional(),
});

export const adSetSchema = z.object({
  name: z.string().min(1, 'Ad set name is required').max(100, 'Name too long'),
  campaignId: z.string().min(1, 'Campaign is required'),
  budget: z.number().positive('Budget must be greater than 0'),
  bidStrategy: z.enum(['lowest_cost', 'cost_cap', 'bid_cap']),
  targeting: z.object({
    locations: z.array(z.string()).min(1, 'At least one location required'),
    ageMin: z.number().min(18, 'Minimum age is 18').max(65),
    ageMax: z.number().min(18).max(65),
    gender: z.enum(['all', 'male', 'female']),
    interests: z.array(z.string()).optional(),
  }),
});

// Automation Schemas
export const automationRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required').max(100, 'Name too long'),
  trigger: z.object({
    metric: z.enum(['roas', 'cpa', 'ctr', 'spend', 'conversions']),
    operator: z.enum(['greater_than', 'less_than', 'equals']),
    value: z.number(),
    duration: z.number().min(1, 'Duration must be at least 1 day'),
  }),
  action: z.object({
    type: z.enum(['pause', 'activate', 'adjust_budget', 'send_notification']),
    value: z.number().optional(),
  }),
  scope: z.object({
    level: z.enum(['campaign', 'adset', 'ad']),
    items: z.array(z.string()).min(1, 'Select at least one item'),
  }),
  enabled: z.boolean().optional(),
});

// Support Schemas
export const supportTicketSchema = z.object({
  category: z.enum(['bug', 'feature', 'account', 'billing', 'other'], {
    message: 'Please select a category',
  }),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000, 'Message too long'),
});

// Settings Schemas
export const profileSettingsSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  timezone: z.string().optional(),
  language: z.enum(['en', 'tr']).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklyReports: z.boolean(),
  performanceAlerts: z.boolean(),
  budgetAlerts: z.boolean(),
  optimizationSuggestions: z.boolean(),
});

// Admin Schemas
export const adminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['user', 'admin', 'super_admin']),
  status: z.enum(['active', 'suspended', 'pending']),
  plan: z.enum(['starter', 'pro', 'business']).optional(),
});

export const adminSystemSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  newRegistrations: z.boolean(),
  emailNotifications: z.boolean(),
  autoOptimization: z.boolean(),
  metaAppId: z.string().optional(),
  googleClientId: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type AdSetInput = z.infer<typeof adSetSchema>;
export type AutomationRuleInput = z.infer<typeof automationRuleSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type AdminUserInput = z.infer<typeof adminUserSchema>;
export type AdminSystemSettingsInput = z.infer<typeof adminSystemSettingsSchema>;
