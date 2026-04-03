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
  type_snippet: Code,
  type_prompt: Sparkles,
  type_command: Terminal,
  type_note: StickyNote,
  type_file: File,
  type_image: Image,
  type_link: LinkIcon,
} as const;

const COLOR_MAP = {
  type_snippet: '#3b82f6',
  type_prompt: '#8b5cf6',
  type_command: '#f97316',
  type_note: '#fde047',
  type_file: '#6b7280',
  type_image: '#ec4899',
  type_link: '#10b981',
} as const;

type ItemTypeId = keyof typeof ICON_MAP;

interface ItemRowProps {
  title: string;
  description: string;
  itemTypeId: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ItemRow({ title, description, itemTypeId, tags, isFavorite, isPinned, createdAt }: ItemRowProps) {
  const Icon = ICON_MAP[itemTypeId as ItemTypeId] ?? File;
  const color = COLOR_MAP[itemTypeId as ItemTypeId] ?? '#6b7280';

  return (
    <div className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg">
      <div
        className="mt-0.5 h-8 w-8 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
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
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatDate(createdAt)}</span>
    </div>
  );
}
