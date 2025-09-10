'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Info,
  AlertCircle
} from 'lucide-react';
import { TemplateCategory } from '@prisma/client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/trpc/react';

const TEMPLATE_VARIABLES = {
  GENERAL: ['userName', 'userEmail', 'currentDate'],
  CLAIMS: ['claimNumber', 'policyNumber', 'policyholderName', 'claimType', 'incidentDate', 'estimatedAmount', 'status'],
  PAYMENTS: ['policyNumber', 'policyholderName', 'amount', 'dueDate', 'paymentMethod', 'transactionId'],
  POLICIES: ['policyNumber', 'policyholderName', 'coverageAmount', 'effectiveDate', 'premiumAmount', 'expiryDate'],
  INVITATIONS: ['inviteeEmail', 'inviterName', 'role', 'department', 'acceptUrl', 'expiresAt', 'message'],
  WELCOME: ['userName', 'userEmail', 'accountType', 'loginUrl']
};

function NewTemplatePageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    category: 'GENERAL' as TemplateCategory,
    variables: [] as string[],
    isActive: true,
  });

  const [newVariable, setNewVariable] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTemplate = api.emailTemplate.create.useMutation({
    onSuccess: (template) => {
      router.push(`/admin/email-templates/${template.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable]
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const addSuggestedVariable = (variable: string) => {
    if (!formData.variables.includes(variable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable]
      }));
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('htmlContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}{{${variable}}}${after}`;

      setFormData(prev => ({ ...prev, htmlContent: newText }));

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + `{{${variable}}}`.length, start + `{{${variable}}}`.length);
      }, 0);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    if (!formData.title.trim()) newErrors.title = 'Template title is required';
    if (!formData.subject.trim()) newErrors.subject = 'Email subject is required';
    if (!formData.htmlContent.trim()) newErrors.htmlContent = 'HTML content is required';

    // Validate variable usage in content
    const usedVariables = (formData.htmlContent.match(/\{\{(\w+)\}\}/g) || [])
      .map(match => match.replace(/\{\{|\}\}/g, ''));

    const unusedVariables = formData.variables.filter(v => !usedVariables.includes(v));
    if (unusedVariables.length > 0) {
      newErrors.variables = `These variables are defined but not used: ${unusedVariables.join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createTemplate.mutate(formData);
    }
  };

  const getPreviewContent = () => {
    let content = formData.htmlContent;
    formData.variables.forEach(variable => {
      const sampleValues: Record<string, string> = {
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        claimNumber: 'CLM-2024-001',
        policyNumber: 'POL-HOME-2024-001',
        policyholderName: 'John Doe',
        claimType: 'Fire Damage',
        incidentDate: '2024-01-15',
        estimatedAmount: '50,000',
        status: 'Under Review',
        amount: '2,500',
        dueDate: '2024-02-01',
        paymentMethod: 'Credit Card',
        transactionId: 'TXN-2024-001',
        coverageAmount: '500,000',
        effectiveDate: '2024-01-01',
        premiumAmount: '2,500',
        expiryDate: '2025-01-01',
        inviteeEmail: 'jane.smith@example.com',
        inviterName: 'Admin User',
        role: 'Agent',
        department: 'Sales',
        acceptUrl: 'https://example.com/accept/abc123',
        expiresAt: '2024-01-30',
        message: 'Welcome to our team!',
        accountType: 'Customer',
        loginUrl: 'https://example.com/login',
        currentDate: new Date().toLocaleDateString()
      };
      content = content.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), sampleValues[variable] || `[${variable}]`);
    });
    return content;
  };

  const suggestedVariables = TEMPLATE_VARIABLES[formData.category] || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/email-templates" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Email Template</h1>
            <p className="text-muted-foreground">
              Design a new email template with variable substitution
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                  <CardDescription>
                    Basic details for your email template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., claim_submitted"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: TemplateCategory) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="CLAIMS">Claims</SelectItem>
                          <SelectItem value="PAYMENTS">Payments</SelectItem>
                          <SelectItem value="POLICIES">Policies</SelectItem>
                          <SelectItem value="INVITATIONS">Invitations</SelectItem>
                          <SelectItem value="WELCOME">Welcome</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Display Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Claim Submission Confirmation"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="e.g., Your claim {{claimNumber}} has been submitted"
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Template is active</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Variables */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Variables</CardTitle>
                  <CardDescription>
                    Define variables that will be replaced with actual data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      placeholder="Enter variable name"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                    />
                    <Button type="button" onClick={addVariable} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {suggestedVariables.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Suggested Variables:</Label>
                      <div className="flex flex-wrap gap-2">
                        {suggestedVariables.map(variable => (
                          <Button
                            key={variable}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSuggestedVariable(variable)}
                            disabled={formData.variables.includes(variable)}
                          >
                            {variable}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.variables.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Defined Variables:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.variables.map(variable => (
                          <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                            {variable}
                            <button
                              type="button"
                              onClick={() => removeVariable(variable)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.variables && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.variables}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                  <CardDescription>
                    Design your email template with HTML
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.variables.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Insert Variables:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.variables.map(variable => (
                          <Button
                            key={variable}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(variable)}
                          >
                            {`{{${variable}}}`}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!previewMode ? (
                    <div className="space-y-2">
                      <Label htmlFor="htmlContent">HTML Content *</Label>
                      <Textarea
                        id="htmlContent"
                        value={formData.htmlContent}
                        onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                        placeholder="<div><h1>Hello {{userName}}!</h1></div>"
                        rows={20}
                        className={`font-mono text-sm ${errors.htmlContent ? 'border-red-500' : ''}`}
                      />
                      {errors.htmlContent && <p className="text-sm text-red-500">{errors.htmlContent}</p>}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="border rounded-lg p-4 bg-white">
                        <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="textContent">Plain Text Version (Optional)</Label>
                    <Textarea
                      id="textContent"
                      value={formData.textContent}
                      onChange={(e) => handleInputChange('textContent', e.target.value)}
                      placeholder="Plain text version for email clients that don't support HTML"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Help & Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Template Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Variables:</strong> Use double curly braces like <code>{`{{userName}}`}</code>
                  </div>
                  <div>
                    <strong>HTML:</strong> Full HTML support with inline styles
                  </div>
                  <div>
                    <strong>Responsive:</strong> Design for mobile email clients
                  </div>
                  <div>
                    <strong>Testing:</strong> Preview your template before saving
                  </div>
                </CardContent>
              </Card>

              {/* Variable Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>Variable Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>{`{{userName}}`}</strong> - User's full name</div>
                  <div><strong>{`{{userEmail}}`}</strong> - User's email address</div>
                  <div><strong>{`{{currentDate}}`}</strong> - Today's date</div>
                  <div><strong>{`{{claimNumber}}`}</strong> - Claim reference number</div>
                  <div><strong>{`{{policyNumber}}`}</strong> - Policy reference number</div>
                  <div><strong>{`{{amount}}`}</strong> - Monetary amount</div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createTemplate.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                  </Button>

                  {errors.submit && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewTemplatePage() {
  return <NewTemplatePageContent />;
}
