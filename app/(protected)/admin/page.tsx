'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, Trash2, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/stores/use-auth';
import { useItemsStore } from '@/lib/stores/items-store';
import { useClaimsStore } from '@/lib/stores/claims-store';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useState } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin } = useAuthStore();
  const { items, deleteItem, updateItem } = useItemsStore();
  const { getClaimsByItem, claims } = useClaimsStore();
  
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [claimsModalOpen, setClaimsModalOpen] = useState(false);

  if (!user || !isAdmin) {
    router.push('/');
    return null;
  }

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    toast({
      title: 'Item deleted',
      description: 'The item has been removed from the system',
    });
  };

  const handleToggleStatus = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const newStatus = item.status === 'active' ? 'closed' : 'active';
      updateItem(itemId, { status: newStatus as any });
      toast({
        title: 'Status updated',
        description: `Item status changed to ${newStatus}`,
      });
    }
  };

  const handleViewClaims = (itemId: string) => {
    setSelectedItem(itemId);
    setClaimsModalOpen(true);
  };

  const itemClaims = selectedItem ? getClaimsByItem(selectedItem) : [];
  const selectedItemData = selectedItem ? items.find((i) => i.id === selectedItem) : null;

  const stats = {
    totalItems: items.length,
    lostItems: items.filter((i) => i.type === 'lost').length,
    foundItems: items.filter((i) => i.type === 'found').length,
    totalClaims: claims.length,
    pendingClaims: claims.filter((c) => c.status === 'pending').length,
    approvedClaims: claims.filter((c) => c.status === 'approved').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage all items and claims across the platform</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <Card className="shadow-lg animate-fade-in">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg animate-fade-in animate-delay-100">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.lostItems}</div>
              <p className="text-xs text-muted-foreground">Lost Items</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg animate-fade-in animate-delay-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.foundItems}</div>
              <p className="text-xs text-muted-foreground">Found Items</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg animate-fade-in animate-delay-300">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalClaims}</div>
              <p className="text-xs text-muted-foreground">Total Claims</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg animate-fade-in animate-delay-400">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingClaims}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg animate-fade-in animate-delay-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.approvedClaims}</div>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
        </div>

        {/* All Items Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No items in the system
                </div>
              ) : (
                items.map((item, index) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                                {item.type}
                              </Badge>
                              <Badge variant="outline">{item.status}</Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                            <span>👤 {item.user.name}</span>
                            <span>•</span>
                            <span>📍 {item.location}</span>
                            <span>•</span>
                            <span>📅 {format(new Date(item.date), 'MMM d, yyyy')}</span>
                            <span>•</span>
                            <span>
                              {getClaimsByItem(item.id).length} claim
                              {getClaimsByItem(item.id).length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/items/${item.id}`)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewClaims(item.id)}
                              className="gap-2"
                            >
                              Claims ({getClaimsByItem(item.id).length})
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(item.id)}
                              className="gap-2"
                            >
                              {item.status === 'active' ? (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  Close
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteItem(item.id)}
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Modal */}
      <Dialog open={claimsModalOpen} onOpenChange={setClaimsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Claims for: {selectedItemData?.title}
            </DialogTitle>
            <DialogDescription>
              View all claims submitted for this item
            </DialogDescription>
          </DialogHeader>

          {itemClaims.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No claims for this item
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {itemClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{claim.claimant.name}</p>
                        <p className="text-sm text-muted-foreground">{claim.claimant.email}</p>
                      </div>
                      <Badge
                        variant={
                          claim.status === 'pending'
                            ? 'warning'
                            : claim.status === 'approved'
                            ? 'success'
                            : 'destructive'
                        }
                      >
                        {claim.status}
                      </Badge>
                    </div>

                    {claim.verificationAnswer && (
                      <div className="bg-accent rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium mb-1">Verification Answer:</p>
                        <p className="text-sm text-muted-foreground">{claim.verificationAnswer}</p>
                      </div>
                    )}

                    <p className="text-sm mb-2">{claim.message}</p>

                    <p className="text-xs text-muted-foreground">
                      Claimed on {format(new Date(claim.createdAt), 'PPp')}
                    </p>

                    {claim.status === 'approved' && claim.otp && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-900">
                          OTP: <span className="text-lg font-bold">{claim.otp}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
