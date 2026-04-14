'use client';

import { useEffect, useState } from 'react';
import { useClassroomStore } from '@/lib/stores/use-classroom';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Users, DoorOpen, Search } from 'lucide-react';

export default function ClassroomFinderPage() {
  const {
    blocks,
    classrooms,
    selectedClassroom,
    statistics,
    loading,
    fetchAllBlocks,
    fetchAllClassrooms,
    getStatistics,
    setSelectedClassroom,
    searchClassrooms,
  } = useClassroomStore();


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  useEffect(() => {
    fetchAllBlocks();
    fetchAllClassrooms();
    getStatistics();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchClassrooms(query);
    } else {
      fetchAllClassrooms();
    }
  };

  
  if (loading) {
    return <Spinner fullScreen text="Loading classrooms..." />;
  }

  const filteredClassrooms = selectedBlock
    ? classrooms.filter((c) => c.block_id === selectedBlock)
    : classrooms;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Classroom Finder</h1>
          <p className="text-lg text-muted-foreground">
            Find available classrooms and rooms across campus
          </p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <StatCard
              label="Total Classrooms"
              value={statistics.total_classrooms}
              icon={<DoorOpen className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              label="Available Now"
              value={statistics.available_classrooms}
              icon={<Users className="w-5 h-5 text-green-500" />}
            />
            <StatCard
              label="Occupied"
              value={statistics.occupied_classrooms}
              icon={<MapPin className="w-5 h-5 text-red-500" />}
            />
            <StatCard
              label="Occupancy Rate"
              value={`${statistics.occupancy_rate}%`}
              icon={<Search className="w-5 h-5 text-purple-500" />}
            />
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-4">
          {/* Sidebar - Blocks */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buildings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedBlock === null ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedBlock(null)}
                  >
                    All Buildings
                  </Button>
                  {blocks.map((block) => (
                    <Button
                      key={block.id}
                      variant={selectedBlock === block.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedBlock(block.id)}
                    >
                      {block.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search classrooms..."
                  className="pl-12"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Classrooms Grid */}
            {filteredClassrooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClassrooms.map((classroom) => (
                  <ClassroomCard
                    key={classroom.id}
                    classroom={classroom}
                    onClick={() => setSelectedClassroom(classroom)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No classrooms found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Classroom Details Dialog */}
      {selectedClassroom && (
        <Dialog open={!!selectedClassroom} onOpenChange={() => setSelectedClassroom(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Room {selectedClassroom.room_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Building</p>
                <p className="text-lg font-semibold">
                  {blocks.find((b) => b.id === selectedClassroom.block_id)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Floor</p>
                <p className="text-lg font-semibold">{selectedClassroom.floor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                <p className="text-lg font-semibold">{selectedClassroom.capacity} people</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge
                  className={
                    selectedClassroom.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {selectedClassroom.is_available ? 'Available' : 'Occupied'}
                </Badge>
              </div>
              {selectedClassroom.amenities && selectedClassroom.amenities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedClassroom.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ClassroomCard({
  classroom,
  onClick,
}: {
  classroom: any;
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold">Room {classroom.room_number}</h3>
            <Badge
              className={
                classroom.is_available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {classroom.is_available ? 'Available' : 'Occupied'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Floor {classroom.floor}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Capacity:</span> {classroom.capacity} people
          </p>
          {classroom.amenities && classroom.amenities.length > 0 && (
            <p>
              <span className="font-medium">Amenities:</span> {classroom.amenities.join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
