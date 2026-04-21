'use client';

import Link from 'next/link';
import { Star, MoreHorizontal, Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ICON_MAP = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const;

type IconName = keyof typeof ICON_MAP;

interface CollectionCardProps {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  isFavorite: boolean;
  dominantColor?: string | null;
  typeIcons?: { icon: string; color: string }[];
}

export function CollectionCard({
  id,
  name,
  description,
  itemCount,
  isFavorite,
  dominantColor,
  typeIcons = [],
}: CollectionCardProps) {
  return (
    <Card className="group hover:bg-card/80 transition-colors p-0 gap-0">
      <Link href={`/collections/${id}`} className="flex">
        {dominantColor && (
          <div className="w-[3px] self-stretch shrink-0 rounded-l-xl" style={{ backgroundColor: dominantColor }} />
        )}
        <div className="p-4 flex flex-col gap-2 flex-1 min-w-0">
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
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}
          {typeIcons.length > 0 && (
            <div className="flex items-center gap-1.5 mt-auto pt-1">
              {typeIcons.map(({ icon, color }) => {
                const Icon = ICON_MAP[icon as IconName];
                if (!Icon) return null;
                return <Icon key={icon} className="h-3.5 w-3.5 shrink-0" style={{ color }} />;
              })}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}