'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateUnderwriterDialog } from './create-underwriter-dialog';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MoreVertical,
  Mail,
  Award,
  Building
} from 'lucide-react';
import { api } from '@/trpc/react';

interface UnderwriterQuickActionsProps {
  onRefresh?: () => void;
}

export function UnderwriterQuickActions({ onRefresh }: UnderwriterQuickActionsProps) {

  // Get invitation stats filtered for underwriters
  const { data: underwriterInvitations } = api.invitation.getAll.useQuery({
    role: 'UNDERWRITER',
  });

  const underwriterStats = {
    pending: underwriterInvitations?.filter(inv => inv.status === 'PENDING').length || 0,
    accepted: underwriterInvitations?.filter(inv => inv.status === 'ACCEPTED').length || 0,
    total: underwriterInvitations?.length || 0,
  };

  const quickActions = [
    {
      title: 'Senior Underwriter',
      description: 'Commercial & Complex Risks',
      specializations: ['Commercial Property', 'Business Liability', 'Marine Insurance'],
      experience: '10+ years',
      icon: Award,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      title: 'Personal Lines Underwriter', 
      description: 'Home & Auto Insurance',
      specializations: ['Home Insurance', 'Auto Insurance', 'Travel Insurance'],
      experience: '3-7 years',
      icon: Shield,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      title: 'Risk Assessment Specialist',
      description: 'Risk Analysis & Modeling',
      specializations: ['Risk Assessment', 'Agricultural Insurance', 'Special Risks'],
      experience: '5+ years', 
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800 border-green-200'
    }
  ];

  const handleQuickCreate = (template: typeof quickActions[0]) => {
    // This could pre-populate the dialog with template data
    console.log('Quick create with template:', template);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Underwriters</p>
                <p className="text-2xl font-bold text-purple-600">
                  {underwriterStats.accepted}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invitations</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {underwriterStats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {underwriterStats.total > 0 
                    ? Math.round((underwriterStats.accepted / underwriterStats.total) * 100) 
                    : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {underwriterInvitations?.filter(inv => {
                    const inviteDate = new Date(inv.createdAt);
                    const now = new Date();
                    return inviteDate.getMonth() === now.getMonth() && 
                           inviteDate.getFullYear() === now.getFullYear();
                  }).length || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Create Underwriter
          </CardTitle>
          <CardDescription>
            Use pre-configured templates or create a custom underwriter profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {quickActions.map((template, index) => {
              const Icon = template.icon;
              return (
                <Card key={index} className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${template.color}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className="h-6 w-6" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleQuickCreate(template)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h3 className="font-semibold mb-1">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building className="h-3 w-3" />
                        {template.experience}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.specializations.slice(0, 2).map(spec => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {template.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CreateUnderwriterDialog
                      trigger={
                        <Button size="sm" className="w-full mt-3">
                          Use Template
                        </Button>
                      }
                      onSuccess={onRefresh}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Custom Create Button */}
          <div className="flex justify-center">
            <CreateUnderwriterDialog
              trigger={
                <Button size="lg" className="px-8">
                  <Shield className="h-4 w-4 mr-2" />
                  Create Custom Underwriter
                </Button>
              }
              onSuccess={onRefresh}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Underwriter Invitations
          </CardTitle>
          <CardDescription>
            Latest activity in underwriter onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {underwriterInvitations && underwriterInvitations.length > 0 ? (
            <div className="space-y-3">
              {underwriterInvitations.slice(0, 5).map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {new Date(invitation.createdAt).toLocaleDateString()} • {invitation.department}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      invitation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {invitation.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No underwriter invitations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by creating your first underwriter invitation
              </p>
              <CreateUnderwriterDialog
                trigger={
                  <Button>
                    <Shield className="h-4 w-4 mr-2" />
                    Create First Underwriter
                  </Button>
                }
                onSuccess={onRefresh}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}