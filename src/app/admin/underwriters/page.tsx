'use client';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UnderwriterQuickActions } from '@/components/admin/underwriter-quick-actions';
import { CreateUnderwriterDialog } from '@/components/admin/create-underwriter-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/trpc/react';
import { 
  Shield, 
  Search, 
  UserPlus,
  Mail,
  Calendar,
  Award,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

type FilterBy = 'all' | 'active' | 'pending' | 'inactive';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  PENDING: Clock,
  ACCEPTED: CheckCircle,
  EXPIRED: XCircle,
  CANCELLED: XCircle,
};

export default function AdminUnderwritersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  const { data: underwriterInvitations, refetch: refetchInvitations } = api.invitation.getAll.useQuery({
    role: 'UNDERWRITER',
  });


  // Filter invitations based on search and filter criteria
  const filteredInvitations = underwriterInvitations?.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invitation.department && invitation.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'active' && invitation.status === 'ACCEPTED') ||
                         (filterBy === 'pending' && invitation.status === 'PENDING') ||
                         (filterBy === 'inactive' && ['EXPIRED', 'CANCELLED'].includes(invitation.status));
    
    return matchesSearch && matchesFilter;
  }) || [];

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getExperienceFromDepartment = (department: string) => {
    if (department.includes('Senior') || department.includes('10+')) return '10+ years';
    if (department.includes('3-7')) return '3-7 years';
    if (department.includes('5+')) return '5+ years';
    return 'Not specified';
  };

  const getSpecializationsFromDepartment = (department: string) => {
    const specializations = [];
    if (department.includes('Commercial')) specializations.push('Commercial');
    if (department.includes('Home')) specializations.push('Home');
    if (department.includes('Auto')) specializations.push('Auto');
    if (department.includes('Risk')) specializations.push('Risk Assessment');
    if (department.includes('Marine')) specializations.push('Marine');
    if (department.includes('Business')) specializations.push('Business');
    return specializations.length > 0 ? specializations : ['General'];
  };

  return (
    // <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Underwriter Management</h1>
            <p className="text-muted-foreground">
              Create, invite, and manage underwriters for your insurance platform
            </p>
          </div>
          <CreateUnderwriterDialog 
            trigger={
              <Button size="lg">
                <UserPlus className="h-4 w-4 mr-2" />
                New Underwriter
              </Button>
            }
            onSuccess={refetchInvitations}
          />
        </div>

        {/* Quick Actions Dashboard */}
        <UnderwriterQuickActions onRefresh={refetchInvitations} />

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              All Underwriters
            </CardTitle>
            <CardDescription>
              View and manage all underwriter invitations and accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterBy)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Underwriters List */}
            {filteredInvitations.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No underwriters found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by creating your first underwriter invitation'
                  }
                </p>
                {(!searchTerm && filterBy === 'all') && (
                  <CreateUnderwriterDialog 
                    trigger={
                      <Button>
                        <Shield className="h-4 w-4 mr-2" />
                        Create First Underwriter
                      </Button>
                    }
                    onSuccess={refetchInvitations}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvitations.map((invitation) => (
                  <div key={invitation.id} className="border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                            {getUserInitials(invitation.email)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{invitation.email}</h3>
                            <Badge className={statusColors[invitation.status as keyof typeof statusColors]}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(invitation.status)}
                                {invitation.status}
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{invitation.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Invited {formatDate(invitation.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span>{getExperienceFromDepartment(invitation.department || '')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <span>Invited by {invitation.inviter.firstName} {invitation.inviter.lastName}</span>
                          </div>
                          
                          {/* Specializations */}
                          <div className="flex flex-wrap gap-1">
                            {getSpecializationsFromDepartment(invitation.department || '').map(spec => (
                              <Badge key={spec} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {invitation.status === 'PENDING' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-1" />
                              Resend
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </>
                        )}
                        
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {invitation.message && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm italic">&ldquo;{invitation.message}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    // </DashboardLayout>
  );
}