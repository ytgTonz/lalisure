'use client';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/trpc/react';
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
import { SecurityEventType, SecurityEventSeverity } from '@prisma/client';

export default function AdminSecurityPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    resolved: 'all'
  });

  // Fetch security data
  const { data: eventsData, refetch: refetchEvents } = api.security.getEvents.useQuery({
    type: filters.type !== 'all' ? filters.type as SecurityEventType : undefined,
    severity: filters.severity !== 'all' ? filters.severity as SecurityEventSeverity : undefined,
    resolved: filters.resolved !== 'all' ? filters.resolved === 'true' : undefined,
    limit: 50
  });

  const { data: statsData } = api.security.getStats.useQuery();
  const { data: settingsData } = api.security.getSettings.useQuery();

  // Mutations
  const resolveEventMutation = api.security.resolveEvent.useMutation();
  const updateSettingsMutation = api.security.updateSettings.useMutation();

  const events = eventsData?.events || [];
  const stats = statsData || {};
  const settings = settingsData || {};

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'LOGIN': return <Key className="h-4 w-4" />;
      case 'FAILED_LOGIN': return <Ban className="h-4 w-4" />;
      case 'PERMISSION_CHANGE': return <Users className="h-4 w-4" />;
      case 'DATA_ACCESS': return <Eye className="h-4 w-4" />;
      case 'SUSPICIOUS_ACTIVITY': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolveEvent = async () => {
    if (!selectedEvent) return;

    try {
      await resolveEventMutation.mutateAsync({
        eventId: selectedEvent.id,
        resolution
      });
      toast.success('Event resolved successfully');
      setSelectedEvent(null);
      setResolution('');
      refetchEvents();
    } catch (error) {
      toast.error('Failed to resolve event');
      console.error('Error resolving event:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      await updateSettingsMutation.mutateAsync(newSettings);
      toast.success('Security settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Error updating settings:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security Center</h1>
            <p className="text-muted-foreground">
              Monitor security events and manage security settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetchEvents()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Security Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.totalEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Unresolved</p>
                  <p className="text-2xl font-bold">{stats.unresolvedEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold">{stats.criticalEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Last 24h</p>
                  <p className="text-2xl font-bold">{stats.recentEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="LOGIN">Login</SelectItem>
                        <SelectItem value="FAILED_LOGIN">Failed Login</SelectItem>
                        <SelectItem value="PERMISSION_CHANGE">Permission Change</SelectItem>
                        <SelectItem value="DATA_ACCESS">Data Access</SelectItem>
                        <SelectItem value="SUSPICIOUS_ACTIVITY">Suspicious Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={filters.severity}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.resolved}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, resolved: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="false">Unresolved</SelectItem>
                        <SelectItem value="true">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>
                  Recent security events and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event: any) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium truncate">
                              {event.description}
                            </p>
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                            {event.resolved && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{event.userEmail || 'Unknown User'}</span>
                            <span>{event.ipAddress}</span>
                            <span>{getTimeAgo(event.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!event.resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                          >
                            Resolve
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No security events found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security policies and authentication
                </CardDescription>
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
                    onCheckedChange={(checked) => handleUpdateSettings({ twoFactorRequired: checked })}
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
                    onCheckedChange={(checked) => handleUpdateSettings({ passwordComplexity: checked })}
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
                    onCheckedChange={(checked) => handleUpdateSettings({ auditLogging: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Suspicious Activity Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts for suspicious activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.suspiciousActivityAlerts || false}
                    onCheckedChange={(checked) => handleUpdateSettings({ suspiciousActivityAlerts: checked })}
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
                      onChange={(e) => handleUpdateSettings({ sessionTimeout: parseInt(e.target.value) })}
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
                      onChange={(e) => handleUpdateSettings({ apiRateLimit: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resolve Event Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Security Event</DialogTitle>
              <DialogDescription>
                Provide a resolution note for this security event.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resolution">Resolution Note</Label>
                <Input
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this event was resolved..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Cancel
                </Button>
                <Button onClick={handleResolveEvent} disabled={!resolution.trim()}>
                  Resolve Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    // </DashboardLayout>
  );
}