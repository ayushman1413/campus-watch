'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/use-user';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { leaderboard, loading, fetchLeaderboard } = useUserStore();

  useEffect(() => {
    fetchLeaderboard(50);
  }, []);

  if (loading) {
    return <Spinner fullScreen text="Loading leaderboard..." />;
  }

  const getMedalIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Campus Leaderboard</h1>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-lg text-muted-foreground">
            Top contributors helping recover lost items across campus
          </p>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top 50 Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <LeaderboardRow
                  key={user.id}
                  position={index + 1}
                  name={user.name}
                  email={user.email}
                  score={user.reputation_score}
                  avatar={user.avatar_url}
                  itemsFound={user.items_found}
                  medal={getMedalIcon(index + 1)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LeaderboardRow({
  position,
  name,
  email,
  score,
  avatar,
  itemsFound,
  medal,
}: {
  position: number;
  name: string;
  email: string;
  score: number;
  avatar?: string;
  itemsFound: number;
  medal: string | number;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary/75 transition-colors">
      <div className="w-12 h-12 flex items-center justify-center font-bold text-lg">
        {typeof medal === 'string' ? medal : <span>#{medal}</span>}
      </div>

      <Avatar className="w-12 h-12">
        <AvatarImage src={avatar} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="text-right">
        <Badge className="mb-2">{itemsFound} items found</Badge>
        <p className="text-sm font-bold text-yellow-600">{score} points</p>
      </div>
    </div>
  );
}
