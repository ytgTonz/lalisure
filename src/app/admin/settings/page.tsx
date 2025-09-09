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
import { useState } from 'react';

export default function AdminSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const saveSettings = () => {
    console.log('Saving settings...');
  };

  const exportSettings = () => {
    console.log('Exporting settings...');
  };

  const importSettings = () => {
    console.log('Importing settings...');
  };

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
            <Button variant="outline" onClick={importSettings}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
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
                      placeholder="LaLiSure Insurance"
                      defaultValue="LaLiSure Insurance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      placeholder="LaLiSure (Pty) Ltd"
                      defaultValue="LaLiSure (Pty) Ltd"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      placeholder="support@lalisure.co.za"
                      defaultValue="support@lalisure.co.za"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-phone">Support Phone</Label>
                    <Input
                      id="support-phone"
                      placeholder="+27 11 123 4567"
                      defaultValue="+27 11 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-address">Company Address</Label>
                  <Textarea
                    id="company-address"
                    placeholder="Enter company address..."
                    defaultValue="123 Business Avenue, Sandton, Johannesburg, 2196, South Africa"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select defaultValue="africa/johannesburg">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                        <SelectItem value="africa/cape_town">Africa/Cape Town (SAST)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="zar">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zar">South African Rand (ZAR)</SelectItem>
                        <SelectItem value="usd">US Dollar (USD)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <CardDescription>Authentication and security configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <div className="text-sm text-muted-foreground">
                      Require 2FA for all admin users
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorRequired}
                    onCheckedChange={setTwoFactorRequired}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      placeholder="60"
                      defaultValue="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      placeholder="5"
                      defaultValue="5"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password-min-length">Minimum Password Length</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      placeholder="8"
                      defaultValue="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input
                      id="password-expiry"
                      type="number"
                      placeholder="90"
                      defaultValue="90"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Settings
                </CardTitle>
                <CardDescription>Payment processing and gateway configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="payment-gateway">Primary Payment Gateway</Label>
                  <Select defaultValue="paystack">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paystack">Paystack</SelectItem>
                      <SelectItem value="payfast">PayFast</SelectItem>
                      <SelectItem value="ozow">Ozow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-fee">Transaction Fee (%)</Label>
                    <Input
                      id="transaction-fee"
                      type="number"
                      step="0.01"
                      placeholder="2.95"
                      defaultValue="2.95"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum-payment">Minimum Payment (ZAR)</Label>
                    <Input
                      id="minimum-payment"
                      type="number"
                      placeholder="100"
                      defaultValue="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Accepted Payment Methods</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked id="credit-cards" />
                      <Label htmlFor="credit-cards">Credit Cards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked id="debit-cards" />
                      <Label htmlFor="debit-cards">Debit Cards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked id="bank-transfers" />
                      <Label htmlFor="bank-transfers">Bank Transfers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="digital-wallets" />
                      <Label htmlFor="digital-wallets">Digital Wallets</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Policy Settings
                </CardTitle>
                <CardDescription>Insurance policy configuration and rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="grace-period">Grace Period (days)</Label>
                    <Input
                      id="grace-period"
                      type="number"
                      placeholder="30"
                      defaultValue="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claim-timeout">Claim Timeout (days)</Label>
                    <Input
                      id="claim-timeout"
                      type="number"
                      placeholder="180"
                      defaultValue="180"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-coverage">Maximum Coverage (ZAR)</Label>
                    <Input
                      id="max-coverage"
                      type="number"
                      placeholder="5000000"
                      defaultValue="5000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-premium">Minimum Premium (ZAR)</Label>
                    <Input
                      id="min-premium"
                      type="number"
                      placeholder="500"
                      defaultValue="500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve Low Risk Policies</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically approve policies under R50,000
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Temporarily disable user access
                    </div>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Database Status</span>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">API Status</span>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Payment Gateway</span>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      System alerts via email
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Critical alerts via SMS
                    </div>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@lalisure.co.za"
                    defaultValue="admin@lalisure.co.za"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup & Recovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backup</Label>
                    <div className="text-sm text-muted-foreground">
                      Daily database backups
                    </div>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-time">Backup Time</Label>
                  <Input
                    id="backup-time"
                    type="time"
                    defaultValue="02:00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention-period">Retention Period (days)</Label>
                  <Input
                    id="retention-period"
                    type="number"
                    placeholder="30"
                    defaultValue="30"
                  />
                </div>

                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </CardContent>
            </Card>

            {/* Integration Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Email Service</span>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">SMS Gateway</span>
                    <span className="text-sm text-orange-600">Pending</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Document Storage</span>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Analytics</span>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Integrations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}