## Current Feature

Audit Quick Wins

## Status

In Progress

## Goals

Fixes from the 2026-05-12 codebase audit. All are low-risk, no schema changes, no new dependencies.

### 1. Add `userId` Scoping to All DB Query Functions (High)
All functions in `src/lib/db/items.ts` and `src/lib/db/collections.ts` currently have no `userId` filter — once auth lands every user will see every other user's data. Add a `userId: string` parameter to every query function and thread it into each `where` clause now, so the signatures are ready before auth is wired.

Functions to update:
- `getPinnedItems`, `getRecentItems`, `getDashboardStats` — `src/lib/db/items.ts`
- `getItemTypesWithCounts` — `src/lib/db/items.ts`
- `getSidebarCollections`, `getRecentCollections` — `src/lib/db/collections.ts`

Also update all callers (`DashboardMain`, `SidebarServer`, `StatsCards`) to pass a hardcoded placeholder userId (the seeded demo user's id) until real auth is implemented.

### 2. Runtime Guard on `DATABASE_URL` (Medium)
`src/lib/prisma.ts` uses `process.env.DATABASE_URL!` — if the env var is missing it throws an opaque Prisma error. Replace with an explicit check that throws a clear message at startup.

### 3. Remove `'use client'` From `CollectionCard` (Medium)
`src/components/dashboard/CollectionCard.tsx` has `'use client'` but uses no hooks, no state, and no browser APIs. Removing it allows server-side rendering for this subtree.

### 4. Use `select` Instead of `include` in `getItemTypesWithCounts` (Medium)
`src/lib/db/items.ts` — replace `include` with an explicit `select` to avoid fetching unused columns (`userId`, `isSystem`).

### 5. Extract `ICON_MAP` to Shared Utility (Low)
The same `ICON_MAP` constant is copy-pasted into three files:
- `src/components/dashboard/CollectionCard.tsx`
- `src/components/dashboard/ItemRow.tsx`
- `src/components/dashboard/Sidebar.tsx`

Extract to `src/lib/icon-map.ts` and import from there.

### 6. Move `formatDate` to `src/lib/utils.ts` (Low)
`src/components/dashboard/ItemRow.tsx` defines a `formatDate` utility inline. Move it to `src/lib/utils.ts`.

### 7. Remove Password Hash `console.log` From Seed Script (Low)
`prisma/seed.ts` logs the demo user's bcrypt hash to stdout. Remove the log.

## References

- Audit findings from code-scanner run on 2026-05-12

# Notes

For goal #1: use the seeded demo user's id as a hardcoded placeholder at call sites — we'll replace with real session user once NextAuth is implemented.

## History

<!-- Keep this updated.  Earliest to latest -->

- **2026-03-25** — Initial Next.js and Tailwind CSS setup. Removed default Next.js public assets, added project context docs, configured CLAUDE.md.
- **2026-04-01** — Started Dashboard UI Phase 1.
- **2026-04-01** — Completed Dashboard UI Phase 1. Set up ShadCN UI, dashboard route, global styles, dark mode, top bar with search and new item button, and sidebar/main area placeholders.
- **2026-04-01** — Started Dashboard UI Phase 2.
- **2026-04-03** — Completed Dashboard UI Phase 2. Implemented collapsible sidebar with item type links and counts, favorite/recent collections, user avatar area, mobile drawer with backdrop, desktop collapse toggle with "Navigation" label, and DS app icon in the top bar.
- **2026-04-03** — Completed Dashboard UI Phase 3. Stats cards, recent collections grid, pinned items, and recent items list. ShadCN Card, Badge, and Button used throughout.
- **2026-04-03** — Completed Prisma 7 + Neon PostgreSQL setup. Full schema, initial migration, system item type seed, and db test script.
- **2026-04-03** — Started Seed Data feature.
- **2026-04-21** — Completed Seed Data. Demo user, 7 system item types, 5 collections, 18 items, and 39 tags seeded. bcryptjs hash computed for future auth integration.
- **2026-04-21** — Started Dashboard Collections feature. Replacing mock collection data with real Prisma/Neon data.
- **2026-04-21** — Completed Dashboard Collections. Created `src/lib/db/collections.ts`, converted `DashboardMain` to async server component, updated `CollectionCard` with dominant-color left border strip and per-type icons at the bottom.
- **2026-04-21** — Started Dashboard Items feature. Replacing mock item data with real Prisma/Neon data for pinned and recent items.
- **2026-04-21** — Completed Dashboard Items. Created `src/lib/db/items.ts` (getPinnedItems, getRecentItems, getDashboardStats), updated ItemRow to use type icon/color from DB, updated StatsCards to be async server component with real counts, updated DashboardMain to fetch all data from Neon.
- **2026-04-22** — Started Stats & Sidebar feature. Wiring real DB data into stats cards and sidebar item types/collections.
- **2026-04-28** — Completed Stats & Sidebar. Added `getItemTypesWithCounts` and `getSidebarCollections` to DB layer; created `SidebarContext` for collapse state, `SidebarServer` async server component, and `sidebar-context.tsx`; refactored `Sidebar` to use real DB data with colored circles on recent collections and "View all collections" link; updated `DashboardShell` to accept `sidebarSlot` and provide context; updated `DashboardPage` to wire it all together.
- **2026-05-06** — Completed Add Pro Badge to Sidebar. Added a subtle PRO badge (ShadCN `Badge`, `outline` variant) next to the files and images item types in the sidebar. Conditional on `type.name === 'file' || 'image'`, hidden when sidebar is collapsed.
