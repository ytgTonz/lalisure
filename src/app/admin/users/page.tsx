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
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

  // Get all policies to derive user information
  const { data: policiesData, isLoading } = api.policy.getAllForAdmins.useQuery({
    filters: {},
    limit: 1000
  });

  // Create mock user data from policies (in real app, this would be a dedicated users endpoint)
  const userMap = new Map();
  
  // Add mock system users
  const systemUsers = [
    {
      id: 'admin-1',
      clerkId: 'admin-clerk-1',
      email: 'admin@lalisure.co.za',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN' as UserRole,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      status: 'active',
      policies: [],
      claims: []
    },
    {
      id: 'agent-1', 
      clerkId: 'agent-clerk-1',
      email: 'agent@lalisure.co.za',
      firstName: 'John',
      lastName: 'Agent',
      role: 'AGENT' as UserRole,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'active',
      policies: [],
      claims: []
    },
    {
      id: 'underwriter-1',
      clerkId: 'underwriter-clerk-1', 
      email: 'underwriter@lalisure.co.za',
      firstName: 'Sarah',
      lastName: 'Underwriter',
      role: 'UNDERWRITER' as UserRole,
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'active',
      policies: [],
      claims: []
    }
  ];

  systemUsers.forEach(user => userMap.set(user.id, user));

  // Add customer users from policies
  policiesData?.policies?.forEach(policy => {
    const userId = policy.userId;
    if (!userMap.has(userId)) {
      const personalInfo = typeof policy.personalInfo === 'object' ? policy.personalInfo as any : {};
      userMap.set(userId, {
        id: userId,
        clerkId: `clerk-${userId}`,
        email: `customer-${userId.slice(-4)}@example.com`,
        firstName: personalInfo.firstName || 'Customer',
        lastName: personalInfo.lastName || `${userId.slice(-4)}`,
        role: 'CUSTOMER' as UserRole,
        createdAt: policy.createdAt,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        status: policy.status === 'ACTIVE' ? 'active' : 'inactive',
        policies: [],
        claims: []
      });
    }
    
    const user = userMap.get(userId);
    user.policies.push(policy);
    user.claims.push(...policy.claims);
  });

  let users = Array.from(userMap.values());

  // Apply filters
  if (searchTerm) {
    users = users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterBy !== 'all') {
    if (['CUSTOMER', 'AGENT', 'UNDERWRITER', 'ADMIN'].includes(filterBy)) {
      users = users.filter(user => user.role === filterBy);
    } else if (filterBy === 'active') {
      users = users.filter(user => user.status === 'active');
    } else if (filterBy === 'inactive') {
      users = users.filter(user => user.status === 'inactive');
    }
  }

  // Sort by creation date (newest first)
  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
    toast.success(`User role updated to ${newRole}`);
    // In real app, this would update via API
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
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
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

        {/* User Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'CUSTOMER').length}
              </div>
              <p className="text-sm text-muted-foreground">Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'AGENT').length}
              </div>
              <p className="text-sm text-muted-foreground">Agents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'UNDERWRITER').length}
              </div>
              <p className="text-sm text-muted-foreground">Underwriters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'ADMIN').length}
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
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
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
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {user.status}
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
                              <span>Last login {getTimeAgo(user.lastLogin)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {user.policies.length} policies, {user.claims.length} claims
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
                                  onClick={() => handleRoleChange(user.id, 'AGENT')}
                                  className="flex-1"
                                >
                                  Update User
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