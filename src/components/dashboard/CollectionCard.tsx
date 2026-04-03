'use client';

import Link from 'next/link';
import { Star, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CollectionCardProps {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  isFavorite: boolean;
}

export function CollectionCard({ id, name, description, itemCount, isFavorite }: CollectionCardProps) {
  return (
    <Card className="group hover:bg-card/80 transition-colors">
      <Link href={`/collections/${id}`}>
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium text-sm truncate">{name}</span>
              {isFavorite && (
                <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.preventDefault()}
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">{itemCount} items</span>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-auto">{description}</p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}