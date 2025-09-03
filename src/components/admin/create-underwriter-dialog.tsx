'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/trpc/react';
import { 
  Shield, 
  Mail, 
  Send, 
  Building, 
  AlertCircle,
  CheckCircle,
  User,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface CreateUnderwriterDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface UnderwriterFormData {
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  specializations: string[];
  yearsExperience: number;
  licenseNumber: string;
  message: string;
  sendWelcomeEmail: boolean;
}

const SPECIALIZATIONS = [
  'Home Insurance',
  'Commercial Property',
  'Auto Insurance',
  'Life Insurance',
  'Health Insurance',
  'Business Liability',
  'Marine Insurance',
  'Agricultural Insurance',
  'Professional Indemnity',
  'Travel Insurance'
];

const DEPARTMENTS = [
  'Underwriting - Personal Lines',
  'Underwriting - Commercial Lines',
  'Risk Assessment',
  'Policy Review',
  'Claims Liaison',
  'Special Risks',
  'Reinsurance'
];

export function CreateUnderwriterDialog({ trigger, onSuccess }: CreateUnderwriterDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UnderwriterFormData>({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    specializations: [],
    yearsExperience: 0,
    licenseNumber: '',
    message: '',
    sendWelcomeEmail: true,
  });

  const createInvitationMutation = api.invitation.create.useMutation({
    onSuccess: () => {
      toast.success('Underwriter invitation sent successfully!', {
        description: `${formData.firstName} ${formData.lastName} will receive an invitation at ${formData.email}`
      });
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to send invitation', {
        description: error.message
      });
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      department: '',
      specializations: [],
      yearsExperience: 0,
      licenseNumber: '',
      message: '',
      sendWelcomeEmail: true,
    });
  };

  const updateFormData = (field: keyof UnderwriterFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.firstName && formData.lastName);
      case 2:
        return !!(formData.department && formData.specializations.length > 0);
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const invitationData = {
      email: formData.email,
      role: 'UNDERWRITER' as const,
      department: `${formData.department} - ${formData.specializations.join(', ')}`,
      message: formData.message || `Welcome to our underwriting team, ${formData.firstName}! We're excited to have you join us with your expertise in ${formData.specializations.join(' and ')}.`
    };

    createInvitationMutation.mutate(invitationData);
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (step === currentStep) return <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">{step}</div>;
    return <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold">{step}</div>;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <p className="text-sm text-muted-foreground">Enter the underwriter&apos;s personal details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="John"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Smith"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john.smith@example.com"
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                The invitation will be sent to this email address
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building className="h-12 w-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold">Professional Details</h3>
              <p className="text-sm text-muted-foreground">Define the underwriter&apos;s role and expertise</p>
            </div>
            
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Specializations * (Select at least one)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {SPECIALIZATIONS.map(spec => (
                  <div key={spec} className="flex items-center space-x-2">
                    <Checkbox
                      id={spec}
                      checked={formData.specializations.includes(spec)}
                      onCheckedChange={() => toggleSpecialization(spec)}
                    />
                    <Label htmlFor={spec} className="text-sm cursor-pointer">{spec}</Label>
                  </div>
                ))}
              </div>
              {formData.specializations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.specializations.map(spec => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold">Experience & Credentials</h3>
              <p className="text-sm text-muted-foreground">Optional professional information</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsExperience || ''}
                  onChange={(e) => updateFormData('yearsExperience', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  value={formData.licenseNumber}
                  onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                  placeholder="UW-2024-001"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Welcome Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                placeholder="Personalized welcome message for the new underwriter..."
                rows={4}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This message will be included in the invitation email
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="welcomeEmail"
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) => updateFormData('sendWelcomeEmail', checked)}
              />
              <Label htmlFor="welcomeEmail" className="text-sm">
                Send welcome email with onboarding materials
              </Label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <h3 className="text-lg font-semibold">Review & Send</h3>
              <p className="text-sm text-muted-foreground">Confirm the details before sending the invitation</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Underwriter Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {formData.email}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {formData.department}
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span> {formData.yearsExperience} years
                  </div>
                </div>
                
                {formData.specializations.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Specializations:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.specializations.map(spec => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.licenseNumber && (
                  <div className="text-sm">
                    <span className="font-medium">License:</span> {formData.licenseNumber}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">What happens next?</p>
                  <ul className="text-blue-800 mt-1 space-y-1">
                    <li>• An invitation email will be sent to {formData.email}</li>
                    <li>• The invitation will expire in 7 days</li>
                    <li>• The underwriter can accept and set up their account</li>
                    {formData.sendWelcomeEmail && <li>• Welcome materials will be included</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Add Underwriter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Create New Underwriter
          </DialogTitle>
          <DialogDescription>
            Guide a new underwriter through the invitation process
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-between items-center py-4">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                {getStepIcon(step)}
                <span className="text-xs mt-1 font-medium">
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Professional'}
                  {step === 3 && 'Experience'}
                  {step === 4 && 'Review'}
                </span>
              </div>
              {index < 3 && (
                <div className={`h-0.5 w-16 mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button 
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={createInvitationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {createInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}