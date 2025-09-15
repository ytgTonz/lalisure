'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Mail,
  FileText,
  DollarSign,
  Shield,
  Users,
  CheckCircle,
  AlertTriangle,
  Copy,
  Trash2
} from 'lucide-react';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/trpc/react';

function TemplateDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [showPreview, setShowPreview] = useState(false);

  const { data: template, isLoading, error } = api.emailTemplate.getById.useQuery(
    { id: templateId },
    { enabled: !!templateId }
  );

  const toggleActive = api.emailTemplate.toggleActive.useMutation({
    onSuccess: () => {
      // Refresh the template data
      window.location.reload();
    },
  });

  const deleteTemplate = api.emailTemplate.delete.useMutation({
    onSuccess: () => {
      router.push('/admin/email-templates');
    },
  });

  if (isLoading) {
    return (
      // <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading template...</p>
          </div>
        </div>
      // </DashboardLayout>
    );
  }

  if (error || !template) {
    return (
      // <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Template Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The template you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/admin/email-templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Link>
          </Button>
        </div>
      // </DashboardLayout>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CLAIMS':
        return <FileText className="h-5 w-5" />;
      case 'PAYMENTS':
        return <DollarSign className="h-5 w-5" />;
      case 'POLICIES':
        return <Shield className="h-5 w-5" />;
      case 'INVITATIONS':
        return <Users className="h-5 w-5" />;
      case 'WELCOME':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CLAIMS':
        return 'bg-blue-100 text-blue-800';
      case 'PAYMENTS':
        return 'bg-green-100 text-green-800';
      case 'POLICIES':
        return 'bg-purple-100 text-purple-800';
      case 'INVITATIONS':
        return 'bg-orange-100 text-orange-800';
      case 'WELCOME':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPreviewContent = () => {
    if (!template) return '';

    let content = template.htmlContent;
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

    template.variables.forEach(variable => {
      content = content.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), sampleValues[variable] || `[${variable}]`);
    });

    return content;
  };

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/email-templates" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              {getCategoryIcon(template.category)}
              <div>
                <h1 className="text-2xl font-bold">{template.title}</h1>
                <p className="text-muted-foreground">{template.name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(template.category)}>
              {template.category}
            </Badge>
            <Badge variant={template.isActive ? "default" : "secondary"}>
              {template.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>

          <Button asChild variant="outline">
            <Link href={`/admin/email-templates/${template.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Template
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => toggleActive.mutate({ id: template.id })}
            disabled={toggleActive.isPending}
          >
            {template.isActive ? 'Deactivate' : 'Activate'}
          </Button>

          {!template.name.startsWith('default_') && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this template?')) {
                  deleteTemplate.mutate({ id: template.id });
                }
              }}
              disabled={deleteTemplate.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Information */}
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Template Name</Label>
                    <p className="font-mono text-sm">{template.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <p>{template.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subject Line</Label>
                    <p>{template.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <p className={template.isActive ? 'text-green-600' : 'text-red-600'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.variables.map(variable => (
                      <Badge key={variable} variant="outline">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
                <CardDescription>
                  {showPreview ? 'Live preview with sample data' : 'HTML source code'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <div className="border rounded-lg p-4 bg-white">
                    <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">HTML Content</Label>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                        {template.htmlContent}
                      </pre>
                    </div>

                    {template.textContent && (
                      <div>
                        <Label className="text-sm font-medium">Plain Text Version</Label>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                          {template.textContent}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">
                    {format(new Date(template.createdAt), 'MMM dd, yyyy hh:mm a')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {template.creator.firstName} {template.creator.lastName}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">
                    {format(new Date(template.updatedAt), 'MMM dd, yyyy hh:mm a')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {template.updater.firstName} {template.updater.lastName}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Variables:</strong> Use <code>{`{{variableName}}`}</code> to insert dynamic content
                </div>
                <div>
                  <strong>HTML:</strong> Full HTML support with inline styles for better compatibility
                </div>
                <div>
                  <strong>Preview:</strong> Use the preview mode to see how the email will look
                </div>
                <div>
                  <strong>Testing:</strong> Test templates with different email clients
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(template.subject);
                  }}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Subject
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(template.htmlContent);
                  }}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    // </DashboardLayout>
  );
}

export default function TemplateDetailPage() {
  return <TemplateDetailPageContent />;
}
