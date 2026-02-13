"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  User,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useItemsStore } from "@/lib/stores/use-item";
import { useAuthStore } from "@/lib/stores/use-auth";
import { useClaimsStore } from "@/lib/stores/claims-store";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ItemCard } from "@/components/item-card";
import { supabase } from "@/lib/supabase/supabaseClient";
// TEMP DEMO DATA — remove later
const matches = [
  {
    id: "demo1",
    title: "Brown Leather Wallet",
    description: "Found near cafeteria. Looks slightly worn.",
    image_url:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600",
    status: "found",
  },
  {
    id: "demo2",
    title: "Black Backpack",
    description: "Lost in library reading hall.",
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
    status: "lost",
  },
  {
    id: "demo3",
    title: "Set of Keys with Red Keychain",
    description: "Found near parking area.",
    image_url:
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600",
    status: "found",
  },
];

export default function ItemDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { items } = useItemsStore();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [verificationAnswer, setVerificationAnswer] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  useEffect(() => {
    const loadItem = async () => {
      // 1️⃣ Try from store first
      const storeItem = items.find((i) => i.id === params.id);

      if (storeItem) {
        setItem(storeItem);
        setLoading(false);
      } else {
        // 2️⃣ Fallback fetch from Supabase
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }

        setItem(data);
        setLoading(false);
      }
      if (user) {
        const { data: existingClaim } = await supabase
          .from("claims")
          .select("id")
          .eq("item_id", params.id)
          .eq("claimant_id", user.id)
          .maybeSingle();

        if (existingClaim) setAlreadyClaimed(true);
      }
      // 3️⃣ Fetch verification question
      const { data: q } = await supabase
        .from("claim_questions")
        .select("*")
        .eq("item_id", params.id)
        .maybeSingle();
      if (q) setQuestion(q);
    };

    loadItem();
  }, [items, params.id, user]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Item not found</h1>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleClaim = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to claim an item",
      });
      router.push("/login");
      return;
    }

    if (user.id === item.user_id) {
      toast({
        variant: "destructive",
        title: "Cannot claim",
        description: "You cannot claim your own item",
      });
      return;
    }

    setClaimModalOpen(true);
  };
  const handleClaimSubmit = async () => {
    try {
      if (!verificationAnswer.trim()) {
        toast({
          variant: "destructive",
          title: "Answer required",
          description: "Please answer the verification question",
        });
        return;
      }

      // 1️⃣ create claim
      const { data: claim, error } = await supabase
        .from("claims")
        .insert([
          {
            item_id: item.id,
            claimant_id: user.id,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 2️⃣ save answer
      if (question) {
        await supabase.from("claim_answers").insert([
          {
            claim_id: claim.id,
            question_id: question.id,
            answer: verificationAnswer,
          },
        ]);
      }

      setClaimSubmitted(true);

      toast({
        title: "Claim submitted 🎉",
        description: "Owner will review your answer",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };
  const handleFoundSubmit = async () => {
    try {
      const { error } = await supabase.from("claims").insert([
        {
          item_id: item.id,
          claimant_id: user.id,
          claim_type: "found_match",
          status: "pending",
        },
      ]);

      if (error) throw error;

      // ⭐ IMPORTANT: update UI instantly
      setAlreadyClaimed(true);

      toast({
        title: "Great! 🎉",
        description: "Owner has been notified that you found the item.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const statusColors = {
    active: "success",
    claimed: "warning",
    returned: "secondary",
    closed: "destructive",
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card className="overflow-hidden shadow-lg animate-fade-in">
              <div className="relative aspect-video">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge
                    variant={item.status === "lost" ? "destructive" : "default"}
                    className="text-sm"
                  >
                    {item.status === "lost" ? "Lost" : "Found"}
                  </Badge>
                  <Badge
                    variant={statusColors[item.status]}
                    className="text-sm"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Details */}
            <Card className="shadow-lg animate-fade-in animate-delay-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {item.title}
                    </CardTitle>
                    {/* <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div> */}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span className="text-muted-foreground">
                      {item.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span className="text-muted-foreground">
                      {format(new Date(item.item_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Category:</span>
                    <span className="text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Status:</span>
                    <span className="text-muted-foreground capitalize">
                      {item.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Posted By */}
            <Card className="shadow-lg animate-fade-in animate-delay-200">
              <CardHeader>
                <CardTitle className="text-lg">Posted By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    {/* <AvatarImage src={item.user.avatar} alt={item.user.name} /> */}
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {item.user?.name || "test user"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.user?.email || "demo@gmail.com"}
                    </p>
                  </div>
                </div>

                {user &&
                  user.id !== item.user_id &&
                  !item.is_claimed &&
                  (alreadyClaimed ? (
                    <p className="text-sm text-green-600 font-medium">
                      ✅ You already responded to this item. Owner will contact
                      you.
                    </p>
                  ) : item.status === "found" ? (
                    <Button onClick={handleClaim} className="w-full gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Claim This Item
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFoundSubmit}
                      className="w-full gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />I Found This Item
                    </Button>
                  ))}
              </CardContent>
            </Card>

            {/* Possible Matches */}
            {matches.length > 0 && (
              <Card className="shadow-lg animate-fade-in animate-delay-300">
                <CardHeader>
                  <CardTitle className="text-lg">Possible Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => router.push(`/items/${match.id}`)}
                    >
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={match.image_url}
                            alt={match.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {match.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {match.description}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {match.status === "lost" ? "Lost" : "Found"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <Dialog open={claimModalOpen} onOpenChange={setClaimModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {claimSubmitted ? "Claim Submitted!" : "Claim This Item"}
            </DialogTitle>
            <DialogDescription>
              {claimSubmitted
                ? "Your claim has been sent to the item owner"
                : "Answer the verification question to claim this item"}
            </DialogDescription>
          </DialogHeader>

          {claimSubmitted ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Claim Request Sent!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                The item owner will review your answer and approve/reject your
                claim.
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  setClaimModalOpen(false);
                  setClaimSubmitted(false);
                  setVerificationAnswer("");
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {question && (
                <>
                  <div className="space-y-2">
                    <Label>Verification Question</Label>
                    <p className="text-sm font-medium bg-accent p-3 rounded-lg">
                      {question.question}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification">Your Answer</Label>
                    <Input
                      id="verification"
                      placeholder="Enter your answer"
                      value={verificationAnswer}
                      onChange={(e) => setVerificationAnswer(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleClaimSubmit} className="w-full">
                Submit Claim
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
