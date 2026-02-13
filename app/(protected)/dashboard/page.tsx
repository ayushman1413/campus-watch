"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [myItems, setMyItems] = useState<any[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [itemClaims, setItemClaims] = useState<any[]>([]);
  const [claimsCount, setClaimsCount] = useState<any>({});

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [claimsModalOpen, setClaimsModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  if (!user) {
    router.push("/login");
    return null;
  }

  const userItems = myItems;
  const userClaims = myClaims;

 const handleDeleteItem = async (itemId: string) => {
  await supabase.from("items").delete().eq("id", itemId);

  setMyItems(prev => prev.filter(i => i.id !== itemId));

  toast({
    title: "Item deleted",
  });
};


  const handleViewClaims = async (itemId: string) => {
    setSelectedItem(itemId);
    setClaimsModalOpen(true);

    const { data, error } = await supabase
  .from("claims")
  .select(`
    *,
    claimant:profiles (id,name,email),
    answers:claim_answers (answer)
  `)
  .eq("item_id", itemId)
  .order("created_at", { ascending: false });

console.log("CLAIMS DATA", data, error); // add this for debug

setItemClaims(data || []);
  }

  const handleApproveClaim = async (claimId: string) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await supabase
      .from("claims")
      .update({ status: "approved", otp })
      .eq("id", claimId);

    toast({
      title: "Claim approved!",
      description: `OTP generated: ${otp}`,
    });

    handleViewClaims(selectedItem!); // refresh list
  };

  const handleRejectClaim = async (claimId: string) => {
    await supabase
      .from("claims")
      .update({ status: "rejected" })
      .eq("id", claimId);

    toast({
      title: "Claim rejected",
    });

    handleViewClaims(selectedItem!);
  };

  const handleVerifyOtp = async () => {
    const { data } = await supabase
      .from("claims")
      .select("otp")
      .eq("id", selectedClaim)
      .single();

    if (data?.otp !== otpInput) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
      });
      return;
    }

    await supabase
      .from("items")
      .update({ status: "returned" })
      .eq("id", selectedItem);

    toast({
      title: "Item returned successfully 🎉",
    });

    setOtpModalOpen(false);
  };

  const statusColors = {
    pending: "warning",
    approved: "success",
    rejected: "destructive",
  } as const;

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  };
  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      // 1️⃣ My posts
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMyItems(itemsData || []);

      // 2️⃣ My claims (items I claimed OR found)
      const { data: claimsData } = await supabase
        .from("claims")
        .select(
          `
        *,
        items(*)
      `,
        )
        .eq("claimant_id", user.id)
        .order("created_at", { ascending: false });

      setMyClaims(claimsData || []);
      const { data: counts } = await supabase
  .from("claims")
  .select("item_id");
  const { data: allClaims } = await supabase
  .from("claims")
  .select("id,item_id");

console.log("ALL CLAIMS:", allClaims);


const map:any = {};
counts?.forEach(c => {
  map[c.item_id] = (map[c.item_id] || 0) + 1;
});
setClaimsCount(map)
    };

    loadDashboard();
    
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your posts and claims</p>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="posts">
              My Posts ({userItems.length})
            </TabsTrigger>
            <TabsTrigger value="claims">
              My Claims ({userClaims.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {userItems.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't posted any items yet
                  </p>
                  <Button onClick={() => router.push("/report")}>
                    Report an Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {userItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className="shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
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
                              <h3 className="font-semibold text-lg">
                                {item.title}
                              </h3>
                              <div className="flex gap-2 mt-2">
                                <Badge
                                  variant={
                                    item.type === "lost"
                                      ? "destructive"
                                      : "default"
                                  }
                                >
                                  {item.type === "lost" ? "Lost" : "Found"}
                                </Badge>
                                <Badge variant="outline">{item.status}</Badge>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                            <span>📍 {item.location}</span>
                            <span>•</span>
                            <span>
                              📅 {format(new Date(item.item_date), "MMM d, yyyy")}
                            </span>
                            <span>•</span>
                            <span>
                             {claimsCount[item.id] || 0}
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
                              <MessageCircle className="h-4 w-4" />
                              View Claims ({claimsCount[item.id] || 0}
)
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
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            {userClaims.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't made any claims yet
                  </p>
                  <Button onClick={() => router.push("/")}>Browse Items</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {userClaims.map((claim, index) => {
  const StatusIcon = statusIcons[claim.status];

  const item = claim.items; // 👈 real joined item

  if (!item) return null; // safety guard

  return (
    <Card
      key={claim.id}
      className="shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>

                <div className="flex gap-2 mt-2">
                  <Badge
                    variant={statusColors[claim.status]}
                    className="gap-1"
                  >
                    <StatusIcon className="h-3 w-3" />
                    {claim.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-3">
              Responded on{" "}
              {format(new Date(claim.created_at), "MMM d, yyyy")}
            </div>

            {claim.status === "approved" && claim.otp && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Handover OTP:{" "}
                  <span className="text-2xl font-bold">{claim.otp}</span>
                </p>
                <p className="text-xs text-green-700">
                  Show this OTP when collecting the item
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/items/${item.id}`)}
              >
                View Item
              </Button>

              {claim.status === "approved" && claim.otp && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedClaim(claim.id);
                    setOtpModalOpen(true);
                  }}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Returned
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
})}

              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Claims Modal */}
      <Dialog open={claimsModalOpen} onOpenChange={setClaimsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claims for this item</DialogTitle>
            <DialogDescription>
              Review and manage claims from other users
            </DialogDescription>
          </DialogHeader>

          {itemClaims.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No claims yet for this item
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
             {itemClaims.map((claim) => {
  const StatusIcon = statusIcons[claim.status];

  return (
    <Card key={claim.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-semibold text-primary">
                {claim.claimant?.name?.[0]}
              </span>
            </div>

            <div>
              <p className="font-medium">{claim.claimant?.name}</p>
              <p className="text-sm text-muted-foreground">
                {claim.claimant?.email}
              </p>
            </div>
          </div>

          <Badge variant={statusColors[claim.status]} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {claim.status}
          </Badge>
        </div>

        {/* Verification Answer */}
        {claim.claim_answers?.[0]?.answer && (
          <div className="bg-accent rounded-lg p-3 mb-3">
            <p className="text-sm font-medium mb-1">
              Verification Answer:
            </p>
            <p className="text-sm text-muted-foreground">
              {claim.answers?.[0]?.answer}

            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-3">
          Claimed on {format(new Date(claim.created_at), "PPp")}
        </p>

        {claim.status === "approved" && claim.otp && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium text-green-900">
              Generated OTP:{" "}
              <span className="text-lg font-bold">{claim.otp}</span>
            </p>
          </div>
        )}

        {claim.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApproveClaim(claim.id)}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRejectClaim(claim.id)}
              className="gap-2 text-destructive"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
})}

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={otpModalOpen} onOpenChange={setOtpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              Enter the OTP provided by the item owner to mark the item as
              returned
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                placeholder="Enter 4-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOtpModalOpen(false);
                  setOtpInput("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleVerifyOtp} className="flex-1">
                Verify & Mark Returned
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
