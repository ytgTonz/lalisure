'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import { 
  Settings,
  Shield,
  Bell,
  Mail,
  Database,
  Globe,
  CreditCard,
  FileText,
  Users,
  Lock,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Server,
  Smartphone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings
  const { data: settingsData, refetch } = api.settings.get.useQuery();
  const updateSettingsMutation = api.settings.update.useMutation();
  const resetSettingsMutation = api.settings.reset.useMutation();

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
      setIsLoading(false);
    }
  }, [settingsData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync(settings);
      toast.success('Settings saved successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetSettingsMutation.mutateAsync();
      toast.success('Settings reset to defaults');
      refetch();
    } catch (error) {
      toast.error('Failed to reset settings');
      console.error('Error resetting settings:', error);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'lalisure-settings.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
            <p className="text-muted-foreground">
              Configure system-wide settings, security, and platform behavior
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic platform configuration and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input
                      id="platform-name"
                      value={settings.platformName || ''}
                      onChange={(e) => updateSetting('platformName', e.target.value)}
                      placeholder="LaLiSure Insurance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency || 'ZAR'}
                      onValueChange={(value) => updateSetting('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-description">Platform Description</Label>
                  <Textarea
                    id="platform-description"
                    value={settings.platformDescription || ''}
                    onChange={(e) => updateSetting('platformDescription', e.target.value)}
                    placeholder="Brief description of the platform"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate ? (settings.taxRate * 100) : 15}
                    onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value) / 100)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications || false}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications || false}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send WhatsApp notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsappNotifications || false}
                    onCheckedChange={(checked) => updateSetting('whatsappNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin users
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorRequired || false}
                    onCheckedChange={(checked) => updateSetting('twoFactorRequired', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce strong password requirements
                    </p>
                  </div>
                  <Switch
                    checked={settings.passwordComplexity || false}
                    onCheckedChange={(checked) => updateSetting('passwordComplexity', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all user actions and system events
                    </p>
                  </div>
                  <Switch
                    checked={settings.auditLogging || false}
                    onCheckedChange={(checked) => updateSetting('auditLogging', checked)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout || 30}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-rate-limit">API Rate Limit (requests/hour)</Label>
                    <Input
                      id="api-rate-limit"
                      type="number"
                      min="100"
                      max="10000"
                      value={settings.apiRateLimit || 1000}
                      onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Maintenance Settings
                </CardTitle>
                <CardDescription>System maintenance and backup configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put the system in maintenance mode
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode || false}
                    onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                  />
                </div>
                {settings.maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance-message"
                      value={settings.maintenanceMessage || ''}
                      onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                      placeholder="Message to display during maintenance"
                      rows={3}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup system data
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup || false}
                    onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select
                    value={settings.backupFrequency || 'daily'}
                    onValueChange={(value) => updateSetting('backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="text-sm text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <span className="text-sm text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Service</span>
                  <span className="text-sm text-yellow-600">Configured</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Gateway</span>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Run Backup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}