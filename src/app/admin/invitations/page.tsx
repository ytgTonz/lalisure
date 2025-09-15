'use client';

import { useState } from 'react';
// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/trpc/react';
import { 
  Mail, 
  Send, 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  MoreHorizontal,
  Eye,
  Trash2,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole, InvitationStatus } from '@prisma/client';

type FilterBy = 'all' | InvitationStatus;

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

const roleColors = {
  CUSTOMER: 'bg-blue-100 text-blue-800',
  AGENT: 'bg-green-100 text-green-800',
  UNDERWRITER: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
};

export default function AdminInvitationsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: '' as UserRole,
    department: '',
    message: '',
  });

  const { data: invitations, refetch: refetchInvitations } = api.invitation.getAll.useQuery({
    status: filterBy === 'all' ? undefined : filterBy,
  });

  const { data: stats } = api.invitation.getStats.useQuery();

  const createInvitationMutation = api.invitation.create.useMutation({
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      setShowCreateDialog(false);
      setNewInvitation({ email: '', role: '' as UserRole, department: '', message: '' });
      refetchInvitations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelInvitationMutation = api.invitation.cancel.useMutation({
    onSuccess: () => {
      toast.success('Invitation cancelled');
      refetchInvitations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resendInvitationMutation = api.invitation.resend.useMutation({
    onSuccess: () => {
      toast.success('Invitation resent');
      refetchInvitations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredInvitations = invitations?.filter(invitation => 
    invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invitation.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invitation.department && invitation.department.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateInvitation = () => {
    createInvitationMutation.mutate(newInvitation);
  };

  const handleCancelInvitation = (id: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      cancelInvitationMutation.mutate({ id });
    }
  };

  const handleResendInvitation = (id: string) => {
    resendInvitationMutation.mutate({ id });
  };

  const getStatusIcon = (status: InvitationStatus) => {
    const Icon = statusIcons[status];
    return <Icon className="h-4 w-4" />;
  };

  return (
    // <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Invitations</h1>
            <p className="text-muted-foreground">
              Manage role-based invitations for new team members
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send New Invitation</DialogTitle>
                <DialogDescription>
                  Invite a new team member with a specific role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newInvitation.email}
                    onChange={(e) => setNewInvitation({...newInvitation, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newInvitation.role} onValueChange={(value) => setNewInvitation({...newInvitation, role: value as UserRole})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AGENT">Agent</SelectItem>
                      <SelectItem value="UNDERWRITER">Underwriter</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Claims, Underwriting"
                    value={newInvitation.department}
                    onChange={(e) => setNewInvitation({...newInvitation, department: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Welcome to our team! We're excited to have you..."
                    value={newInvitation.message}
                    onChange={(e) => setNewInvitation({...newInvitation, message: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateInvitation}
                    disabled={!newInvitation.email || !newInvitation.role || createInvitationMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byStatus.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byStatus.accepted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.byStatus.accepted / stats.total) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Invitation Management</CardTitle>
            <CardDescription>
              View and manage all sent invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by email, role, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterBy)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invitations Table */}
            <div className="space-y-4">
              {filteredInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invitation.status)}
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>Invited by {invitation.inviter.firstName} {invitation.inviter.lastName}</span>
                          <span>•</span>
                          <span>{new Date(invitation.createdAt).toLocaleDateString()}</span>
                          {invitation.department && (
                            <>
                              <span>•</span>
                              <span>{invitation.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={roleColors[invitation.role]}>
                      {invitation.role}
                    </Badge>
                    <Badge className={statusColors[invitation.status]}>
                      {invitation.status}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      {invitation.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.id)}
                            disabled={resendInvitationMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            disabled={cancelInvitationMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredInvitations.length === 0 && (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No invitations found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterBy !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start by sending your first invitation'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    // </DashboardLayout>
  );
}