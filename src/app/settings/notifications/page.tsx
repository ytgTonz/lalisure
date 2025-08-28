'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Toast } from '@/components/ui/toast';
import { Mail, MessageSquare, Smartphone } from 'lucide-react';

const notificationPreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    policyUpdates: z.boolean(),
    claimUpdates: z.boolean(),
    paymentReminders: z.boolean(),
    paymentConfirmations: z.boolean(),
    marketingEmails: z.boolean(),
  }),
  sms: z.object({
    enabled: z.boolean(),
    urgentClaimUpdates: z.boolean(),
    paymentReminders: z.boolean(),
    policyExpirations: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    policyUpdates: z.boolean(),
    claimUpdates: z.boolean(),
    paymentReminders: z.boolean(),
  }),
});

type NotificationPreferencesForm = z.infer<typeof notificationPreferencesSchema>;

export default function NotificationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Get current preferences
  const { data: preferences, isLoading } = trpc.notification.getPreferences.useQuery();
  
  // Update mutation
  const updatePreferences = trpc.notification.updatePreferences.useMutation({
    onSuccess: () => {
      setShowToast({ message: 'Notification preferences updated successfully', type: 'success' });
      setIsSaving(false);
    },
    onError: (error) => {
      setShowToast({ message: error.message, type: 'error' });
      setIsSaving(false);
    },
  });

  // Test notification mutation
  const sendTestNotification = trpc.notification.sendTestNotification.useMutation({
    onSuccess: () => {
      setShowToast({ message: 'Test notification sent!', type: 'success' });
    },
    onError: (error) => {
      setShowToast({ message: error.message, type: 'error' });
    },
  });

  const form = useForm<NotificationPreferencesForm>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: preferences || {
      email: {
        enabled: true,
        policyUpdates: true,
        claimUpdates: true,
        paymentReminders: true,
        paymentConfirmations: true,
        marketingEmails: false,
      },
      sms: {
        enabled: false,
        urgentClaimUpdates: false,
        paymentReminders: false,
        policyExpirations: false,
      },
      push: {
        enabled: true,
        policyUpdates: true,
        claimUpdates: true,
        paymentReminders: true,
      },
    },
  });

  // Update form when preferences load
  if (preferences && !form.formState.isDirty) {
    form.reset(preferences);
  }

  const onSubmit = async (data: NotificationPreferencesForm) => {
    setIsSaving(true);
    updatePreferences.mutate(data);
  };

  const handleTestNotification = (type: 'email' | 'sms' | 'both') => {
    sendTestNotification.mutate({ type, message: 'This is a test notification from your home insurance platform.' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage how you want to receive notifications about your home insurance policies and claims.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>
                Receive important updates and information via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-enabled"
                  checked={form.watch('email.enabled')}
                  onCheckedChange={(checked) => form.setValue('email.enabled', !!checked)}
                />
                <Label htmlFor="email-enabled" className="font-medium">
                  Enable email notifications
                </Label>
              </div>

              <Separator />

              <div className="space-y-3 pl-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-policy-updates"
                    checked={form.watch('email.policyUpdates')}
                    onCheckedChange={(checked) => form.setValue('email.policyUpdates', !!checked)}
                    disabled={!form.watch('email.enabled')}
                  />
                  <Label htmlFor="email-policy-updates">Policy updates and renewals</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-claim-updates"
                    checked={form.watch('email.claimUpdates')}
                    onCheckedChange={(checked) => form.setValue('email.claimUpdates', !!checked)}
                    disabled={!form.watch('email.enabled')}
                  />
                  <Label htmlFor="email-claim-updates">Claim status updates</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-payment-reminders"
                    checked={form.watch('email.paymentReminders')}
                    onCheckedChange={(checked) => form.setValue('email.paymentReminders', !!checked)}
                    disabled={!form.watch('email.enabled')}
                  />
                  <Label htmlFor="email-payment-reminders">Payment reminders</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-payment-confirmations"
                    checked={form.watch('email.paymentConfirmations')}
                    onCheckedChange={(checked) => form.setValue('email.paymentConfirmations', !!checked)}
                    disabled={!form.watch('email.enabled')}
                  />
                  <Label htmlFor="email-payment-confirmations">Payment confirmations</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-marketing"
                    checked={form.watch('email.marketingEmails')}
                    onCheckedChange={(checked) => form.setValue('email.marketingEmails', !!checked)}
                    disabled={!form.watch('email.enabled')}
                  />
                  <Label htmlFor="email-marketing">Marketing and promotional emails</Label>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification('email')}
                  disabled={!form.watch('email.enabled')}
                >
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <CardTitle>SMS Notifications</CardTitle>
              </div>
              <CardDescription>
                Receive urgent notifications via text message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms-enabled"
                  checked={form.watch('sms.enabled')}
                  onCheckedChange={(checked) => form.setValue('sms.enabled', !!checked)}
                />
                <Label htmlFor="sms-enabled" className="font-medium">
                  Enable SMS notifications
                </Label>
              </div>

              <Separator />

              <div className="space-y-3 pl-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-urgent-claims"
                    checked={form.watch('sms.urgentClaimUpdates')}
                    onCheckedChange={(checked) => form.setValue('sms.urgentClaimUpdates', !!checked)}
                    disabled={!form.watch('sms.enabled')}
                  />
                  <Label htmlFor="sms-urgent-claims">Urgent claim updates</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-payment-reminders"
                    checked={form.watch('sms.paymentReminders')}
                    onCheckedChange={(checked) => form.setValue('sms.paymentReminders', !!checked)}
                    disabled={!form.watch('sms.enabled')}
                  />
                  <Label htmlFor="sms-payment-reminders">Payment reminders</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-policy-expirations"
                    checked={form.watch('sms.policyExpirations')}
                    onCheckedChange={(checked) => form.setValue('sms.policyExpirations', !!checked)}
                    disabled={!form.watch('sms.enabled')}
                  />
                  <Label htmlFor="sms-policy-expirations">Policy expirations</Label>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification('sms')}
                  disabled={!form.watch('sms.enabled')}
                >
                  Send Test SMS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>In-App Notifications</CardTitle>
              </div>
              <CardDescription>
                Receive notifications within the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push-enabled"
                  checked={form.watch('push.enabled')}
                  onCheckedChange={(checked) => form.setValue('push.enabled', !!checked)}
                />
                <Label htmlFor="push-enabled" className="font-medium">
                  Enable in-app notifications
                </Label>
              </div>

              <Separator />

              <div className="space-y-3 pl-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="push-policy-updates"
                    checked={form.watch('push.policyUpdates')}
                    onCheckedChange={(checked) => form.setValue('push.policyUpdates', !!checked)}
                    disabled={!form.watch('push.enabled')}
                  />
                  <Label htmlFor="push-policy-updates">Policy updates and renewals</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="push-claim-updates"
                    checked={form.watch('push.claimUpdates')}
                    onCheckedChange={(checked) => form.setValue('push.claimUpdates', !!checked)}
                    disabled={!form.watch('push.enabled')}
                  />
                  <Label htmlFor="push-claim-updates">Claim status updates</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="push-payment-reminders"
                    checked={form.watch('push.paymentReminders')}
                    onCheckedChange={(checked) => form.setValue('push.paymentReminders', !!checked)}
                    disabled={!form.watch('push.enabled')}
                  />
                  <Label htmlFor="push-payment-reminders">Payment reminders</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !form.formState.isDirty}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>

        {/* Toast messages */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`p-4 rounded-md ${showToast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {showToast.message}
              <button
                onClick={() => setShowToast(null)}
                className="ml-2 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}