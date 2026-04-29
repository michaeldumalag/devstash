'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  ChevronDown,
  Settings,
  PanelLeft,
} from 'lucide-react';
import { useSidebarContext } from './sidebar-context';
import type { ItemTypeWithCount } from '@/lib/db/items';
import type { SidebarCollection } from '@/lib/db/collections';

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

interface SidebarProps {
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollection[];
}

export function Sidebar({ itemTypes, collections }: SidebarProps) {
  const { collapsed, onToggle } = useSidebarContext();
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.filter((c) => !c.isFavorite);

  return (
    <div
      className={`flex flex-col h-full shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200 ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Collapse toggle — desktop only */}
      {onToggle && (
        <div className={`flex items-center shrink-0 border-b border-sidebar-border px-2 py-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="text-xs font-medium text-sidebar-foreground/50 pl-1">Navigation</span>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Types section */}
        <div>
          {!collapsed && (
            <button
              onClick={() => setTypesOpen(!typesOpen)}
              className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            >
              Types
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-150 ${typesOpen ? '' : '-rotate-90'}`}
              />
            </button>
          )}

          {(typesOpen || collapsed) && (
            <nav className="mt-1 space-y-0.5 px-1">
              {itemTypes.map((type) => {
                const Icon = ICON_MAP[type.icon as IconName];
                const label = `${type.name}s`;

                return (
                  <Link
                    key={type.id}
                    href={`/items/${label}`}
                    title={collapsed ? label : undefined}
                    className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors ${
                      collapsed ? 'justify-center' : ''
                    }`}
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 shrink-0" style={{ color: type.color }} />
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1 capitalize">{label}</span>
                        <span className="text-xs text-sidebar-foreground/40">{type.count}</span>
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Collections section */}
        {!collapsed && (
          <div className="mt-4">
            <button
              onClick={() => setCollectionsOpen(!collectionsOpen)}
              className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            >
              Collections
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-150 ${collectionsOpen ? '' : '-rotate-90'}`}
              />
            </button>

            {collectionsOpen && (
              <div className="mt-1">
                {/* Favorites */}
                {favoriteCollections.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-1.5 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
                      Favorites
                    </p>
                    <nav className="space-y-0.5 px-1">
                      {favoriteCollections.map((col) => (
                        <Link
                          key={col.id}
                          href={`/collections/${col.id}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                          <span className="flex-1 truncate">{col.name}</span>
                          <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                        </Link>
                      ))}
                    </nav>
                  </>
                )}

                {/* Recents */}
                {recentCollections.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-3 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
                      Recent
                    </p>
                    <nav className="space-y-0.5 px-1">
                      {recentCollections.map((col) => (
                        <Link
                          key={col.id}
                          href={`/collections/${col.id}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                          <span className="flex-1 truncate">{col.name}</span>
                          {col.dominantColor && (
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: col.dominantColor }}
                            />
                          )}
                        </Link>
                      ))}
                    </nav>
                  </>
                )}

                {/* View all link */}
                <div className="px-1 pt-2">
                  <Link
                    href="/collections"
                    className="flex items-center rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                  >
                    View all collections
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User avatar area */}
      <div
        className={`border-t border-sidebar-border p-2 flex items-center gap-2 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="h-7 w-7 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-semibold text-sidebar-primary-foreground shrink-0">
          MD
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">Michael Dumalag</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">michael.dumalag@gmail.com</p>
            </div>
            <Link
              href="/settings"
              className="p-1 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}