'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Copy,
  Trash2,
  Mail,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Users
} from 'lucide-react';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';

function EmailTemplatesPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const { data: templates, isLoading } = api.emailTemplate.getAll.useQuery({
    filters: {
      search: searchTerm || undefined,
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      isActive: selectedStatus !== 'ALL' ? selectedStatus === 'active' : undefined,
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CLAIMS':
        return <FileText className="h-4 w-4" />;
      case 'PAYMENTS':
        return <DollarSign className="h-4 w-4" />;
      case 'POLICIES':
        return <Shield className="h-4 w-4" />;
      case 'INVITATIONS':
        return <Users className="h-4 w-4" />;
      case 'WELCOME':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
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

  // Use actual database templates only
  const allTemplates = templates?.templates || [];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || template.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' ||
                         (selectedStatus === 'active' && template.isActive) ||
                         (selectedStatus === 'inactive' && !template.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      // <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      // </DashboardLayout>
    );
  }

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">
              Create and manage email templates for different scenarios
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/email-templates/new">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTemplates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {allTemplates.filter(t => t.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(allTemplates.map(t => t.category)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {format(new Date(), 'MMM dd, yyyy')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
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
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription>{template.name}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={getCategoryColor(template.category)}
                  >
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subject</p>
                    <p className="text-sm truncate">{template.subject}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Variables</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Updated {format(new Date(template.updatedAt), 'MMM dd')}
                    </span>
                    <div className="flex items-center gap-1">
                      {template.isActive ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      <span className={template.isActive ? 'text-green-600' : 'text-red-600'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/email-templates/${template.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/email-templates/${template.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                    ? "No templates match your current filters."
                    : "You haven't created any email templates yet."
                  }
                </p>
                <Button asChild>
                  <Link href="/admin/email-templates/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    // </DashboardLayout>
  );
}

export default function EmailTemplatesPage() {
  return (
    <Suspense fallback={
      // <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email templates...</p>
          </div>
        </div>
      // </DashboardLayout>
    }>
      <EmailTemplatesPageContent />
    </Suspense>
  );
}
