'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/trpc/react';
import { Mail, Clock, CheckCircle, XCircle, UserPlus, Trash2, RotateCcw, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserRole } from '@prisma/client';

interface InvitationFormData {
  email: string;
  role: UserRole;
}

interface FormErrors {
  email?: string;
  role?: string;
}

export default function UserInvitationsPage() {
  // State
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<string>('all');
  
  // Form state
  const [invitationForm, setInvitationForm] = useState<InvitationFormData>({
    email: '',
    role: UserRole.CUSTOMER,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // API calls
  const utils = api.useUtils();
  
  const { data: invitations = [], isLoading } = api.invitation.getAll.useQuery();
  
  const sendInvitationMutation = api.invitation.create.useMutation({
    onSuccess: () => {
      utils.invitation.getAll.invalidate();
      setIsInviteDialogOpen(false);
      setInvitationForm({
        email: '',
        role: UserRole.CUSTOMER,
      });
      setFormErrors({});
      toast.success('Invitation sent successfully with email notification');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  // Note: delete and resend endpoints don't exist yet in the API
  // These are placeholder functions for future implementation

  // Form validation
  const validateForm = (form: InvitationFormData): FormErrors => {
    const errors: FormErrors = {};
    
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return errors;
  };

  // Event handlers
  const handleSendInvitation = async () => {
    const errors = validateForm(invitationForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    sendInvitationMutation.mutate({
      email: invitationForm.email,
      role: invitationForm.role,
    });
  };

  const handleResendInvitation = (invitationId: string) => {
    toast.info('Resend functionality coming soon - API endpoint needed');
  };

  const handleDeleteInvitation = (invitationId: string) => {
    toast.info('Delete functionality coming soon - API endpoint needed');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AGENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UNDERWRITER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = !searchTerm || 
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    
    return matchesSearch && (
      invitation.role === filterBy || 
      invitation.status?.toUpperCase() === filterBy.toUpperCase()
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Invitations</h1>
          <p className="text-muted-foreground">
            Send and manage user invitations to join the platform
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search invitations by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invitations</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CUSTOMER">Customers</SelectItem>
                  <SelectItem value="AGENT">Agents</SelectItem>
                  <SelectItem value="UNDERWRITER">Underwriters</SelectItem>
                  <SelectItem value="ADMIN">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations ({filteredInvitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading invitations...</p>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No invitations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getRoleColor(invitation.role)}>
                          {invitation.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Sent {new Date(invitation.createdAt).toLocaleDateString()}
                        </span>
                        {invitation.expiresAt && (
                          <span className="text-sm text-muted-foreground">
                            • Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(invitation.status || 'PENDING')}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResendInvitation(invitation.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Resend
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Invitation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send User Invitation</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new user to join the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={invitationForm.email}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, email: e.target.value }))}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={invitationForm.role}
                onValueChange={(value: UserRole) => setInvitationForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                  <SelectItem value={UserRole.AGENT}>Agent</SelectItem>
                  <SelectItem value={UserRole.UNDERWRITER}>Underwriter</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSendInvitation}
                disabled={sendInvitationMutation.isPending}
                className="flex-1"
              >
                {sendInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setFormErrors({});
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
