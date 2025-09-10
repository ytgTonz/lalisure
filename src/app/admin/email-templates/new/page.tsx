'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Info,
  AlertCircle,
  Palette,
  Code,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { TemplateCategory } from '@prisma/client';
import EmailEditor from 'react-email-editor';

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
  const emailEditorRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    designJson: null as any,
    category: 'GENERAL' as TemplateCategory,
    variables: [] as string[],
    isActive: true,
  });

  const [newVariable, setNewVariable] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'html' | 'preview'>('html');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorWindow, setEditorWindow] = useState<Window | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Listen for messages from the Unlayer editor window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UNLAYER_DESIGN_SAVED') {
        const { design, html } = event.data.design;
        setFormData(prev => ({
          ...prev,
          designJson: design,
          htmlContent: html
        }));
        // Switch to preview mode to show the updated template
        setEditorMode('preview');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
      const updatedVariables = [...formData.variables, newVariable];
      setFormData(prev => ({
        ...prev,
        variables: updatedVariables
      }));
      setNewVariable('');
      // Update editor window if it's open
      updateEditorVariables(updatedVariables);
    }
  };

  const removeVariable = (variable: string) => {
    const updatedVariables = formData.variables.filter(v => v !== variable);
    setFormData(prev => ({
      ...prev,
      variables: updatedVariables
    }));
    // Update editor window if it's open
    updateEditorVariables(updatedVariables);
  };

  const updateEditorVariables = (variables: string[]) => {
    if (editorWindow && !editorWindow.closed) {
      editorWindow.postMessage({
        type: 'UPDATE_VARIABLES',
        variables
      }, '*');
    }
  };

  const addSuggestedVariable = (variable: string) => {
    if (!formData.variables.includes(variable)) {
      const updatedVariables = [...formData.variables, variable];
      setFormData(prev => ({
        ...prev,
        variables: updatedVariables
      }));
      // Update editor window if it's open
      updateEditorVariables(updatedVariables);
    }
  };

  const insertVariable = (variable: string) => {
    if (editorMode === 'visual' && emailEditorRef.current) {
      // Insert merge tag in visual editor
      emailEditorRef.current.editor.registerCallback('select', () => {
        emailEditorRef.current.editor.insertContent(`{{${variable}}}`);
      });
    } else {
      // Fallback for HTML mode
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
    }
  };

  const onEditorReady = () => {
    // Configure merge tags for variables
    if (emailEditorRef.current && formData.variables.length > 0) {
      const mergeTagsConfig = formData.variables.reduce((acc: any, variable) => {
        acc[variable] = {
          name: variable,
          value: `{{${variable}}}`,
          sample: getSampleValue(variable)
        };
        return acc;
      }, {});

      emailEditorRef.current.editor.setMergeTags(mergeTagsConfig);
    }

    // Load existing design if available
    if (formData.designJson) {
      emailEditorRef.current.editor.loadDesign(formData.designJson);
    }
  };

  const exportDesign = () => {
    return new Promise((resolve) => {
      if (emailEditorRef.current) {
        emailEditorRef.current.editor.exportHtml((data: any) => {
          const { design, html } = data;
          setFormData(prev => ({
            ...prev,
            designJson: design,
            htmlContent: html
          }));
          resolve(data);
        });
      } else {
        resolve(null);
      }
    });
  };

  const getSampleValue = (variable: string) => {
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
    return sampleValues[variable] || `[${variable}]`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Export design from Unlayer editor before submitting
      await exportDesign();
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
      <div className="min-h-screen">
        {/* Header - Compact */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/email-templates" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Email Template Builder</h1>
              <p className="text-sm text-muted-foreground">Create professional email templates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className={`flex overflow-hidden ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-120px)]'}`}>
          {/* Left Panel - Email Editor */}
          <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
            {/* Editor Controls */}
            <div className="flex items-center justify-between bg-white border-b px-6 py-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={editorMode === 'visual' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setEditorMode('visual')}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  Visual
                </Button>
                <Button
                  variant={editorMode === 'html' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setEditorMode('html')}
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  HTML
                </Button>
                <Button
                  variant={editorMode === 'preview' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setEditorMode('preview')}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportDesign}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Email Editor Area */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden min-w-[800px]">
                {editorMode === 'visual' && (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center space-y-4">
                      <Palette className="h-16 w-16 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Visual Email Editor</h3>
                        <p className="text-gray-500 mt-1">
                          Open the drag-and-drop editor in a new tab for full functionality
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          const editorUrl = `/admin/email-templates/editor?templateId=new&variables=${encodeURIComponent(JSON.stringify(formData.variables))}&designJson=${encodeURIComponent(JSON.stringify(formData.designJson || {}))}`;
                          const newWindow = window.open(editorUrl, '_blank');
                          setEditorWindow(newWindow);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Palette className="h-4 w-4" />
                        Open Visual Editor
                      </Button>
                    </div>
                  </div>
                )}

                {editorMode === 'html' && (
                  <div className="p-6 h-full overflow-auto">
                    <div className="space-y-4">
                      <Label htmlFor="htmlContent">HTML Content *</Label>
                      <Textarea
                        id="htmlContent"
                        value={formData.htmlContent}
                        onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                        placeholder="<div><h1>Hello {{userName}}!</h1></div>"
                        className={`font-mono text-sm h-[calc(100%-60px)] ${errors.htmlContent ? 'border-red-500' : ''}`}
                      />
                      {errors.htmlContent && <p className="text-sm text-red-500">{errors.htmlContent}</p>}
                    </div>
                  </div>
                )}

                {editorMode === 'preview' && (
                  <div className="p-6 h-full overflow-auto">
                    <div className="border rounded-lg p-4 bg-white h-full">
                      <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Right Sidebar - Tools */}
          <div className="w-72 bg-white border-l shadow-sm overflow-y-auto flex-shrink-0">
            <div className="p-4 space-y-4">
              {/* Template Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Template Settings</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTemplateSettings(!showTemplateSettings)}
                    >
                      {showTemplateSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {showTemplateSettings && (
                  <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs">Template Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g., claim_submitted"
                          className={`text-sm ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-xs">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value: TemplateCategory) => handleInputChange('category', value)}
                        >
                          <SelectTrigger className="text-sm">
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

                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs">Display Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="e.g., Claim Submission Confirmation"
                          className={`text-sm ${errors.title ? 'border-red-500' : ''}`}
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-xs">Email Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="e.g., Your claim {{claimNumber}} has been submitted"
                          className={`text-sm ${errors.subject ? 'border-red-500' : ''}`}
                        />
                        {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="textContent" className="text-xs">Plain Text Version (Optional)</Label>
                        <Textarea
                          id="textContent"
                          value={formData.textContent}
                          onChange={(e) => handleInputChange('textContent', e.target.value)}
                          placeholder="Plain text version for email clients that don't support HTML"
                          rows={3}
                          className="text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                        />
                        <Label htmlFor="isActive" className="text-xs">Template is active</Label>
                      </div>
                    </form>
                  </CardContent>
                )}
              </Card>

              {/* Variables Panel */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Variables</CardTitle>
                  <CardDescription className="text-xs">
                    Define variables that will be replaced with actual data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      placeholder="Enter variable name"
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                    />
                    <Button type="button" onClick={addVariable} size="sm">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {suggestedVariables.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Suggested Variables:</Label>
                      <div className="flex flex-wrap gap-1">
                        {suggestedVariables.map(variable => (
                          <Button
                            key={variable}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 py-1 h-6"
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
                      <Label className="text-xs font-medium">Defined Variables:</Label>
                      <div className="flex flex-wrap gap-1">
                        {formData.variables.map(variable => (
                          <Badge key={variable} variant="secondary" className="text-xs flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => insertVariable(variable)}
                              className="text-blue-500 hover:text-blue-700 mr-1"
                            >
                              {`{{${variable}}}`}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVariable(variable)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.variables && (
                    <Alert className="py-2">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">{errors.variables}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Help & Instructions - Collapsible */}
              {showInstructions && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Help & Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <strong>Visual Editor:</strong> Drag and drop blocks to build your email
                    </div>
                    <div>
                      <strong>Merge Tags:</strong> Click variable buttons to insert <code>{`{{variable}}`}</code>
                    </div>
                    <div>
                      <strong>Responsive:</strong> Templates automatically adapt to mobile devices
                    </div>
                    <div>
                      <strong>Preview:</strong> Switch to preview mode to see final result
                    </div>
                    <div>
                      <strong>Export:</strong> Use export button to save design before submitting
                    </div>
                    <div className="pt-2 border-t">
                      <strong>Variable Guide:</strong>
                      <div className="mt-1 space-y-1">
                        <div><code className="text-xs">{`{{userName}}`}</code> - User's full name</div>
                        <div><code className="text-xs">{`{{userEmail}}`}</code> - User's email address</div>
                        <div><code className="text-xs">{`{{currentDate}}`}</code> - Today's date</div>
                        <div><code className="text-xs">{`{{claimNumber}}`}</code> - Claim reference number</div>
                        <div><code className="text-xs">{`{{policyNumber}}`}</code> - Policy reference number</div>
                        <div><code className="text-xs">{`{{amount}}`}</code> - Monetary amount</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={createTemplate.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                </Button>

                {errors.submit && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{errors.submit}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function NewTemplatePage() {
  return <NewTemplatePageContent />;
}
