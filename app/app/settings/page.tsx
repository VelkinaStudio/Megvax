'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Globe,
  Shield,
  Mail,
  Phone,
  Building,
  Save,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { Card, Button, Switch } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';
import { useToast } from '@/components/ui/Toast';
import { useTranslations, useLocale, useSetLocale } from '@/lib/i18n';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type SettingsTab = 'profile' | 'notifications' | 'preferences' | 'security';

export default function SettingsPage() {
  const toast = useToast();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useTranslations('navigation');
  const ts = useTranslations('settings_page');
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    fullName: 'Demo User',
    email: 'demo@megvax.com',
    phone: '+90 555 123 4567',
    company: 'Demo Company Inc.',
    role: 'Marketing Manager',
  });

  // Sync profile from auth user on mount / user change
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: true,
    campaignUpdates: true,
    budgetAlerts: true,
    optimizationSuggestions: true,
  });

  // Security state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const tabs = [
    { id: 'profile' as const, labelKey: 'tab_profile', icon: User },
    { id: 'notifications' as const, labelKey: 'tab_notifications', icon: Bell },
    { id: 'preferences' as const, labelKey: 'tab_preferences', icon: Globe },
    { id: 'security' as const, labelKey: 'tab_security', icon: Shield },
  ];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api('/auth/me', {
        method: 'PATCH',
        body: { fullName: profile.fullName, locale },
      });
      await refreshUser();
      if (typeof setLocale === 'function') setLocale(locale);
      toast.success(ts('profile_saved') || ts('profile_updated') || 'Profile saved');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Bildirim tercihleri yakında aktif olacak');
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error(ts('passwords_no_match'));
      return;
    }
    if (passwords.new.length < 8) {
      toast.error(ts('password_too_short'));
      return;
    }
    setIsSaving(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: passwords.current, newPassword: passwords.new },
      });
      toast.success(ts('password_changed') || 'Password changed');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings')}
        description={ts('description')}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <Card className="lg:w-64 flex-shrink-0 p-2">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {ts(tab.labelKey)}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{ts('profile_title')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">{ts('upload_photo')}</Button>
                    <p className="text-xs text-gray-500 mt-2">{ts('photo_hint')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{ts('full_name')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{ts('email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{ts('phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{ts('company')}</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <Button 
                    variant="primary" 
                    onClick={handleSaveProfile}
                    loading={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {ts('save')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{ts('notifications_title')}</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">{ts('general_notifications')}</h3>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ts('email_alerts')}</p>
                      <p className="text-sm text-gray-500">{ts('email_alerts_desc')}</p>
                    </div>
                    <Switch 
                      checked={notifications.emailAlerts}
                      onChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ts('push_notifications')}</p>
                      <p className="text-sm text-gray-500">{ts('push_notifications_desc')}</p>
                    </div>
                    <Switch 
                      checked={notifications.pushNotifications}
                      onChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ts('weekly_report')}</p>
                      <p className="text-sm text-gray-500">{ts('weekly_report_desc')}</p>
                    </div>
                    <Switch 
                      checked={notifications.weeklyReport}
                      onChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">{ts('campaign_notifications')}</h3>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ts('campaign_updates')}</p>
                      <p className="text-sm text-gray-500">{ts('campaign_updates_desc')}</p>
                    </div>
                    <Switch 
                      checked={notifications.campaignUpdates}
                      onChange={(checked) => setNotifications({ ...notifications, campaignUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ts('budget_alerts')}</p>
                      <p className="text-sm text-gray-500">{ts('budget_alerts_desc')}</p>
                    </div>
                    <Switch 
                      checked={notifications.budgetAlerts}
                      onChange={(checked) => setNotifications({ ...notifications, budgetAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ts('optimization_suggestions')}</p>
                      <p className="text-sm text-gray-500">{ts('optimization_suggestions_desc')}</p>
                    </div>
                    <Switch 
                      checked={notifications.optimizationSuggestions}
                      onChange={(checked) => setNotifications({ ...notifications, optimizationSuggestions: checked })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <Button 
                    variant="primary" 
                    onClick={handleSaveNotifications}
                    loading={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {ts('save')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{ts('preferences_title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{ts('language')}</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLocale('tr')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors ${
                        locale === 'tr' 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">🇹🇷</span>
                      <span className="font-medium">Turkish</span>
                      {locale === 'tr' && <Check className="w-4 h-4 ml-2" />}
                    </button>
                    <button
                      onClick={() => setLocale('en')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors ${
                        locale === 'en' 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">🇺🇸</span>
                      <span className="font-medium">English</span>
                      {locale === 'en' && <Check className="w-4 h-4 ml-2" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{ts('currency')}</label>
                  <select className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="TRY">₺ Turkish Lira (TRY)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{ts('timezone')}</label>
                  <select className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Europe/Istanbul">Istanbul (UTC+3)</option>
                    <option value="Europe/London">London (UTC+0)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{ts('date_format')}</label>
                  <select className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{ts('security_title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">{ts('change_password')}</h3>
                  
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{ts('current_password')}</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{ts('new_password')}</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{ts('password_hint')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{ts('new_password_confirm')}</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <Button 
                      variant="primary" 
                      onClick={handleChangePassword}
                      loading={isSaving}
                      disabled={!passwords.current || !passwords.new || !passwords.confirm}
                    >
                      {ts('change_password')}
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">{ts('two_factor')}</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ts('two_factor_status')}</p>
                      <p className="text-sm text-gray-500">{ts('two_factor_desc')}</p>
                    </div>
                    <Button variant="secondary" size="sm">{ts('enable')}</Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-red-600 mb-4">{ts('danger_zone')}</h3>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <p className="text-sm font-medium text-red-900">{ts('delete_account')}</p>
                      <p className="text-sm text-red-600">{ts('delete_account_warning')}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100">
                      {ts('delete_account')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
