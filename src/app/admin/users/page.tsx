'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/trpc/react';
import {
  Search,
  Filter,
  Users,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  MoreHorizontal,
  Crown,
  User,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Download,
  Upload,
  CheckSquare,
  Square
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

type UserRole = 'CUSTOMER' | 'AGENT' | 'UNDERWRITER' | 'ADMIN';
type FilterBy = 'all' | 'CUSTOMER' | 'AGENT' | 'UNDERWRITER' | 'ADMIN' | 'active' | 'inactive';

const roleColors = {
  CUSTOMER: 'bg-blue-100 text-blue-800',
  AGENT: 'bg-green-100 text-green-800', 
  UNDERWRITER: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
};

const roleIcons = {
  CUSTOMER: User,
  AGENT: UserCheck,
  UNDERWRITER: Shield,
  ADMIN: Crown,
};

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [bulkAction, setBulkAction] = useState<string>('');

  // Get all users directly
  const { data: usersData, isLoading, refetch } = api.user.getAllUsers.useQuery({
    role: filterBy !== 'all' && ['CUSTOMER', 'AGENT', 'UNDERWRITER', 'ADMIN'].includes(filterBy) 
      ? filterBy as UserRole 
      : undefined,
    search: searchTerm || undefined,
    limit: 100,
  });

  // Get user statistics
  const { data: userStats } = api.user.getUserStats.useQuery();

  // Role update mutation
  const updateRoleMutation = api.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success('User role updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Bulk operations mutations
  const bulkUpdateRoleMutation = api.user.bulkUpdateRole.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.updatedCount} users updated successfully`);
      setSelectedUsers([]);
      setBulkAction('');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to update users');
      console.error('Bulk update error:', error);
    },
  });

  const bulkActivateMutation = api.user.bulkActivate.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.processedCount} users processed successfully`);
      setSelectedUsers([]);
      setBulkAction('');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to process users');
      console.error('Bulk activate error:', error);
    },
  });

  const bulkInviteMutation = api.user.bulkInvite.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.sentCount} invitations sent successfully`);
      setSelectedUsers([]);
      setBulkAction('');
    },
    onError: (error) => {
      toast.error('Failed to send invitations');
      console.error('Bulk invite error:', error);
    },
  });

  // Use real user data from API
  const users = usersData?.users || [];

  const getRoleIcon = (role: UserRole) => {
    const IconComponent = roleIcons[role];
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    }).format(new Date(date));
  };

  const getTimeAgo = (date: Date) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getUserInitials = (user: any) => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const handleUserStatusToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    // In real app, this would update via API
  };

  const handleDeleteUser = (userId: string) => {
    toast.success('User deleted successfully');
    // In real app, this would delete via API
  };

  // Bulk operations handler
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      toast.error('Please select users and an action');
      return;
    }

    switch (bulkAction) {
      case 'update_role':
        // This would open a dialog to select the new role
        // For now, we'll use AGENT as default
        await bulkUpdateRoleMutation.mutateAsync({
          userIds: selectedUsers,
          newRole: 'AGENT'
        });
        break;
      case 'activate':
        await bulkActivateMutation.mutateAsync({
          userIds: selectedUsers,
          active: true
        });
        break;
      case 'deactivate':
        await bulkActivateMutation.mutateAsync({
          userIds: selectedUsers,
          active: false
        });
        break;
      case 'send_invite':
        // This would need email addresses, for now we'll show an error
        toast.error('Bulk invite requires user email addresses');
        break;
      default:
        toast.error('Unknown action');
    }
  };

  // User selection handlers
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Export users function
  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Created', 'Policies', 'Claims'].join(','),
      ...users.map(user =>
        [
          `"${user.firstName} ${user.lastName}"`,
          user.email,
          user.role,
          formatDate(user.createdAt),
          user.policiesCount || 0,
          user.claimsCount || 0
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterBy)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role/status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="CUSTOMER">Customers</SelectItem>
                  <SelectItem value="AGENT">Agents</SelectItem>
                  <SelectItem value="UNDERWRITER">Underwriters</SelectItem>
                  <SelectItem value="ADMIN">Administrators</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="start-date">Registration Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Registration End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="status-filter">Account Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choose action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update_role">Update Role</SelectItem>
                      <SelectItem value="activate">Activate</SelectItem>
                      <SelectItem value="deactivate">Deactivate</SelectItem>
                      <SelectItem value="send_invite">Send Invitation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkAction} size="sm">
                    Apply Action
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {userStats?.byRole.CUSTOMER || 0}
              </div>
              <p className="text-sm text-muted-foreground">Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {userStats?.byRole.AGENT || 0}
              </div>
              <p className="text-sm text-muted-foreground">Agents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {userStats?.byRole.UNDERWRITER || 0}
              </div>
              <p className="text-sm text-muted-foreground">Underwriters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {userStats?.byRole.ADMIN || 0}
              </div>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users ({users.length})
            </CardTitle>
            <CardDescription>
              All platform users and their information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No users found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all users"
                  />
                  <span className="text-sm font-medium">
                    {selectedUsers.length === users.length && users.length > 0 ? 'Deselect All' : 'Select All'}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {selectedUsers.length} of {users.length} selected
                  </span>
                </div>
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                          aria-label={`Select ${user.firstName} ${user.lastName}`}
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-insurance-blue text-white">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge className={roleColors[user.role]} variant="secondary">
                              <div className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {user.role}
                              </div>
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>ID: {user.id.slice(-8)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {user.policiesCount} policies, {user.claimsCount} claims
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Update user information and role
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>First Name</Label>
                                  <Input defaultValue={user.firstName} />
                                </div>
                                <div>
                                  <Label>Last Name</Label>
                                  <Input defaultValue={user.lastName} />
                                </div>
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input defaultValue={user.email} />
                              </div>
                              <div>
                                <Label>Role</Label>
                                <Select defaultValue={user.role}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                    <SelectItem value="AGENT">Agent</SelectItem>
                                    <SelectItem value="UNDERWRITER">Underwriter</SelectItem>
                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => {
                                    const roleSelect = document.querySelector(`#role-select-${user.id}`) as HTMLSelectElement;
                                    const newRole = roleSelect?.value as UserRole;
                                    if (newRole && newRole !== user.role) {
                                      handleRoleChange(user.id, newRole);
                                    }
                                  }}
                                  className="flex-1"
                                  disabled={updateRoleMutation.isPending}
                                >
                                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => handleUserStatusToggle(user.id, user.status)}
                                >
                                  {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline">Cancel</Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete User
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}