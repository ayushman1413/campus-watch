'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/use-auth';
import { useClaimsStore } from '@/lib/stores/use-claim';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Clock, X, Eye, Send } from 'lucide-react';

export default function MyClaimsPage() {
  const { user } = useAuthStore();
  const { claims, loading, fetchUserClaims, approveClaim, rejectClaim } = useClaimsStore();
  const { toast } = useToast();
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [otpCode, setOtpCode] = useState('');
  const [showOTPDialog, setShowOTPDialog] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserClaims(user.id);
    }
  }, [user?.id]);

  const handleApproveClaim = async () => {
    if (!selectedClaim?.id) return;
    try {
      await approveClaim(selectedClaim.id);
      toast({
        title: 'Success',
        description: 'Claim approved successfully!',
      });
      setShowOTPDialog(false);
      setSelectedClaim(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      await rejectClaim(claimId);
      toast({
        title: 'Success',
        description: 'Claim rejected',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Loading claims..." />;
  }

  const pendingClaims = claims.filter((c) => c.status === 'pending');
  const approvedClaims = claims.filter((c) => c.status === 'approved');
  const rejectedClaims = claims.filter((c) => c.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Claims</h1>
          <p className="text-muted-foreground">Manage your item claims and recovery requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatsCard
            title="Pending Claims"
            count={pendingClaims.length}
            icon={<Clock className="w-5 h-5 text-yellow-500" />}
          />
          <StatsCard
            title="Approved"
            count={approvedClaims.length}
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          />
          <StatsCard
            title="Rejected"
            count={rejectedClaims.length}
            icon={<X className="w-5 h-5 text-red-500" />}
          />
        </div>

        {/* Pending Claims */}
        {pendingClaims.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Pending Claims</h2>
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  onView={() => setSelectedClaim(claim)}
                  onApprove={() => {
                    setSelectedClaim(claim);
                    setShowOTPDialog(true);
                  }}
                  onReject={() => handleRejectClaim(claim.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Approved Claims */}
        {approvedClaims.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Approved Claims</h2>
            <div className="space-y-4">
              {approvedClaims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} approved />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {claims.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-lg">No claims yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* OTP Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the OTP sent to the claimant to verify their identity
            </p>
            <Input
              placeholder="Enter 6-digit OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOTPDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveClaim} disabled={otpCode.length !== 6}>
              Verify & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{count}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ClaimCard({
  claim,
  approved,
  onView,
  onApprove,
  onReject,
}: {
  claim: any;
  approved?: boolean;
  onView?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">Item Claim</h3>
              <Badge className={getStatusColor(claim.status)}>
                {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {claim.message || 'No message provided'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(claim.created_at).toLocaleDateString()}
            </p>
          </div>

          {!approved && (
            <div className="flex gap-2">
              {onView && (
                <Button size="sm" variant="outline" onClick={onView}>
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
              )}
              {onApprove && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                </Button>
              )}
              {onReject && (
                <Button size="sm" variant="destructive" onClick={onReject}>
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
