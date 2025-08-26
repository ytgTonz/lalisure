'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Mail,
  MessageSquare,
  Phone,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    dataSharing: false,
    analytics: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="grid gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Policy updates, claim status, and important announcements
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.email ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationChange('email', !notifications.email)}
                  >
                    {notifications.email ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Urgent updates and claim approvals
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.sms ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationChange('sms', !notifications.sms)}
                  >
                    {notifications.sms ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Real-time updates in your browser
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.push ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationChange('push', !notifications.push)}
                  >
                    {notifications.push ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Product updates and promotional offers
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.marketing ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationChange('marketing', !notifications.marketing)}
                  >
                    {notifications.marketing ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your data and account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow agents to view your basic profile information
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={privacy.profileVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePrivacyChange('profileVisible', !privacy.profileVisible)}
                  >
                    {privacy.profileVisible ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Share anonymized data for service improvement
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={privacy.dataSharing ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePrivacyChange('dataSharing', !privacy.dataSharing)}
                  >
                    {privacy.dataSharing ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by collecting usage analytics
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={privacy.analytics ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePrivacyChange('analytics', !privacy.analytics)}
                  >
                    {privacy.analytics ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-destructive/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button size="lg" className="px-8">
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}