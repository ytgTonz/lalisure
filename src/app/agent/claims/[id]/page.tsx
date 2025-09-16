'use client';

// import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  FileText, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Download,
  Upload,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ClaimStatus } from '@prisma/client';
import { useState } from 'react';
import { toast } from 'sonner';

const statusColors = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  INVESTIGATING: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SETTLED: 'bg-green-100 text-green-800',
};

const statusIcons = {
  SUBMITTED: Clock,
  UNDER_REVIEW: AlertTriangle,
  INVESTIGATING: Search,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  SETTLED: CheckCircle,
};

export default function AgentClaimDetailPage() {
  const params = useParams();
  const claimId = params.id as string;
  const [newStatus, setNewStatus] = useState<ClaimStatus | ''>('');
  const [claimAmount, setClaimAmount] = useState('');
  const [agentNotes, setAgentNotes] = useState('');

  const { data: policies, isLoading } = api.policy.getAllForAgents.useQuery({
    filters: {},
    limit: 100
  });

  // Find claim across all policies
  let claim: any = null;
  let relatedPolicy: any = null;
  
  if (policies?.policies) {
    for (const policy of policies.policies) {
      const foundClaim = policy.claims.find((c: any) => c.id === claimId);
      if (foundClaim) {
        claim = {
          ...foundClaim,
          policyNumber: policy.policyNumber,
          propertyInfo: policy.propertyInfo
        };
        relatedPolicy = policy;
        break;
      }
    }
  }

  if (isLoading) {
    return (
      // <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading claim details...</p>
          </div>
        </div>
      // </DashboardLayout>
    );
  }

  if (!claim) {
    return (
      // <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Claim not found</p>
          <Button asChild className="mt-4">
            <Link href="/agent/claims">Back to Claims</Link>
          </Button>
        </div>
      // </DashboardLayout>
    );
  }
  const safeReplace = (str: string | undefined | null, searchValue: string, replaceValue: string) => {
    return str?.replace(searchValue, replaceValue) || 'Unknown';
  };
  
  const getStatusIcon = (status: ClaimStatus) => {
    const IconComponent = statusIcons[status];
    return <IconComponent className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'TBD';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getDaysSinceSubmission = () => {
    return Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getPriorityLevel = () => {
    const days = getDaysSinceSubmission();
    if (days > 14) return { level: 'High', color: 'bg-red-100 text-red-800' };
    if (days > 7) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const priority = getPriorityLevel();
  const propertyInfo = typeof claim.propertyInfo === 'object' ? claim.propertyInfo as any : {};

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    // This would use a claim-specific update mutation
    toast.success(`Claim status updated to ${safeReplace(newStatus, '_', ' ')}`);

    setNewStatus('');
  };

  const handleAmountUpdate = () => {
    if (!claimAmount) return;
    toast.success(`Claim amount updated to ${formatCurrency(parseFloat(claimAmount))}`);
    setClaimAmount('');
  };

  const addAgentNote = () => {
    if (!agentNotes) return;
    toast.success('Agent note added to claim');
    setAgentNotes('');
  };

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agent/claims">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Claims
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{claim.claimNumber}</h1>
              <Badge className={statusColors[claim.status as ClaimStatus]}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(claim.status as ClaimStatus)}
                  {safeReplace(claim.status, '_', ' ')}
                  
                </div>
              </Badge>
              <Badge className={priority.color}>
                {priority.level} Priority
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Policy: {claim.policyNumber} • Submitted {getDaysSinceSubmission()} days ago
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Customer
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email Customer
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-insurance-blue" />
                <span className="text-sm text-muted-foreground">Claim Amount</span>
              </div>
              <div className="text-2xl font-bold text-insurance-blue">
                {formatCurrency(claim.amount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-insurance-green" />
                <span className="text-sm text-muted-foreground">Incident Date</span>
              </div>
              <div className="text-lg font-bold text-insurance-green">
                {new Date(claim.incidentDate).toLocaleDateString('en-ZA')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-insurance-orange" />
                <span className="text-sm text-muted-foreground">Claim Type</span>
              </div>
              <div className="text-lg font-bold text-insurance-orange">
              {safeReplace(claim.type, '_', ' ')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Days Open</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {getDaysSinceSubmission()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Claim Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Agent Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Claim Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Claim Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{claim.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Claim Number</Label>
                        <p className="font-medium">{claim.claimNumber}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Policy Number</Label>
                        <Link href={`/agent/policies/${relatedPolicy?.id}`} className="font-medium text-insurance-blue hover:underline">
                          {claim.policyNumber}
                        </Link>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Incident Date</Label>
                        <p className="font-medium">{formatDate(claim.incidentDate)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Submitted Date</Label>
                        <p className="font-medium">{formatDate(claim.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Property Address</Label>
                      <p className="font-medium">{propertyInfo.address || 'Not specified'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">City</Label>
                        <p className="font-medium">{propertyInfo.city || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Province</Label>
                        <p className="font-medium">{propertyInfo.province || 'Not specified'}</p>
                      </div>
                    </div>
                    {claim.location && (
                      <div>
                        <Label className="text-muted-foreground">Specific Location</Label>
                        <p className="font-medium">{claim.location}</p>
                      </div>
                    )}
                    {claim.what3words && (
                      <div>
                        <Label className="text-muted-foreground">What3Words</Label>
                        <p className="font-medium text-insurance-blue">{claim.what3words}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
                <CardDescription>Documents submitted with this claim</CardDescription>
              </CardHeader>
              <CardContent>
                {claim.documents && claim.documents.length > 0 ? (
                  <div className="space-y-3">
                    {claim.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-insurance-blue" />
                          <div>
                            <p className="font-medium">{doc.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type.replace('_', ' ')} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                    <Button className="mt-4" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Request Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Claim Timeline</CardTitle>
                <CardDescription>Activity history for this claim</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Claim Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        Customer submitted claim with initial documentation
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(claim.createdAt)}
                      </p>
                    </div>
                  </div>

                  {claim.status !== 'SUBMITTED' && (
                    <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Status Updated</p>
                        <p className="text-sm text-muted-foreground">
                        Claim status changed to {safeReplace(claim.status, '_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(claim.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <p>More timeline events will appear here as the claim progresses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Claim Status</CardTitle>
                  <CardDescription>Change the current status of this claim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNDER_REVIEW">Start Review</SelectItem>
                        <SelectItem value="INVESTIGATING">Begin Investigation</SelectItem>
                        <SelectItem value="APPROVED">Approve Claim</SelectItem>
                        <SelectItem value="REJECTED">Reject Claim</SelectItem>
                        <SelectItem value="SETTLED">Mark as Settled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleStatusUpdate} disabled={!newStatus} className="w-full">
                    Update Status
                  </Button>
                </CardContent>
              </Card>

              {/* Amount Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Claim Amount</CardTitle>
                  <CardDescription>Set or modify the claim settlement amount</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Claim Amount (ZAR)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAmountUpdate} disabled={!claimAmount} className="w-full">
                    Update Amount
                  </Button>
                </CardContent>
              </Card>

              {/* Agent Notes */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Add Agent Notes
                  </CardTitle>
                  <CardDescription>Add internal notes for this claim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Enter your notes about this claim..."
                      value={agentNotes}
                      onChange={(e) => setAgentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={addAgentNote} disabled={!agentNotes}>
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    // </DashboardLayout>
  );
}