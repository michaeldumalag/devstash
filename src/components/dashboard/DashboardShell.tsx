'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, PanelLeft, X } from 'lucide-react';
import { SidebarContext } from './sidebar-context';

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarSlot: React.ReactNode;
}

export function DashboardShell({ children, sidebarSlot }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile: open drawer */}
          <button
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          {/* App icon + wordmark */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white tracking-tight select-none">
              DS
            </div>
            <span className="text-lg font-semibold tracking-tight text-primary">DevStash</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 flex items-center max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-8 h-8 text-sm bg-muted border-0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 hidden sm:flex">
            New Collection
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Item</span>
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 flex flex-col md:hidden transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-3 h-12 border-b border-sidebar-border bg-sidebar shrink-0">
            <span className="text-sm font-semibold text-sidebar-foreground">DevStash</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SidebarContext.Provider value={{ collapsed: false, onToggle: undefined }}>
              {sidebarSlot}
            </SidebarContext.Provider>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <SidebarContext.Provider value={{ collapsed: desktopCollapsed, onToggle: () => setDesktopCollapsed((v) => !v) }}>
            {sidebarSlot}
          </SidebarContext.Provider>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}