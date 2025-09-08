'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  MapPin, 
  Building2, 
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
// Temporary enum definitions until Prisma client is regenerated
enum IdType {
  ID = 'ID',
  PASSPORT = 'PASSPORT',
}

enum EmploymentStatus {
  EMPLOYED = 'EMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  STUDENT = 'STUDENT',
  RETIRED = 'RETIRED',
  PENSIONER = 'PENSIONER',
}

export default function ProfilePage() {
  const { user } = useUser();
  const { data: profile, refetch } = api.user.getProfile.useQuery();
  const updateProfile = api.user.updateProfile.useMutation();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    idNumber: '',
    idType: IdType.ID,
    country: '',
    
    // Contact Details
    phone: '',
    workPhone: '',
    email: '',
    
    // Address
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Employment
    employmentStatus: EmploymentStatus.EMPLOYED,
    employer: '',
    jobTitle: '',
    workAddress: '',
    
    // Income
    monthlyIncome: '',
    incomeSource: '',
  });

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        idNumber: profile.idNumber || '',
        idType: profile.idType || IdType.ID,
        country: profile.country || '',
        phone: profile.phone || '',
        workPhone: profile.workPhone || '',
        email: profile.email || '',
        streetAddress: profile.streetAddress || '',
        city: profile.city || '',
        province: profile.province || '',
        postalCode: profile.postalCode || '',
        employmentStatus: profile.employmentStatus || EmploymentStatus.EMPLOYED,
        employer: profile.employer || '',
        jobTitle: profile.jobTitle || '',
        workAddress: profile.workAddress || '',
        monthlyIncome: profile.monthlyIncome?.toString() || '',
        incomeSource: profile.incomeSource || '',
      });
    }
  }, [profile]);

  const handleSave = async (tabData: Record<string, any>) => {
    try {
      const dataToUpdate: Record<string, any> = {};
      
      // Convert date string to Date object if needed
      if (tabData.dateOfBirth) {
        dataToUpdate.dateOfBirth = new Date(tabData.dateOfBirth);
      }
      
      // Convert monthly income to number if provided
      if (tabData.monthlyIncome) {
        dataToUpdate.monthlyIncome = parseFloat(tabData.monthlyIncome);
      }
      
      // Add other fields
      Object.keys(tabData).forEach(key => {
        if (key !== 'dateOfBirth' && key !== 'monthlyIncome' && tabData[key] !== '') {
          dataToUpdate[key] = tabData[key];
        }
      });
      
      await updateProfile.mutateAsync(dataToUpdate);
      await refetch();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getVerificationStatus = () => {
    const verified = [
      profile?.emailVerified,
      profile?.phoneVerified,
      profile?.idVerified,
    ].filter(Boolean).length;
    
    return {
      verified,
      total: 3,
      percentage: Math.round((verified / 3) * 100)
    };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                  <TabsList className="grid h-auto w-full grid-cols-1 bg-transparent p-1">
                    <TabsTrigger 
                      value="personal" 
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Personal Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="address" 
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Address
                    </TabsTrigger>
                    <TabsTrigger 
                      value="employment" 
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Employment
                    </TabsTrigger>
                    <TabsTrigger 
                      value="income" 
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Income Details
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Verification Status Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Account Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{verificationStatus.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${verificationStatus.percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    {profile?.emailVerified ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                    )}
                    <span>Email Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {profile?.phoneVerified ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                    )}
                    <span>Phone Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {profile?.idVerified ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                    )}
                    <span>ID Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="personal">
                <PersonalDetailsTab 
                  profile={profile} 
                  formData={formData} 
                  setFormData={setFormData}
                  onSave={handleSave}
                  isLoading={updateProfile.isPending}
                />
              </TabsContent>
              
              <TabsContent value="contact">
                <ContactDetailsTab 
                  profile={profile} 
                  formData={formData} 
                  setFormData={setFormData}
                  onSave={handleSave}
                  isLoading={updateProfile.isPending}
                />
              </TabsContent>
              
              <TabsContent value="address">
                <AddressTab 
                  profile={profile} 
                  formData={formData} 
                  setFormData={setFormData}
                  onSave={handleSave}
                  isLoading={updateProfile.isPending}
                />
              </TabsContent>
              
              <TabsContent value="employment">
                <EmploymentTab 
                  profile={profile} 
                  formData={formData} 
                  setFormData={setFormData}
                  onSave={handleSave}
                  isLoading={updateProfile.isPending}
                />
              </TabsContent>
              
              <TabsContent value="income">
                <IncomeTab 
                  profile={profile} 
                  formData={formData} 
                  setFormData={setFormData}
                  onSave={handleSave}
                  isLoading={updateProfile.isPending}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Tab Components
interface TabProps {
  profile: any;
  formData: any;
  setFormData: any;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

function PersonalDetailsTab({ profile, formData, setFormData, onSave, isLoading }: TabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    const personalData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      idNumber: formData.idNumber,
      idType: formData.idType,
      country: formData.country,
    };
    await onSave(personalData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>
          Your basic personal information and identification details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idType">ID Type</Label>
                <Select 
                  value={formData.idType} 
                  onValueChange={(value) => setFormData({ ...formData, idType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={IdType.ID}>South African ID</SelectItem>
                    <SelectItem value={IdType.PASSPORT}>Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idNumber">ID/Passport Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="Enter your ID or passport number"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="South Africa"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">First Name</Label>
                <p className="font-medium">{profile?.firstName || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Name</Label>
                <p className="font-medium">{profile?.lastName || 'Not set'}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Date of Birth</Label>
              <p className="font-medium">
                {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">ID Type</Label>
                <p className="font-medium">{profile?.idType || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">ID/Passport Number</Label>
                <p className="font-medium">{profile?.idNumber || 'Not set'}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Country</Label>
              <p className="font-medium">{profile?.country || 'Not set'}</p>
            </div>

            <Button onClick={() => setIsEditing(true)} className="mt-6">
              Edit Personal Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactDetailsTab({ profile, formData, setFormData, onSave, isLoading }: TabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    const contactData = {
      phone: formData.phone,
      workPhone: formData.workPhone,
    };
    await onSave(contactData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
        <CardDescription>
          Manage your contact information and communication preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
              />
            </div>
            
            <div>
              <Label htmlFor="workPhone">Work Number (Optional)</Label>
              <Input
                id="workPhone"
                type="tel"
                value={formData.workPhone}
                onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">Email Address</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{profile?.email}</p>
                  {profile?.emailVerified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">Mobile Number</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{profile?.phone || 'Not set'}</p>
                  {profile?.phoneVerified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Work Number</Label>
              <p className="font-medium">{profile?.workPhone || 'Not set'}</p>
            </div>

            <Button onClick={() => setIsEditing(true)} className="mt-6">
              Edit Contact Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddressTab({ profile, formData, setFormData, onSave, isLoading }: TabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    const addressData = {
      streetAddress: formData.streetAddress,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
    };
    await onSave(addressData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residential Address</CardTitle>
        <CardDescription>
          Your current residential address information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cape Town"
                />
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <Select 
                  value={formData.province} 
                  onValueChange={(value) => setFormData({ ...formData, province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Western Cape">Western Cape</SelectItem>
                    <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                    <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                    <SelectItem value="Free State">Free State</SelectItem>
                    <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="North West">North West</SelectItem>
                    <SelectItem value="Gauteng">Gauteng</SelectItem>
                    <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="Limpopo">Limpopo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="8001"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Street Address</Label>
              <p className="font-medium">{profile?.streetAddress || 'Not set'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">City</Label>
                <p className="font-medium">{profile?.city || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Province</Label>
                <p className="font-medium">{profile?.province || 'Not set'}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Postal Code</Label>
              <p className="font-medium">{profile?.postalCode || 'Not set'}</p>
            </div>

            <Button onClick={() => setIsEditing(true)} className="mt-6">
              Edit Address
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmploymentTab({ profile, formData, setFormData, onSave, isLoading }: TabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    const employmentData = {
      employmentStatus: formData.employmentStatus,
      employer: formData.employer,
      jobTitle: formData.jobTitle,
      workAddress: formData.workAddress,
    };
    await onSave(employmentData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Details</CardTitle>
        <CardDescription>
          Information about your current employment status and workplace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select 
                value={formData.employmentStatus} 
                onValueChange={(value) => setFormData({ ...formData, employmentStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmploymentStatus.EMPLOYED}>Employed</SelectItem>
                  <SelectItem value={EmploymentStatus.SELF_EMPLOYED}>Self Employed</SelectItem>
                  <SelectItem value={EmploymentStatus.UNEMPLOYED}>Unemployed</SelectItem>
                  <SelectItem value={EmploymentStatus.STUDENT}>Student</SelectItem>
                  <SelectItem value={EmploymentStatus.RETIRED}>Retired</SelectItem>
                  <SelectItem value={EmploymentStatus.PENSIONER}>Pensioner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="employer">Employer</Label>
              <Input
                id="employer"
                value={formData.employer}
                onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                placeholder="Company name"
              />
            </div>
            
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Your position"
              />
            </div>
            
            <div>
              <Label htmlFor="workAddress">Work Address</Label>
              <Textarea
                id="workAddress"
                value={formData.workAddress}
                onChange={(e) => setFormData({ ...formData, workAddress: e.target.value })}
                placeholder="Workplace address"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Employment Status</Label>
              <p className="font-medium">{profile?.employmentStatus || 'Not set'}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Employer</Label>
              <p className="font-medium">{profile?.employer || 'Not set'}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Job Title</Label>
              <p className="font-medium">{profile?.jobTitle || 'Not set'}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Work Address</Label>
              <p className="font-medium">{profile?.workAddress || 'Not set'}</p>
            </div>

            <Button onClick={() => setIsEditing(true)} className="mt-6">
              Edit Employment Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeTab({ profile, formData, setFormData, onSave, isLoading }: TabProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    const incomeData = {
      monthlyIncome: formData.monthlyIncome,
      incomeSource: formData.incomeSource,
    };
    await onSave(incomeData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Details</CardTitle>
        <CardDescription>
          Information about your income for insurance assessment purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (ZAR)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                placeholder="15000"
              />
              <p className="text-sm text-muted-foreground">
                Your gross monthly income before deductions
              </p>
            </div>
            
            <div>
              <Label htmlFor="incomeSource">Primary Income Source</Label>
              <Input
                id="incomeSource"
                value={formData.incomeSource}
                onChange={(e) => setFormData({ ...formData, incomeSource: e.target.value })}
                placeholder="e.g., Salary, Business, Investments"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Monthly Income</Label>
              <p className="font-medium">
                {profile?.monthlyIncome 
                  ? `R ${profile.monthlyIncome.toLocaleString()}` 
                  : 'Not set'
                }
              </p>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Primary Income Source</Label>
              <p className="font-medium">{profile?.incomeSource || 'Not set'}</p>
            </div>

            <Button onClick={() => setIsEditing(true)} className="mt-6">
              Edit Income Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}