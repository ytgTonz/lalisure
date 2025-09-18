'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailService } from '@/lib/services/email';
import { toast } from 'sonner';
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function EmailTestSimple() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const [formData, setFormData] = useState({
    to: '',
    subject: 'Test Email from Lalisure',
    message: 'This is a test email to verify Resend email functionality is working correctly.',
    type: 'basic'
  });

  const handleSendTest = async () => {
    if (!formData.to) {
      toast.error('Please enter a recipient email address');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      let result;

      switch (formData.type) {
        case 'basic':
          result = await EmailService.sendEmail({
            to: formData.to,
            subject: formData.subject,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Lalisure Insurance</h2>
              <p>${formData.message}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This email was sent from your Lalisure application to test Resend email functionality.
              </p>
            </div>`,
            text: formData.message
          });
          break;

        case 'tracked':
          result = await EmailService.sendTrackedEmail({
            to: formData.to,
            subject: formData.subject,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Lalisure Insurance - Tracked Email</h2>
              <p>${formData.message}</p>
              <p style="color: #059669;">✅ This email includes tracking and analytics.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This email was sent from your Lalisure application with full tracking enabled.
              </p>
            </div>`,
            text: formData.message,
            type: 'GENERAL',
            metadata: { test: true, timestamp: new Date().toISOString() }
          });
          break;

        default:
          throw new Error('Invalid email type');
      }

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Email sent successfully!',
          details: result.data
        });
        toast.success('Email sent successfully!');
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to send email',
          details: result
        });
        toast.error('Failed to send email');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResult({
        success: false,
        message: errorMessage,
        details: error
      });
      toast.error('Error sending email');
    } finally {
      setIsLoading(false);
    }
  };

  const quickTests = [
    {
      name: 'Basic Test',
      to: '',
      subject: 'Lalisure Email Test - Basic',
      message: 'This is a basic test email to verify Resend is working.',
      type: 'basic'
    },
    {
      name: 'Tracked Test',
      to: '',
      subject: 'Lalisure Email Test - Tracked',
      message: 'This is a tracked test email with analytics enabled.',
      type: 'tracked'
    }
  ];

  const handleQuickTest = (test: typeof quickTests[0]) => {
    setFormData({
      to: test.to || formData.to,
      subject: test.subject,
      message: test.message,
      type: test.type
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend Email Test
          </CardTitle>
          <CardDescription>
            Test your Resend email configuration. Make sure you've set the environment variables in Render.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="to">Recipient Email</Label>
              <Input
                id="to"
                type="email"
                placeholder="test@example.com"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Email Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Email</SelectItem>
                  <SelectItem value="tracked">Tracked Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSendTest} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLoading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>

          {/* Quick Test Buttons */}
          <div className="space-y-2">
            <Label>Quick Tests</Label>
            <div className="flex gap-2 flex-wrap">
              {quickTests.map((test, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTest(test)}
                  disabled={isLoading}
                >
                  {test.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Result */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              testResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              Test Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className={`font-medium ${
                testResult.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResult.message}
              </p>
              
              {testResult.details && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    View Details
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
          <CardDescription>
            Verify your environment variables are set correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>RESEND_API_KEY:</span>
              <span className={process.env.NEXT_PUBLIC_RESEND_API_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_RESEND_API_KEY ? '✅ Set' : '❌ Not Set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>RESEND_FROM_EMAIL:</span>
              <span className={process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL ? '✅ Set' : '❌ Not Set'}
              </span>
            </div>
            <p className="text-muted-foreground mt-2">
              Note: These environment variables are server-side only and won't show in the browser.
              Check your Render dashboard environment variables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
