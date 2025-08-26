'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PolicyStatus } from '@prisma/client';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Pause, 
  FileText, 
  MessageSquare 
} from 'lucide-react';

interface PolicyStatusManagerProps {
  policy: {
    id: string;
    status: PolicyStatus;
    statusHistory?: Array<{
      status: PolicyStatus;
      reason?: string;
      changedAt: Date;
      changedBy?: string;
    }>;
  };
  onStatusChange: (newStatus: PolicyStatus, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export function PolicyStatusManager({ 
  policy, 
  onStatusChange, 
  isLoading = false 
}: PolicyStatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<PolicyStatus | ''>('');
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const getStatusIcon = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return <CheckCircle2 className="h-4 w-4 text-insurance-green" />;
      case PolicyStatus.PENDING_REVIEW:
        return <Clock className="h-4 w-4 text-insurance-orange" />;
      case PolicyStatus.DRAFT:
        return <FileText className="h-4 w-4 text-gray-500" />;
      case PolicyStatus.EXPIRED:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case PolicyStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case PolicyStatus.SUSPENDED:
        return <Pause className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return 'bg-insurance-green text-white';
      case PolicyStatus.PENDING_REVIEW:
        return 'bg-insurance-orange text-white';
      case PolicyStatus.DRAFT:
        return 'bg-gray-500 text-white';
      case PolicyStatus.EXPIRED:
        return 'bg-red-500 text-white';
      case PolicyStatus.CANCELLED:
        return 'bg-red-600 text-white';
      case PolicyStatus.SUSPENDED:
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusDescription = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return 'Policy is active and in effect';
      case PolicyStatus.PENDING_REVIEW:
        return 'Policy is under review by underwriters';
      case PolicyStatus.DRAFT:
        return 'Policy is in draft state and not yet active';
      case PolicyStatus.EXPIRED:
        return 'Policy has expired and is no longer active';
      case PolicyStatus.CANCELLED:
        return 'Policy has been cancelled';
      case PolicyStatus.SUSPENDED:
        return 'Policy is temporarily suspended';
      default:
        return 'Unknown policy status';
    }
  };

  const getAvailableTransitions = (currentStatus: PolicyStatus): PolicyStatus[] => {
    switch (currentStatus) {
      case PolicyStatus.DRAFT:
        return [PolicyStatus.PENDING_REVIEW, PolicyStatus.CANCELLED];
      case PolicyStatus.PENDING_REVIEW:
        return [PolicyStatus.ACTIVE, PolicyStatus.DRAFT, PolicyStatus.CANCELLED];
      case PolicyStatus.ACTIVE:
        return [PolicyStatus.SUSPENDED, PolicyStatus.CANCELLED, PolicyStatus.EXPIRED];
      case PolicyStatus.SUSPENDED:
        return [PolicyStatus.ACTIVE, PolicyStatus.CANCELLED];
      case PolicyStatus.EXPIRED:
        return [PolicyStatus.ACTIVE]; // Allow reactivation
      case PolicyStatus.CANCELLED:
        return []; // No transitions from cancelled
      default:
        return [];
    }
  };

  const requiresReason = (newStatus: PolicyStatus) => {
    return [PolicyStatus.CANCELLED, PolicyStatus.SUSPENDED, PolicyStatus.EXPIRED].includes(newStatus);
  };

  const handleStatusSelection = (status: PolicyStatus) => {
    setSelectedStatus(status);
    setShowReasonInput(requiresReason(status));
    if (!requiresReason(status)) {
      setReason('');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    try {
      await onStatusChange(selectedStatus, reason || undefined);
      setSelectedStatus('');
      setReason('');
      setShowReasonInput(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const availableTransitions = getAvailableTransitions(policy.status);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Policy Status</CardTitle>
          <CardDescription>
            Current status and available actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(policy.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getStatusColor(policy.status)}>
                  {policy.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getStatusDescription(policy.status)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change */}
      {availableTransitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Status</CardTitle>
            <CardDescription>
              Update the policy status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select 
                value={selectedStatus} 
                onValueChange={handleStatusSelection}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span>{status.replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showReasonInput && (
              <div className="space-y-2">
                <Label>Reason {requiresReason(selectedStatus as PolicyStatus) && <span className="text-red-500">*</span>}</Label>
                <Input
                  placeholder="Enter reason for status change..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <Button
              onClick={handleStatusUpdate}
              disabled={
                !selectedStatus || 
                isLoading || 
                (requiresReason(selectedStatus as PolicyStatus) && !reason.trim())
              }
              className="w-full"
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      {policy.statusHistory && policy.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status History</CardTitle>
            <CardDescription>
              Previous status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {policy.statusHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(entry.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {entry.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.reason && (
                      <div className="flex items-start gap-2 mt-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          {entry.reason}
                        </p>
                      </div>
                    )}
                    {entry.changedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Changed by {entry.changedBy}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}