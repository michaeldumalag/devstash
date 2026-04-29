'use client';

import { createContext, useContext } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  onToggle: (() => void) | undefined;
}

export const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  onToggle: undefined,
});

export function useSidebarContext() {
  return useContext(SidebarContext);
}