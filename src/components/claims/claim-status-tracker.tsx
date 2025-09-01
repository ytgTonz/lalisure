'use client';

import { format } from 'date-fns';
import { CheckCircle, Circle, Clock, AlertCircle, XCircle, Banknote } from 'lucide-react';
import { ClaimStatus } from '@prisma/client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ClaimStatusTrackerProps {
  status: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
  amount?: number | null;
}

const statusSteps: { status: ClaimStatus; label: string; description: string }[] = [
  { status: ClaimStatus.SUBMITTED, label: 'Submitted', description: 'Claim has been submitted' },
  { status: ClaimStatus.UNDER_REVIEW, label: 'Under Review', description: 'Initial review in progress' },
  { status: ClaimStatus.INVESTIGATING, label: 'Investigating', description: 'Detailed investigation underway' },
  { status: ClaimStatus.APPROVED, label: 'Approved', description: 'Claim has been approved' },
  { status: ClaimStatus.SETTLED, label: 'Settled', description: 'Payment processed and claim closed' },
];

const rejectedStep = { status: ClaimStatus.REJECTED, label: 'Rejected', description: 'Claim has been rejected' };

export function ClaimStatusTracker({ status, createdAt, updatedAt, amount }: ClaimStatusTrackerProps) {
  const isRejected = status === ClaimStatus.REJECTED;
  const currentSteps = isRejected ? [statusSteps[0], rejectedStep] : statusSteps;
  
  const currentStepIndex = currentSteps.findIndex(step => step.status === status);
  const progress = isRejected ? 100 : ((currentStepIndex + 1) / currentSteps.length) * 100;

  const getStepIcon = (stepStatus: ClaimStatus, index: number) => {
    if (isRejected && stepStatus === ClaimStatus.REJECTED) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    if (index < currentStepIndex) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (index === currentStepIndex) {
      if (stepStatus === ClaimStatus.INVESTIGATING) {
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      }
      return <Clock className="h-5 w-5 text-blue-500" />;
    } else {
      return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ClaimStatus.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ClaimStatus.INVESTIGATING:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ClaimStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ClaimStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ClaimStatus.SETTLED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.SUBMITTED:
        return 'Your claim has been successfully submitted and assigned a claim number.';
      case ClaimStatus.UNDER_REVIEW:
        return 'Our team is reviewing your claim details and documentation.';
      case ClaimStatus.INVESTIGATING:
        return 'We are conducting a detailed investigation into your claim.';
      case ClaimStatus.APPROVED:
        return 'Great news! Your claim has been approved for processing.';
      case ClaimStatus.REJECTED:
        return 'Unfortunately, your claim has been rejected. Please contact us for more information.';
      case ClaimStatus.SETTLED:
        return 'Your claim has been settled and payment has been processed.';
      default:
        return 'Claim status updated.';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Claim Status</CardTitle>
            <CardDescription>Track your claim progress</CardDescription>
          </div>
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Status Message */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-1">Current Status</p>
          <p className="text-sm text-muted-foreground">
            {getStatusMessage(status)}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Timeline</h4>
          {currentSteps.map((step, index) => (
            <div key={step.status} className="flex items-start gap-3">
              {getStepIcon(step.status, index)}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${
                    index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </p>
                  {index === currentStepIndex && (
                    <span className="text-xs text-muted-foreground">
                      {format(updatedAt, 'MMM dd, yyyy h:mm a')}
                    </span>
                  )}
                  {index === 0 && (
                    <span className="text-xs text-muted-foreground">
                      {format(createdAt, 'MMM dd, yyyy h:mm a')}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  index <= currentStepIndex ? 'text-muted-foreground' : 'text-muted-foreground/60'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Settlement Amount */}
        {amount && status === ClaimStatus.SETTLED && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Settlement Amount</p>
                <p className="text-2xl font-bold text-green-900">
                  ${amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {status !== ClaimStatus.SETTLED && status !== ClaimStatus.REJECTED && (
          <div className="p-4 border rounded-lg">
            <p className="font-medium text-sm mb-2">What's Next?</p>
            <p className="text-sm text-muted-foreground">
              {status === ClaimStatus.SUBMITTED && 
                'We will review your claim within 2-3 business days and may contact you for additional information.'}
              {status === ClaimStatus.UNDER_REVIEW && 
                'Our adjusters are reviewing your documentation. This process typically takes 5-7 business days.'}
              {status === ClaimStatus.INVESTIGATING && 
                'Investigation is ongoing. We may contact you or schedule an inspection. This can take 1-2 weeks.'}
              {status === ClaimStatus.APPROVED && 
                'Your settlement will be processed within 3-5 business days and payment will be issued.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}