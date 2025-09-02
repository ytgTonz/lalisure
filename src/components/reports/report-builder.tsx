'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Filter, 
  Download, 
  Settings,
  Eye,
  Save,
  Play
} from 'lucide-react';

interface ReportConfig {
  name: string;
  description: string;
  type: string;
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  filters: {
    policyTypes: string[];
    riskLevels: string[];
    claimStatus: string[];
    agentIds: string[];
  };
  fields: string[];
  groupBy: string;
  sortBy: string;
  format: string;
}

interface SavedReport {
  id: string;
  name: string;
  type: string;
  lastRun: string;
  description: string;
}

export function ReportBuilder() {
  const [activeTab, setActiveTab] = useState<'builder' | 'saved'>('builder');
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    type: 'policies',
    dateRange: 'last30days',
    customStartDate: '',
    customEndDate: '',
    filters: {
      policyTypes: [],
      riskLevels: [],
      claimStatus: [],
      agentIds: []
    },
    fields: [],
    groupBy: '',
    sortBy: '',
    format: 'pdf'
  });

  const savedReports: SavedReport[] = [
    {
      id: '1',
      name: 'Monthly Policy Summary',
      type: 'policies',
      lastRun: '2 days ago',
      description: 'Summary of all policies created in the last month'
    },
    {
      id: '2',
      name: 'Claims Analysis Report',
      type: 'claims',
      lastRun: '1 week ago',
      description: 'Detailed analysis of claim patterns and processing times'
    },
    {
      id: '3',
      name: 'Agent Performance Report',
      type: 'agents',
      lastRun: '3 days ago',
      description: 'Performance metrics for all agents'
    }
  ];

  const reportTypes = [
    { value: 'policies', label: 'Policy Reports' },
    { value: 'claims', label: 'Claims Reports' },
    { value: 'financial', label: 'Financial Reports' },
    { value: 'agents', label: 'Agent Reports' },
    { value: 'customers', label: 'Customer Reports' },
    { value: 'risk', label: 'Risk Analysis Reports' }
  ];

  const availableFields = {
    policies: [
      'Policy Number',
      'Customer Name',
      'Policy Type',
      'Premium Amount',
      'Coverage Amount',
      'Start Date',
      'End Date',
      'Risk Level',
      'Agent Name'
    ],
    claims: [
      'Claim Number',
      'Policy Number',
      'Customer Name',
      'Claim Type',
      'Claim Amount',
      'Status',
      'Submit Date',
      'Processing Time',
      'Agent Assigned'
    ],
    financial: [
      'Revenue',
      'Premiums Collected',
      'Claims Paid',
      'Profit Margin',
      'Commission Paid',
      'Month/Quarter',
      'Policy Count'
    ]
  };

  const handleFieldToggle = (field: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field]
    }));
  };

  const handleFilterChange = (filterType: string, values: string[]) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: values
      }
    }));
  };

  const generateReport = () => {
    console.log('Generating report with config:', config);
    // In real implementation, this would call the API to generate the report
  };

  const saveReport = () => {
    console.log('Saving report configuration:', config);
    // In real implementation, this would save the report configuration
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Builder</h2>
          <p className="text-muted-foreground">
            Create custom reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={activeTab === 'builder' ? 'default' : 'outline'}
            onClick={() => setActiveTab('builder')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Builder
          </Button>
          <Button
            variant={activeTab === 'saved' ? 'default' : 'outline'}
            onClick={() => setActiveTab('saved')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Saved Reports
          </Button>
        </div>
      </div>

      {activeTab === 'builder' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Report Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Configure the basic settings for your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      placeholder="Enter report name..."
                      value={config.name}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select 
                      value={config.type} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this report will show..."
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date Range
                </CardTitle>
                <CardDescription>
                  Select the time period for your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select 
                    value={config.dateRange} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7days">Last 7 days</SelectItem>
                      <SelectItem value="last30days">Last 30 days</SelectItem>
                      <SelectItem value="last3months">Last 3 months</SelectItem>
                      <SelectItem value="last6months">Last 6 months</SelectItem>
                      <SelectItem value="lastyear">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.dateRange === 'custom' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={config.customStartDate}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          customStartDate: e.target.value 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={config.customEndDate}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          customEndDate: e.target.value 
                        }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fields Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Data Fields</CardTitle>
                <CardDescription>
                  Select which fields to include in your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {(availableFields[config.type as keyof typeof availableFields] || []).map(field => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={config.fields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <Label htmlFor={field} className="text-sm">
                        {field}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>
                  Apply filters to narrow down your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.type === 'claims' && (
                    <div className="space-y-2">
                      <Label>Claim Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select claim status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="settled">Settled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
                <CardDescription>
                  Preview of your report configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Name:</strong> {config.name || 'Untitled Report'}
                  </div>
                  <div className="text-sm">
                    <strong>Type:</strong> {reportTypes.find(t => t.value === config.type)?.label}
                  </div>
                  <div className="text-sm">
                    <strong>Date Range:</strong> {config.dateRange.replace(/([a-z])([A-Z])/g, '$1 $2')}
                  </div>
                  <div className="text-sm">
                    <strong>Fields:</strong> {config.fields.length} selected
                  </div>
                </div>

                {config.fields.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Selected Fields:</Label>
                    <div className="flex flex-wrap gap-1">
                      {config.fields.map(field => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select 
                    value={config.format} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full" onClick={generateReport}>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full" onClick={saveReport}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedReports.map(report => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="text-base">{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Type:</span>
                      <Badge variant="secondary">{report.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Run:</span>
                      <span className="text-muted-foreground">{report.lastRun}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}