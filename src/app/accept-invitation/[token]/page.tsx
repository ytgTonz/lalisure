'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, SignIn } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';
import { 
  CheckCircle, 
  UserCheck, 
  Shield, 
  Crown, 
  Mail, 
  Calendar,
  Building,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@prisma/client';

const roleIcons = {
  CUSTOMER: UserCheck,
  AGENT: UserCheck,
  UNDERWRITER: Shield,
  ADMIN: Crown,
};

const roleDescriptions = {
  CUSTOMER: 'Access to policy management and claims submission',
  AGENT: 'Help customers with policies, claims, and provide quotes',
  UNDERWRITER: 'Review and assess insurance risks for policy approval',
  ADMIN: 'Full system access and user management capabilities',
};

const roleColors = {
  CUSTOMER: 'bg-blue-100 text-blue-800',
  AGENT: 'bg-green-100 text-green-800',
  UNDERWRITER: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
};

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);
  
  const token = params.token as string;

  const { data: invitation, error: invitationError, isLoading } = api.invitation.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const acceptInvitationMutation = api.invitation.accept.useMutation({
    onSuccess: () => {
      toast.success('Welcome! Your role has been updated successfully.');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message);
      setIsAccepting(false);
    },
  });

  const handleAcceptInvitation = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in first to accept this invitation');
      return;
    }

    setIsAccepting(true);
    acceptInvitationMutation.mutate({ token });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifying invitation...</span>
        </div>
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>
              {invitationError?.message || 'This invitation link is not valid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>You're Invited!</CardTitle>
              <CardDescription>
                You've been invited to join as a <Badge className={roleColors[invitation.role]}>{invitation.role}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Please sign in with the email <strong>{invitation.email}</strong> to accept this invitation.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 w-full',
                },
              }}
              forceRedirectUrl={`/accept-invitation/${token}`}
            />
          </div>
        </div>
      </div>
    );
  }

  const RoleIcon = roleIcons[invitation.role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <RoleIcon className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to Lalisure!</CardTitle>
          <CardDescription>
            You've been invited by {invitation.inviter.firstName} {invitation.inviter.lastName}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{invitation.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <RoleIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Role</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={roleColors[invitation.role]}>
                      {invitation.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {invitation.department && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{invitation.department}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Invited On</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-2">Your Role Permissions</h4>
            <p className="text-sm text-blue-800">{roleDescriptions[invitation.role]}</p>
          </div>

          {/* Personal Message */}
          {invitation.message && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-2">Personal Message</p>
                  <p className="text-sm text-muted-foreground">{invitation.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Accept Button */}
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleAcceptInvitation}
              disabled={isAccepting || acceptInvitationMutation.isPending}
              className="w-full"
              size="lg"
            >
              {isAccepting || acceptInvitationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting Invitation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Invitation & Join Team
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              By accepting this invitation, you agree to join as a {invitation.role.toLowerCase()} 
              and will have access to role-specific features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}