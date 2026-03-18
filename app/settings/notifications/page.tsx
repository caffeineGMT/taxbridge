'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications_enabled: true,
    in_app_notifications_enabled: true,
    sms_notifications_enabled: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/notifications');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: 'Settings saved',
          description: 'Your notification preferences have been updated.',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Notification Settings</h1>
          <p className="text-slate-400">
            Manage how you receive notifications from TaxBridge
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-slate-400">
              Choose how you want to be notified about deadlines, opportunities, and updates
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <Checkbox
                id="email"
                checked={settings.email_notifications_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, email_notifications_enabled: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="email"
                  className="text-slate-100 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  Email Notifications
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Receive daily digest emails with tax deadline reminders, FTC opportunities, and important updates
                </p>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <Checkbox
                id="in-app"
                checked={settings.in_app_notifications_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, in_app_notifications_enabled: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="in-app"
                  className="text-slate-100 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-emerald-400" />
                  In-App Notifications
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  See notifications in the notification bell when you're using TaxBridge
                </p>
              </div>
            </div>

            {/* SMS Notifications (Future) */}
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 opacity-50">
              <Checkbox
                id="sms"
                checked={settings.sms_notifications_enabled}
                disabled
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="sms"
                  className="text-slate-100 font-semibold flex items-center gap-2 cursor-not-allowed"
                >
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  SMS Notifications
                  <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                    Coming Soon
                  </span>
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Get text message alerts for critical deadlines and time-sensitive updates
                </p>
              </div>
            </div>

            {/* Notification Types Info */}
            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">What you'll be notified about:</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">⏰</span>
                  Tax filing deadlines (30 days before April 15 US / April 30 Canada)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">💰</span>
                  Foreign Tax Credit optimization opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✨</span>
                  New features and product updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">🔄</span>
                  Subscription renewal reminders (7 days before)
                </li>
              </ul>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
