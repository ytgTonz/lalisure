'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';
import { Shield, Crown, Users, UserCheck } from 'lucide-react';

export default function UserRolesPage() {
  const roles = [
    {
      name: 'Administrator',
      key: 'ADMIN',
      icon: Crown,
      color: 'bg-red-100 text-red-800',
      description: 'Full system access and user management',
      permissions: ['All permissions', 'User management', 'System settings', 'Analytics access']
    },
    {
      name: 'Underwriter',
      key: 'UNDERWRITER', 
      icon: Shield,
      color: 'bg-purple-100 text-purple-800',
      description: 'Risk assessment and policy approval',
      permissions: ['Risk assessment', 'Policy approval', 'Claims review', 'Analytics access']
    },
    {
      name: 'Agent',
      key: 'AGENT',
      icon: UserCheck,
      color: 'bg-green-100 text-green-800', 
      description: 'Customer support and policy management',
      permissions: ['Customer support', 'Policy management', 'Claims processing', 'Customer data access']
    },
    {
      name: 'Customer',
      key: 'CUSTOMER',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      description: 'Standard customer access',
      permissions: ['View policies', 'Submit claims', 'Make payments', 'Update profile']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage user roles and their associated permissions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <role.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge className={role.color} variant="secondary">
                      {role.key}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {role.description}
              </p>
              <div>
                <h4 className="font-medium mb-2">Permissions:</h4>
                <ul className="space-y-1">
                  {role.permissions.map((permission, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
