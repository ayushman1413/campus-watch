'use client';

import { useEffect, useState } from 'react';
import { Search, BookOpen, Trophy, Zap, Bell, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { ItemCard } from '@/components/item-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useItemsStore } from '@/lib/stores/use-item';
import Spinner from '@/components/ui/spinner';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const { items, fetchItems, loading } = useItemsStore();

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesType = item.item_type === activeTab;
    const notClaimed = item.is_claimed === false;
    const matchesSearch =
      searchQuery === '' ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch && notClaimed;
  });

  if (loading) {
    return <Spinner fullScreen text="Loading items..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      {/* Hero Section */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Never Lose Track of Your Belongings
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Smart campus lost & found with AI matching, real-time notifications, and verified recovery
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="h-14 pl-12 text-base shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Campus Features</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <FeatureCard
            icon={<Zap className="w-5 h-5" />}
            title="AI Matching"
            description="Smart suggestions for lost items"
          />
          <FeatureCard
            icon={<Bell className="w-5 h-5" />}
            title="Notifications"
            description="Real-time updates on claims"
          />
          <FeatureCard
            icon={<BookOpen className="w-5 h-5" />}
            title="Find Classrooms"
            description="Locate available rooms"
          />
          <FeatureCard
            icon={<Trophy className="w-5 h-5" />}
            title="Leaderboard"
            description="Top campus helpers"
          />
          <FeatureCard
            icon={<Users className="w-5 h-5" />}
            title="Verified Users"
            description="Safe & trusted community"
          />
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Analytics"
            description="Campus-wide insights"
          />
        </div>
      </div>

      {/* Items Listing */}
      <div className="container py-8 md:py-12">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'lost' | 'found')}
        >
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div className="flex justify-center flex-1">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="lost">
                  Lost Items ({items.filter((i) => i.item_type === 'lost' && !i.is_claimed).length})
                </TabsTrigger>
                <TabsTrigger value="found">
                  Found Items ({items.filter((i) => i.item_type === 'found' && !i.is_claimed).length})
                </TabsTrigger>
              </TabsList>
            </div>
            <Link href="/post-item">
              <Button className="gap-2">
                <Search className="w-4 h-4" />
                Report Item
              </Button>
            </Link>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No items found matching your search.
                </p>
                <Link href="/post-item">
                  <Button variant="outline">Report a Lost Item</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-fade-in"
                  >
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="border-t bg-primary/5">
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to Find Your Lost Items?</h2>
            <p className="text-muted-foreground">
              Join the campus community and help others recover their belongings
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/post-item">
                <Button size="lg" className="gap-2">
                  <Search className="w-4 h-4" />
                  Report Item Now
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
