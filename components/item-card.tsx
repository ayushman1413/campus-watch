"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ItemCardProps {
  item: any; // coming from Supabase
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <div className="absolute top-2 left-2">
          <Badge variant={item.status === "lost" ? "destructive" : "default"}>
            {item.status === "lost" ? "Lost" : "Found"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {item.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{item.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {item.item_date
                ? format(new Date(item.item_date), "MMM d, yyyy")
                : "No date"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/items/${item.id}`} className="w-full">
          <Button size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
