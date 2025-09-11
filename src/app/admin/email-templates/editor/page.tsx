'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Download,
  Upload,
  Eye,
  Code,
  Palette
} from 'lucide-react';
import { EmailEd.itor } from 'react-email-editor';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function UnlayerEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailEditorRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [designJson, setDesignJson] = useState<any>(null);
  const [variables, setVariables] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<string>('');

  useEffect(() => {
    // Get parameters from URL
    const templateIdParam = searchParams.get('templateId');
    const variablesParam = searchParams.get('variables');
    const designJsonParam = searchParams.get('designJson');

    if (templateIdParam) setTemplateId(templateIdParam);
    if (variablesParam) {
      try {
        setVariables(JSON.parse(decodeURIComponent(variablesParam)));
      } catch (e) {
        console.error('Failed to parse variables:', e);
      }
    }
    if (designJsonParam) {
      try {
        const parsedDesign = JSON.parse(decodeURIComponent(designJsonParam));
        setDesignJson(parsedDesign);
      } catch (e) {
        console.error('Failed to parse design JSON:', e);
      }
    }

    setIsReady(true);
  }, [searchParams]);

  const onEditorReady = () => {
    console.log('Unlayer Editor is ready');

    // Configure merge tags for variables
    if (emailEditorRef.current && variables.length > 0) {
      const mergeTagsConfig = variables.reduce((acc: any, variable) => {
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
    if (designJson && emailEditorRef.current) {
      emailEditorRef.current.editor.loadDesign(designJson);
    }
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

  const exportDesign = () => {
    return new Promise((resolve) => {
      if (emailEditorRef.current) {
        emailEditorRef.current.editor.exportHtml((data: any) => {
          const { design, html } = data;
          resolve({ design, html });
        });
      } else {
        resolve(null);
      }
    });
  };

  const handleSave = async () => {
    const result = await exportDesign();
    if (result) {
      // Send the design data back to the parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'UNLAYER_DESIGN_SAVED',
          templateId,
          design: result
        }, '*');
      }

      // Close the window
      window.close();
    }
  };

  const handlePreview = () => {
    if (emailEditorRef.current) {
      emailEditorRef.current.editor.showPreview();
    }
  };

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_VARIABLES') {
        setVariables(event.data.variables);
        // Update merge tags
        if (emailEditorRef.current) {
          const mergeTagsConfig = event.data.variables.reduce((acc: any, variable: string) => {
            acc[variable] = {
              name: variable,
              value: `{{${variable}}}`,
              sample: getSampleValue(variable)
            };
            return acc;
          }, {});
          emailEditorRef.current.editor.setMergeTags(mergeTagsConfig);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.close()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Close Editor
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Email Template Editor</h1>
            <p className="text-sm text-muted-foreground">
              Drag and drop to build your email template
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={exportDesign}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save & Close
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <EmailEditor
            ref={emailEditorRef}
            onReady={onEditorReady}
            options={{
              appearance: {
                theme: 'modern_light',
                panels: {
                  tools: {
                    dock: 'left',
                    collapsible: false,
                  }
                }
              },
              features: {
                preview: true,
                imageEditor: true,
                undoRedo: true,
                stockImages: true,
                textEditor: {
                  spellChecker: true
                },
              },
              mergeTags: variables.reduce((acc: any, variable) => {
                acc[variable] = {
                  name: variable,
                  value: `{{${variable}}}`,
                  sample: getSampleValue(variable)
                };
                return acc;
              }, {})
            }}
            style={{
              height: '100vh',
              width: '100vw',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
      </div>

      {/* Variables Panel - Bottom */}
      {variables.length > 0 && (
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">Available Variables:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {variables.map(variable => (
              <span
                key={variable}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                onClick={() => {
                  if (emailEditorRef.current) {
                    emailEditorRef.current.editor.insertContent(`{{${variable}}}`);
                  }
                }}
              >
                {`{{${variable}}}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading editor...</p>
      </div>
    </div>
  );
}

export default function UnlayerEditorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnlayerEditorContent />
    </Suspense>
  );
}
