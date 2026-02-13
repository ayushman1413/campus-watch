'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/use-auth';
import { useItemsStore } from '@/lib/stores/use-item';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/spinner';

const CATEGORIES = [
  'Wallet', 'Phone', 'Keys', 'Bag', 'ID Card', 'Electronics', 'Accessories', 'Documents', 'Books', 'Other'
];

const LOCATIONS = [
  'Library', 'Cafeteria', 'Hostel', 'Classroom', 'Playground', 'Sports Complex', 'Parking', 'Medical Center', 'Admin Building', 'Other'
];

export default function PostItemPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createItem, loading } = useItemsStore();
  const { toast } = useToast();

  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    color: '',
    distinguishingMarks: '',
    dateLost: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.location) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createItem(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          item_type: itemType,
          color: formData.color,
          distinguishing_marks: formData.distinguishingMarks,
          date_found_lost: formData.dateLost,
        },
        user?.id || ''
      );

      toast({
        title: 'Success',
        description: `${itemType === 'lost' ? 'Lost' : 'Found'} item posted successfully!`,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post item',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Posting item..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Report {itemType === 'lost' ? 'Lost' : 'Found'} Item
            </h1>
            <p className="text-muted-foreground">
              Help reunite lost items with their owners or report found items
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Type Selector */}
                <div className="grid grid-cols-2 gap-4">
                  {(['lost', 'found'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setItemType(type)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        itemType === type
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <p className="font-semibold capitalize">{type} Item</p>
                    </button>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Item Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Black Wallet"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the item in detail..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color */}
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Black, Red"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>

                {/* Distinguishing Marks */}
                <div>
                  <Label htmlFor="marks">Distinguishing Marks</Label>
                  <Textarea
                    id="marks"
                    placeholder="Any scratches, writings, or unique features..."
                    rows={3}
                    value={formData.distinguishingMarks}
                    onChange={(e) => setFormData({ ...formData, distinguishingMarks: e.target.value })}
                  />
                </div>

                {/* Date */}
                <div>
                  <Label htmlFor="date">Date {itemType === 'lost' ? 'Lost' : 'Found'}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.dateLost}
                    onChange={(e) => setFormData({ ...formData, dateLost: e.target.value })}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Post Item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
