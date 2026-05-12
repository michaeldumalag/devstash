import { Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon } from 'lucide-react';

export const ICON_MAP = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const;

export type IconName = keyof typeof ICON_MAP;
