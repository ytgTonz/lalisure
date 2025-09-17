'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  TestTube,
  BarChart3,
  Settings
} from 'lucide-react';

export default function EmailTestingPage() {
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState<'basic' | 'template' | 'tracked'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // API calls
  const { data: analytics, refetch: refetchAnalytics } = api.email.getAnalytics.useQuery({});
  const { data: templates } = api.email.getTemplates.useQuery();
  const { data: emailLogs } = api.email.getEmailLogs.useQuery({ page: 1, limit: 10 });
  
  const sendTestEmailMutation = api.email.sendTestEmail.useMutation();
  const retryFailedEmailsMutation = api.email.retryFailedEmails.useMutation();

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendTestEmailMutation.mutateAsync({
        to: testEmail,
        type: testType === 'basic' ? undefined : 'TEST',
        subject: testType === 'basic' ? `Test Email - ${testType}` : undefined,
        html: testType === 'basic' ? '<p>This is a test email from Lalisure.</p>' : undefined,
      });

      setTestResults(prev => [{
        type: testType,
        email: testEmail,
        result,
        timestamp: new Date().toISOString(),
      }, ...prev]);

      toast.success(`${testType} test email sent successfully!`);
      refetchAnalytics();
    } catch (error) {
      toast.error(`Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryFailedEmails = async () => {
    try {
      await retryFailedEmailsMutation.mutateAsync();
      toast.success('Failed emails retry process started');
      refetchAnalytics();
    } catch (error) {
      toast.error(`Failed to retry emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
      case 'OPENED':
      case 'CLICKED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'BOUNCED':
        return 'bg-red-100 text-red-800';
      case 'COMPLAINT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Testing & Management</h1>
        <p className="text-muted-foreground">
          Test email functionality, monitor delivery, and manage email templates.
        </p>
      </div>

      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Logs
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Email Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Test Email
                </CardTitle>
                <CardDescription>
                  Test the email system with different email types.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select value={testType} onValueChange={(value: any) => setTestType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Email</SelectItem>
                      <SelectItem value="template">Template Email</SelectItem>
                      <SelectItem value="tracked">Tracked Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSendTestEmail}
                  disabled={isLoading || !testEmail}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
                <CardDescription>
                  Results from your recent email tests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No test results yet. Send a test email to see results here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {testResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{result.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.type} • {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={result.result?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {result.result?.success ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {result.result?.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common email management tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={handleRetryFailedEmails}
                  disabled={retryFailedEmailsMutation.isPending}
                >
                  {retryFailedEmailsMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry Failed Emails
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Emails</p>
                    <p className="text-2xl font-bold">{analytics?.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold">{analytics?.delivered || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">{analytics?.openRate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                    <p className="text-2xl font-bold">{analytics?.bounceRate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Logs</CardTitle>
              <CardDescription>
                Latest email sending activity and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailLogs?.emails?.length ? (
                <p className="text-muted-foreground text-center py-8">
                  No email logs found.
                </p>
              ) : (
                <div className="space-y-3">
                  {emailLogs.emails.map((email: any) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{email.to}</p>
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {email.subject} • {new Date(email.createdAt).toLocaleString()}
                        </p>
                        {email.errorMessage && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {email.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage email templates for different notification types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!templates?.length ? (
                <p className="text-muted-foreground text-center py-8">
                  No email templates found.
                </p>
              ) : (
                <div className="space-y-3">
                  {templates.map((template: any) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
