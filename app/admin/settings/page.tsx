'use client';

import { useState } from 'react';
import {
  Save,
  Shield,
  Bell,
  Database,
  Building,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'MegVax',
    email: 'admin@megvax.com',
    phone: '+90 (212) 555-0100',
    address: 'Levent Mahallesi, Büyükdere Cad. No:171, 34394 Şişli/İstanbul',
  });

  const [notifications, setNotifications] = useState({
    newSignup: true,
    newPayment: true,
    failedPayment: true,
    newMessage: true,
    weeklyReport: true,
    meetingBooked: false,
  });

  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    newRegistrations: true,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const apiKey = 'mvx_live_sk_a4f2e8b1c3d5e6f7a8b9c0d1e2f3a4b5';
  const maskedKey = 'mvx_live_sk_••••••••••••••••••••••••';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform configuration and preferences</p>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            <p className="text-sm text-gray-500">Business details and contact info</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo(s => ({ ...s, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo(s => ({ ...s, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo(s => ({ ...s, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <textarea
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo(s => ({ ...s, address: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Choose which events send email alerts</p>
          </div>
        </div>
        <div className="space-y-1">
          {[
            { key: 'newSignup' as const, label: 'New User Signup', desc: 'Get notified when a new user registers' },
            { key: 'newPayment' as const, label: 'New Payment', desc: 'Get notified on successful payments' },
            { key: 'failedPayment' as const, label: 'Failed Payment', desc: 'Alert when a payment fails or is declined' },
            { key: 'newMessage' as const, label: 'New Contact Message', desc: 'Get notified when someone submits the contact form' },
            { key: 'weeklyReport' as const, label: 'Weekly Summary Report', desc: 'Receive a weekly metrics summary email' },
            { key: 'meetingBooked' as const, label: 'Meeting Booked', desc: 'Get notified when a meeting is scheduled' },
          ].map((item, idx) => (
            <div
              key={item.key}
              className={`flex items-center justify-between py-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Toggles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Controls</h3>
            <p className="text-sm text-gray-500">Platform-level toggles</p>
          </div>
        </div>
        <div className="space-y-1">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                {toggles.maintenanceMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">When enabled, only admins can access the site</p>
            </div>
            <button
              onClick={() => setToggles(t => ({ ...t, maintenanceMode: !t.maintenanceMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                toggles.maintenanceMode ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  toggles.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* New Registrations */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">New Registrations</p>
              <p className="text-xs text-gray-500 mt-0.5">Allow new users to create accounts</p>
            </div>
            <button
              onClick={() => setToggles(t => ({ ...t, newRegistrations: !t.newRegistrations }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                toggles.newRegistrations ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  toggles.newRegistrations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
            <p className="text-sm text-gray-500">Your MegVax API key for integrations</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={showApiKey ? apiKey : maskedKey}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 text-gray-700 focus:outline-none"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleCopyKey}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                copied
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Never share your API key publicly. Rotate if compromised.</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all shadow-sm ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
