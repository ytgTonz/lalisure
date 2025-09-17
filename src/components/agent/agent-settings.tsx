'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useStaffUser } from '@/hooks/use-staff-user';
import { agentSettingsSchema, type AgentSettings } from '@/lib/validations/agent';
import { api } from '@/trpc/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Bell, 
  Globe, 
  Save,
  Edit,
  Check,
  X,
  Building2,
  CreditCard,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface AgentSettingsProps {
  className?: string;
}

export function AgentSettings({ className }: AgentSettingsProps) {
  const { data: user, isLoading } = useStaffUser();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch agent settings
  const { data: settings, isLoading: settingsLoading, refetch } = api.agentSettings.getSettings.useQuery();
  
  // Update settings mutation
  const updateSettingsMutation = api.agentSettings.updateSettings.useMutation({
    onSuccess: () => {
      toast.success('Settings updated successfully');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const form = useForm<AgentSettings>({
    resolver: zodResolver(agentSettingsSchema),
    defaultValues: {
      firstName: settings?.firstName || '',
      lastName: settings?.lastName || '',
      email: settings?.email || '',
      phone: settings?.phone || '',
      agentCode: settings?.agentCode || '',
      licenseNumber: settings?.licenseNumber || '',
      commissionRate: settings?.commissionRate || 0,
      address: {
        street: settings?.address?.street || '',
        city: settings?.address?.city || '',
        province: settings?.address?.province || '',
        postalCode: settings?.address?.postalCode || '',
        country: settings?.address?.country || 'South Africa',
      },
      preferences: {
        emailNotifications: settings?.preferences?.emailNotifications ?? true,
        smsNotifications: settings?.preferences?.smsNotifications ?? true,
        weeklyReports: settings?.preferences?.weeklyReports ?? true,
        autoFollowUp: settings?.preferences?.autoFollowUp ?? false,
        timezone: settings?.preferences?.timezone || 'Africa/Johannesburg',
        language: settings?.preferences?.language || 'en',
      },
      workingHours: {
        monday: { enabled: true, start: '08:00', end: '17:00' },
        tuesday: { enabled: true, start: '08:00', end: '17:00' },
        wednesday: { enabled: true, start: '08:00', end: '17:00' },
        thursday: { enabled: true, start: '08:00', end: '17:00' },
        friday: { enabled: true, start: '08:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '13:00' },
        sunday: { enabled: false, start: '09:00', end: '13:00' },
      },
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        firstName: settings.firstName || '',
        lastName: settings.lastName || '',
        email: settings.email || '',
        phone: settings.phone || '',
        agentCode: settings.agentCode || '',
        licenseNumber: settings.licenseNumber || '',
        commissionRate: settings.commissionRate || 0,
        address: {
          street: settings.address?.street || '',
          city: settings.address?.city || '',
          province: settings.address?.province || '',
          postalCode: settings.address?.postalCode || '',
          country: settings.address?.country || 'South Africa',
        },
        preferences: {
          emailNotifications: settings.preferences?.emailNotifications ?? true,
          smsNotifications: settings.preferences?.smsNotifications ?? true,
          weeklyReports: settings.preferences?.weeklyReports ?? true,
          autoFollowUp: settings.preferences?.autoFollowUp ?? false,
          timezone: settings.preferences?.timezone || 'Africa/Johannesburg',
          language: settings.preferences?.language || 'en',
        },
        workingHours: settings.workingHours || {
          monday: { enabled: true, start: '08:00', end: '17:00' },
          tuesday: { enabled: true, start: '08:00', end: '17:00' },
          wednesday: { enabled: true, start: '08:00', end: '17:00' },
          thursday: { enabled: true, start: '08:00', end: '17:00' },
          friday: { enabled: true, start: '08:00', end: '17:00' },
          saturday: { enabled: false, start: '09:00', end: '13:00' },
          sunday: { enabled: false, start: '09:00', end: '13:00' },
        },
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: AgentSettings) => {
    updateSettingsMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const timezones = [
    { value: 'Africa/Johannesburg', label: 'South Africa Standard Time' },
    { value: 'Africa/Cape_Town', label: 'Cape Town Time' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'af', label: 'Afrikaans' },
    { value: 'zu', label: 'Zulu' },
    { value: 'xh', label: 'Xhosa' },
  ];

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  if (isLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Agent Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile information and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Professional
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Your basic personal details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      {...form.register('address.street')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.address?.street && (
                      <p className="text-sm text-red-600">{form.formState.errors.address.street.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...form.register('address.city')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                      {form.formState.errors.address?.city && (
                        <p className="text-sm text-red-600">{form.formState.errors.address.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Select
                        value={form.watch('address.province')}
                        onValueChange={(value) => form.setValue('address.province', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.address?.province && (
                        <p className="text-sm text-red-600">{form.formState.errors.address.province.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        {...form.register('address.postalCode')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                      {form.formState.errors.address?.postalCode && (
                        <p className="text-sm text-red-600">{form.formState.errors.address.postalCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>Your professional credentials and business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentCode">Agent Code</Label>
                    <Input
                      id="agentCode"
                      {...form.register('agentCode')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.agentCode && (
                      <p className="text-sm text-red-600">{form.formState.errors.agentCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      {...form.register('licenseNumber')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.licenseNumber && (
                      <p className="text-sm text-red-600">{form.formState.errors.licenseNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionRate" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Commission Rate (%)
                  </Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...form.register('commissionRate', { valueAsNumber: true })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {form.formState.errors.commissionRate && (
                    <p className="text-sm text-red-600">{form.formState.errors.commissionRate.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important updates via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={form.watch('preferences.emailNotifications')}
                      onCheckedChange={(checked) => form.setValue('preferences.emailNotifications', checked)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive urgent updates via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={form.watch('preferences.smsNotifications')}
                      onCheckedChange={(checked) => form.setValue('preferences.smsNotifications', checked)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weeklyReports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly performance summaries
                      </p>
                    </div>
                    <Switch
                      id="weeklyReports"
                      checked={form.watch('preferences.weeklyReports')}
                      onCheckedChange={(checked) => form.setValue('preferences.weeklyReports', checked)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoFollowUp">Auto Follow-up</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically schedule follow-up reminders
                      </p>
                    </div>
                    <Switch
                      id="autoFollowUp"
                      checked={form.watch('preferences.autoFollowUp')}
                      onCheckedChange={(checked) => form.setValue('preferences.autoFollowUp', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timezone
                    </Label>
                    <Select
                      value={form.watch('preferences.timezone')}
                      onValueChange={(value) => form.setValue('preferences.timezone', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Language
                    </Label>
                    <Select
                      value={form.watch('preferences.language')}
                      onValueChange={(value) => form.setValue('preferences.language', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Hours
                </CardTitle>
                <CardDescription>Set your availability for each day of the week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {days.map((day) => (
                  <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <Label className="font-medium">{day.label}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={form.watch(`workingHours.${day.key}.enabled`)}
                        onCheckedChange={(checked) => form.setValue(`workingHours.${day.key}.enabled`, checked)}
                        disabled={!isEditing}
                      />
                      <span className="text-sm text-muted-foreground">
                        {form.watch(`workingHours.${day.key}.enabled`) ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    {form.watch(`workingHours.${day.key}.enabled`) && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Input
                          type="time"
                          value={form.watch(`workingHours.${day.key}.start`)}
                          onChange={(e) => form.setValue(`workingHours.${day.key}.start`, e.target.value)}
                          disabled={!isEditing}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={form.watch(`workingHours.${day.key}.end`)}
                          onChange={(e) => form.setValue(`workingHours.${day.key}.end`, e.target.value)}
                          disabled={!isEditing}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                disabled={updateSettingsMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
                disabled={updateSettingsMutation.isPending}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Tabs>
    </div>
  );
}
