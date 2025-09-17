'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { api } from '@/trpc/react';
import {
  Search,
  Filter,
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
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { toast } from 'sonner';
import { UserRole, UserStatus } from '@prisma/client';

type FilterBy = 'all' | 'CUSTOMER' | 'AGENT' | 'UNDERWRITER' | 'ADMIN' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

const roleColors = {
  CUSTOMER: 'bg-blue-100 text-blue-800 border-blue-200',
  AGENT: 'bg-green-100 text-green-800 border-green-200', 
  UNDERWRITER: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const roleIcons = {
  CUSTOMER: User,
  AGENT: UserCheck,
  UNDERWRITER: Shield,
  ADMIN: Crown,
};

// Form interfaces
interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  sendInvitation: boolean;
}

interface EditUserFormData {
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

export default function UserManagementPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form state
  const [newUserForm, setNewUserForm] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.CUSTOMER,
    sendInvitation: true,
  });

  const [editUserForm, setEditUserForm] = useState<EditUserFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.CUSTOMER,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});

  // API calls
  const utils = api.useUtils();
  
  const { data: usersData, isLoading } = api.user.getAllUsers.useQuery({
    search: searchTerm,
    role: filterBy.includes('CUSTOMER') || filterBy.includes('AGENT') || filterBy.includes('UNDERWRITER') || filterBy.includes('ADMIN') ? filterBy as UserRole : undefined,
    status: filterBy.includes('ACTIVE') || filterBy.includes('INACTIVE') || filterBy.includes('SUSPENDED') ? filterBy as UserStatus : undefined,
  });

  const users = usersData?.users || [];

  const createUserMutation = api.user.createUser.useMutation({
    onSuccess: (data, variables) => {
      utils.user.getAllUsers.invalidate();
      utils.user.getUserStats.invalidate();
      setIsCreateDialogOpen(false);
      setNewUserForm({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: UserRole.CUSTOMER,
        sendInvitation: true,
      });
      setFormErrors({});
      const message = variables.sendInvitation 
        ? 'User created successfully and invitation email sent'
        : 'User created successfully';
      toast.success(message);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const updateUserStatusMutation = api.user.updateUserStatus.useMutation({
    onSuccess: () => {
      utils.user.getAllUsers.invalidate();
      utils.user.getUserStats.invalidate();
      toast.success('User status updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });

  const updateUserMutation = api.user.updateUser.useMutation({
    onSuccess: () => {
      utils.user.getAllUsers.invalidate();
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setEditFormErrors({});
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = api.user.deleteUser.useMutation({
    onSuccess: () => {
      utils.user.getAllUsers.invalidate();
      utils.user.getUserStats.invalidate();
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  // Event handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUserStatusToggle = (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    updateUserStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate({ userId });
    }
  };

  // Form validation
  const validateUserForm = (form: UserFormData): FormErrors => {
    const errors: FormErrors = {};
    
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!form.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!form.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (form.phone && !/^\+?[\d\s-()]+$/.test(form.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
  };

  const validateEditForm = (form: EditUserFormData): FormErrors => {
    const errors: FormErrors = {};
    
    if (!form.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!form.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (form.phone && !/^\+?[\d\s-()]+$/.test(form.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
  };

  // Event handlers
  const handleCreateUser = async () => {
    const errors = validateUserForm(newUserForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createUserMutation.mutate({
      email: newUserForm.email,
      firstName: newUserForm.firstName,
      lastName: newUserForm.lastName,
      phone: newUserForm.phone || undefined,
      role: newUserForm.role,
      sendInvitation: newUserForm.sendInvitation,
    });
  };

  const openViewDialog = (user: any) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const errors = validateEditForm(editUserForm);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    updateUserMutation.mutate({
      userId: editingUser.id,
      firstName: editUserForm.firstName,
      lastName: editUserForm.lastName,
      phone: editUserForm.phone || undefined,
      role: editUserForm.role,
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    
    return matchesSearch && (
      user.role === filterBy || 
      user.status === filterBy
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage user accounts and their permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
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
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="CUSTOMER">Customers</SelectItem>
                  <SelectItem value="AGENT">Agents</SelectItem>
                  <SelectItem value="UNDERWRITER">Underwriters</SelectItem>
                  <SelectItem value="ADMIN">Administrators</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => {
                const RoleIcon = roleIcons[user.role];
                return (
                  <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                        <Avatar>
                          <AvatarFallback>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge variant="outline" className={roleColors[user.role as keyof typeof roleColors]}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {user.role}
                            </Badge>
                            <Badge variant="outline" className={statusColors[user.status as keyof typeof statusColors]}>
                              {user.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserStatusToggle(user.id, user.status)}
                        >
                          {user.status === UserStatus.ACTIVE ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openViewDialog(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform. You can optionally send them an invitation email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={newUserForm.firstName}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className={formErrors.firstName ? 'border-red-500' : ''}
                />
                {formErrors.firstName && (
                  <p className="text-sm text-red-500">{formErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={newUserForm.lastName}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className={formErrors.lastName ? 'border-red-500' : ''}
                />
                {formErrors.lastName && (
                  <p className="text-sm text-red-500">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={newUserForm.role}
                onValueChange={(value: UserRole) => setNewUserForm(prev => ({ ...prev, role: value }))}
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendInvitation"
                checked={newUserForm.sendInvitation}
                onCheckedChange={(checked) => 
                  setNewUserForm(prev => ({ ...prev, sendInvitation: checked as boolean }))
                }
              />
              <Label htmlFor="sendInvitation" className="text-sm">
                Send invitation email to user
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
                className="flex-1"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormErrors({});
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignments.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input
                  id="editFirstName"
                  value={editUserForm.firstName}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className={editFormErrors.firstName ? 'border-red-500' : ''}
                />
                {editFormErrors.firstName && (
                  <p className="text-sm text-red-500">{editFormErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input
                  id="editLastName"
                  value={editUserForm.lastName}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className={editFormErrors.lastName ? 'border-red-500' : ''}
                />
                {editFormErrors.lastName && (
                  <p className="text-sm text-red-500">{editFormErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input
                id="editPhone"
                value={editUserForm.phone}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, phone: e.target.value }))}
                className={editFormErrors.phone ? 'border-red-500' : ''}
              />
              {editFormErrors.phone && (
                <p className="text-sm text-red-500">{editFormErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Select
                value={editUserForm.role}
                onValueChange={(value: UserRole) => setEditUserForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
                type="button"
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
                className="flex-1"
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditFormErrors({});
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {viewingUser?.firstName?.[0]}{viewingUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl">
                  {viewingUser?.firstName} {viewingUser?.lastName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={roleColors[viewingUser?.role as keyof typeof roleColors]}>
                    {viewingUser?.role && roleIcons[viewingUser.role as keyof typeof roleIcons] && React.createElement(roleIcons[viewingUser.role as keyof typeof roleIcons], { className: "h-3 w-3 mr-1" })}
                    {viewingUser?.role}
                  </Badge>
                  <Badge variant="outline" className={statusColors[viewingUser?.status as keyof typeof statusColors]}>
                    {viewingUser?.status}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Comprehensive user information and account details
            </DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                    <p className="text-sm font-medium">{viewingUser.firstName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                    <p className="text-sm font-medium">{viewingUser.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {viewingUser.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {viewingUser.phone ? (
                        <>
                          <Phone className="h-4 w-4" />
                          {viewingUser.phone}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{viewingUser.id}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <Badge variant="outline" className={roleColors[viewingUser.role as keyof typeof roleColors]}>
                      {viewingUser.role && roleIcons[viewingUser.role as keyof typeof roleIcons] && React.createElement(roleIcons[viewingUser.role as keyof typeof roleIcons], { className: "h-3 w-3 mr-1" })}
                      {viewingUser.role}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant="outline" className={statusColors[viewingUser.status as keyof typeof statusColors]}>
                      {viewingUser.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(viewingUser.createdAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p className="text-sm font-medium">
                      {viewingUser.updatedAt ? new Date(viewingUser.updatedAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Never updated'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email Verified</Label>
                    <div className="flex items-center gap-2">
                      {viewingUser.emailVerified ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-700 font-medium">Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(viewingUser);
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
