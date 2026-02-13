'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/use-auth';
import { useUserStore } from '@/lib/stores/use-user';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { Mail, Award, Trophy, Check, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { profile, stats, loading } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      useUserStore.getState().fetchProfile(user.id);
      useUserStore.getState().fetchStats(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return <Spinner fullScreen text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20" />
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 mb-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-xl">{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile?.name || 'User'}</h1>
                  {profile?.is_verified && (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{profile?.department || 'No department'}</p>
                
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Stats */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <StatCard
                    label="Items Lost"
                    value={stats?.items_lost || 0}
                    color="bg-red-100"
                  />
                  <StatCard
                    label="Items Found"
                    value={stats?.items_found || 0}
                    color="bg-green-100"
                  />
                  <StatCard
                    label="Recovered"
                    value={stats?.items_recovered || 0}
                    color="bg-blue-100"
                  />
                  <StatCard
                    label="Success Rate"
                    value={`${stats?.success_rate || 0}%`}
                    color="bg-purple-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact & Details */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-muted-foreground">{profile?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Phone</p>
                  <p className="text-muted-foreground">{profile?.phone || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reputation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Reputation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {profile?.reputation_score || 0}
                </div>
                <p className="text-sm text-muted-foreground">Reputation Score</p>
              </div>

              <div className="space-y-3">
                <ReputationBadge icon="🌟" label="Member" />
                {profile?.reputation_score >= 100 && (
                  <ReputationBadge icon="⭐" label="Helper" />
                )}
                {profile?.reputation_score >= 500 && (
                  <ReputationBadge icon="👑" label="Expert" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`${color} rounded-lg p-4 text-center`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ReputationBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
      <span className="text-xl">{icon}</span>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
