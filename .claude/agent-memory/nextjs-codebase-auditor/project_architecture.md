---
name: DevStash Architecture Snapshot
description: Key architectural decisions, file structure, and anti-patterns found during the initial codebase audit (May 2026)
type: project
---

DevStash is an early-stage Next.js 16 + React 19 app with no auth implemented yet, no API routes, and no Server Actions. The entire codebase is a dashboard UI with Prisma DB queries in `src/lib/db/`.

**Why:** Auth, API routes, and Server Actions are on the roadmap but not yet built. Audit findings should not flag "missing auth" as a bug — it's a known intentional gap.

**How to apply:** When auditing, focus on what IS written. The only production-facing data layer is `src/lib/db/collections.ts` and `src/lib/db/items.ts`. No actions/ or api/ directories exist yet.

Key architectural facts:
- No NextAuth, no session checking anywhere — this is intentional during development per CLAUDE.md
- All DB queries run without `userId` filter — this is a security debt to flag but not a crash bug in current single-user dev state
- `CollectionCard` and `ItemRow` are `'use client'` but contain only static rendering logic — no hooks/interactivity except the MoreHorizontal button onClick
- User avatar in `Sidebar.tsx` is hardcoded (name + email) — no real auth session read
- Seed script uses `ContentType.text` for link-type items that have `url` but no `content` — mismatch with schema intent
- `getSidebarCollections` fetches ALL collections (no `take` limit, no `userId` filter)
- `getRecentCollections` fetches only top 6 but also lacks `userId` filter
- `getItemTypesWithCounts` counts ALL items across all users (no `userId` filter on the `_count`)
