'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function UserInvitationsPage() {
  const invitations = [
    {
      id: '1',
      email: 'john.doe@example.com',
      role: 'AGENT',
      status: 'PENDING',
      sentAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-01-22'),
    },
    {
      id: '2', 
      email: 'jane.smith@example.com',
      role: 'UNDERWRITER',
      status: 'ACCEPTED',
      sentAt: new Date('2024-01-10'),
      acceptedAt: new Date('2024-01-12'),
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Invitations</h1>
          <p className="text-muted-foreground">
            Send and manage user invitations to join the platform
          </p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {invitation.role} • Sent {invitation.sentAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(invitation.status)}
                  <Button variant="outline" size="sm">
                    Resend
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
