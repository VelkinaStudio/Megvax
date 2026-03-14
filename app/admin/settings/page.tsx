'use client';

import { useTranslations } from '@/lib/i18n';
import { useState } from 'react';
import { Save, Shield, Bell, Database } from 'lucide-react';
import { Card, Button, Switch, Input } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';

export default function AdminSettingsPage() {
  const t = useTranslations('admin_settings');
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailNotifications: true,
    autoOptimize: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {/* General Settings */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{t('general_settings')}</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t('maintenance_mode')}</p>
              <p className="text-sm text-gray-500">{t('maintenance_desc')}</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onChange={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t('new_registrations')}</p>
                <p className="text-sm text-gray-500">{t('new_registrations_desc')}</p>
              </div>
              <Switch
                checked={settings.newRegistrations}
                onChange={() => setSettings(s => ({ ...s, newRegistrations: !s.newRegistrations }))}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{t('notification_settings')}</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t('email_notifications')}</p>
              <p className="text-sm text-gray-500">{t('email_notifications_desc')}</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onChange={() => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }))}
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t('auto_optimize')}</p>
                <p className="text-sm text-gray-500">{t('auto_optimize_desc')}</p>
              </div>
              <Switch
                checked={settings.autoOptimize}
                onChange={() => setSettings(s => ({ ...s, autoOptimize: !s.autoOptimize }))}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* API Settings */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{t('api_settings')}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('meta_app_id')}
            </label>
            <Input
              type="text"
              placeholder={t('meta_app_placeholder')}
              defaultValue="1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('google_client_id')}
            </label>
            <Input
              type="text"
              placeholder={t('google_client_placeholder')}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" icon={<Save className="w-4 h-4" />}>
          {t('save_settings')}
        </Button>
      </div>
    </div>
  );
}
