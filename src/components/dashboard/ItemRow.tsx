import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Pin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface ItemRowProps {
  title: string;
  description: string | null;
  typeIcon: string;
  typeColor: string;
  typeName: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date | string;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ItemRow({ title, description, typeIcon, typeColor, typeName, tags, isFavorite, isPinned, createdAt }: ItemRowProps) {
  const Icon = ICON_MAP[typeIcon as IconName] ?? File;

  return (
    <div className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
      <div
        className="mt-0.5 h-8 w-8 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${typeColor}20` }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: typeColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{title}</span>
          {isFavorite && <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />}
          {isPinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-1 mt-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: `${typeColor}60`, color: typeColor }}>
            {typeName}
          </Badge>
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatDate(createdAt)}</span>
    </div>
  );
}
