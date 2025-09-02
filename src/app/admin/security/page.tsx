'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye,
  Key,
  Activity,
  Users,
  Globe,
  Server,
  Smartphone,
  RefreshCw,
  Download,
  Ban,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'permission_change' | 'data_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  description: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  resolved: boolean;
}

export default function AdminSecurityPage() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    sessionTimeout: 30,
    passwordComplexity: true,
    ipWhitelist: false,
    auditLogging: true,
    suspiciousActivityAlerts: true,
    dataEncryption: true,
    apiRateLimit: 1000,
  });

  // Mock security events
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'failed_login',
      severity: 'medium',
      user: 'unknown',
      description: 'Multiple failed login attempts from 192.168.1.100',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      resolved: false
    },
    {
      id: '2',
      type: 'permission_change',
      severity: 'high',
      user: 'admin@lalisure.co.za',
      description: 'User role changed from AGENT to ADMIN',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0...',
      resolved: true
    },
    {
      id: '3',
      type: 'suspicious_activity',
      severity: 'critical',
      user: 'agent@lalisure.co.za',
      description: 'Unusual data access pattern detected',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      ipAddress: '203.0.113.45',
      userAgent: 'Python-requests/2.28.1',
      resolved: false
    },
    {
      id: '4',
      type: 'login',
      severity: 'low',
      user: 'underwriter@lalisure.co.za',
      description: 'Successful login from new location',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      ipAddress: '172.16.0.25',
      userAgent: 'Mozilla/5.0...',
      resolved: true
    }
  ]);

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login': return <CheckCircle className="h-4 w-4" />;
      case 'failed_login': return <XCircle className="h-4 w-4" />;
      case 'permission_change': return <Key className="h-4 w-4" />;
      case 'data_access': return <Eye className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (severity: SecurityEvent['severity'], resolved: boolean) => {
    if (resolved) return 'bg-green-100 text-green-800';
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  const handleSettingChange = (setting: string, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast.success(`Security setting updated: ${setting}`);
  };

  const handleResolveEvent = (eventId: string) => {
    toast.success('Security event marked as resolved');
  };

  const handleBlockIP = (ipAddress: string) => {
    toast.success(`IP address ${ipAddress} has been blocked`);
  };

  const generateSecurityReport = () => {
    toast.success('Security report generated and downloaded');
  };

  const unresolvedEvents = securityEvents.filter(e => !e.resolved);
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical' && !e.resolved);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security Center</h1>
            <p className="text-muted-foreground">
              Monitor security events, manage access controls, and configure security settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={generateSecurityReport}>
              <Download className="h-4 w-4 mr-2" />
              Security Report
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">95%</div>
              <p className="text-xs text-muted-foreground">
                <CheckCircle className="inline h-3 w-3 mr-1" />
                Excellent security posture
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">127</div>
              <p className="text-xs text-muted-foreground">Across all platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unresolved Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unresolvedEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                {criticalEvents.length} critical events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">23</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {/* Critical Alerts */}
            {criticalEvents.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Security Alerts
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    Immediate attention required for {criticalEvents.length} critical security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {criticalEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="text-red-600">
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{event.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.user} • {formatTimestamp(event.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleBlockIP(event.ipAddress)}>
                            <Ban className="h-4 w-4 mr-1" />
                            Block IP
                          </Button>
                          <Button size="sm" onClick={() => handleResolveEvent(event.id)}>
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>All security-related activities and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-full ${getEventColor(event.severity, event.resolved)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{event.description}</h4>
                              <Badge className={getEventColor(event.severity, event.resolved)}>
                                {event.resolved ? 'Resolved' : event.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">{event.user}</span> • 
                              <span className="ml-1">{event.ipAddress}</span> • 
                              <span className="ml-1">{formatTimestamp(event.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Security Event Details</DialogTitle>
                                <DialogDescription>
                                  Event ID: {event.id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-muted-foreground">Event Type</Label>
                                    <p className="font-medium">{event.type.replace('_', ' ')}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Severity</Label>
                                    <p className="font-medium">{event.severity}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">User</Label>
                                    <p className="font-medium">{event.user}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <p className="font-medium">{event.resolved ? 'Resolved' : 'Open'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">IP Address</Label>
                                    <p className="font-medium">{event.ipAddress}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Timestamp</Label>
                                    <p className="font-medium">{formatTimestamp(event.timestamp)}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">User Agent</Label>
                                  <p className="font-medium text-xs bg-gray-50 p-2 rounded mt-1">
                                    {event.userAgent}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {!event.resolved && (
                            <Button size="sm" onClick={() => handleResolveEvent(event.id)}>
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Authentication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentication Settings
                  </CardTitle>
                  <CardDescription>Configure authentication and access policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorRequired}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorRequired', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Select
                      value={securitySettings.sessionTimeout.toString()}
                      onValueChange={(value) => handleSettingChange('sessionTimeout', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Password Complexity</Label>
                      <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                    </div>
                    <Switch
                      checked={securitySettings.passwordComplexity}
                      onCheckedChange={(checked) => handleSettingChange('passwordComplexity', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Security
                  </CardTitle>
                  <CardDescription>Configure system-level security features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>IP Whitelist</Label>
                      <p className="text-sm text-muted-foreground">Restrict access to approved IP addresses</p>
                    </div>
                    <Switch
                      checked={securitySettings.ipWhitelist}
                      onCheckedChange={(checked) => handleSettingChange('ipWhitelist', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all system activities</p>
                    </div>
                    <Switch
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Data Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt sensitive data at rest</p>
                    </div>
                    <Switch
                      checked={securitySettings.dataEncryption}
                      onCheckedChange={(checked) => handleSettingChange('dataEncryption', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Rate Limit (requests/hour)</Label>
                    <Input
                      type="number"
                      value={securitySettings.apiRateLimit}
                      onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Manage user permissions and access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Access control management interface</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Configure role-based permissions, API access, and user privileges
                    </p>
                    <Button className="mt-4">
                      Manage Access Controls
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Security Monitoring
                </CardTitle>
                <CardDescription>Real-time security monitoring and alerting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">120ms</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <div className="text-sm text-muted-foreground">Active Sessions</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Monitoring Alerts</h3>
                    <Switch
                      checked={securitySettings.suspiciousActivityAlerts}
                      onCheckedChange={(checked) => handleSettingChange('suspiciousActivityAlerts', checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time alerts for suspicious activities, failed login attempts, and security violations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}