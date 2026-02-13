"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClient";
import { uploadItemImage } from "@/lib/supabase/storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/stores/use-auth";
import { useItemsStore } from "@/lib/stores/use-item";
import { useToast } from "@/components/ui/use-toast";
import { ItemCard } from "@/components/item-card";
import { Category, Location } from "@/lib/types";

const formSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Please select a location"),
  date: z.string().min(1, "Please select a date"),
  verificationQuestion: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export default function ReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "lost",
    },
  });

  const itemType = watch("type");
  const category = watch("category");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!imageFile) {
        toast({
          variant: "destructive",
          title: "Image required",
          description: "Please upload an image of the item",
        });
        return;
      }
      if (data.type === "found" && !data.verificationQuestion) {
        toast({
          variant: "destructive",
          title: "Verification question required",
          description: "Please add a question to verify the real owner",
        });
        setAnalyzing(false);
        return;
      }
      setAnalyzing(true);

      // 1️⃣ Upload image to Supabase Storage
      const imageUrl = await uploadItemImage(imageFile);

      // 2️⃣ Insert item in DB
      const { data: item, error } = await supabase
        .from("items")
        .insert([
          {
            title: data.title,
            description: data.description,
            category: data.category,
            location: data.location,
            item_date: data.date,
            status: data.type, // lost or found
            image_url: imageUrl,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 3️⃣ Insert verification question if exists
      if (data.verificationQuestion && item) {
        await supabase.from("claim_questions").insert([
          {
            item_id: item.id,
            question: data.verificationQuestion,
          },
        ]);
      }

      setAnalyzing(false);

      toast({
        title: "Item reported successfully 🎉",
        description: "Your item is now visible to students",
      });

      router.push("/");
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
      setAnalyzing(false);
    }
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Report an Item</h1>
          <p className="text-muted-foreground">
            Help reunite lost items with their owners by reporting what you've
            found or lost
          </p>
        </div>

        <Card className="shadow-lg animate-fade-in animate-delay-100">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type Toggle */}
              <div className="space-y-2">
                <Label>Item Type</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={itemType === "lost" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setValue("type", "lost")}
                  >
                    I Lost Something
                  </Button>
                  <Button
                    type="button"
                    variant={itemType === "found" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setValue("type", "found")}
                  >
                    I Found Something
                  </Button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Black Leather Wallet"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the item..."
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Category and Location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wallet">Wallet</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Keys">Keys</SelectItem>
                      <SelectItem value="Bag">Bag</SelectItem>
                      <SelectItem value="ID Card">ID Card</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    onValueChange={(value) => setValue("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="Classroom">Classroom</SelectItem>
                      <SelectItem value="Playground">Playground</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-sm text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Verification Question (only for lost items) */}
              {itemType === "found" && (
                <div className="space-y-2">
                  <Label htmlFor="verificationQuestion">
                    Verification Question
                  </Label>
                  <Input
                    id="verificationQuestion"
                    placeholder="e.g., What color is the card holder inside?"
                    {...register("verificationQuestion")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask something only the real owner would know. Example: What
                    was inside the wallet?
                  </p>
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Upload Image *</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {imagePreview && (
                    <span className="text-sm text-muted-foreground">
                      Image uploaded
                    </span>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reporting Item...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Report Item
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Tags */}
        {analyzed && detectedTags.length > 0 && (
          <Card className="mt-6 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Detected Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {detectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Possible Matches */}
        {matches.length > 0 && (
          <div className="mt-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Possible Matches Found!</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
