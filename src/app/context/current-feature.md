## Prisma + Neon PostgreSQL Setup

Set up Prisma 7 ORM with Neon PostgreSQL (serverless). Includes full schema, NextAuth adapter models, indexes, cascade deletes, and a seed script for system item types.

## Status

In Progress

## Goals

- Install and configure Prisma 7 with Neon PostgreSQL
- Write the full schema based on project-overview.md (User, Item, ItemType, Collection, ItemCollection, Tag, TagsOnItems, Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Create the initial migration (never db push)
- Write a seed script for the 7 system ItemType records
- Configure DATABASE_URL via environment variable

## References

- @context/project-overview.md
- @context/coding-standards.md
- @context/features/database-spec.md
- Prisma 7 upgrade guide: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma quickstart: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres

## Notes

- Always use `npx prisma migrate dev --name <name>` for development — never `db push`
- Development branch maps to `DATABASE_URL`, production uses a separate branch
- Prisma 7 has breaking changes — read the full upgrade guide before implementation
- System ItemTypes have `isSystem: true` and `userId: null` — seeded, never user-created

# Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated.  Earliest to latest -->

- **2026-03-25** — Initial Next.js and Tailwind CSS setup. Removed default Next.js public assets, added project context docs, configured CLAUDE.md.
- **2026-04-01** — Started Dashboard UI Phase 1.
- **2026-04-01** — Completed Dashboard UI Phase 1. Set up ShadCN UI, dashboard route, global styles, dark mode, top bar with search and new item button, and sidebar/main area placeholders.
- **2026-04-01** — Started Dashboard UI Phase 2.
- **2026-04-03** — Completed Dashboard UI Phase 2. Implemented collapsible sidebar with item type links and counts, favorite/recent collections, user avatar area, mobile drawer with backdrop, desktop collapse toggle with "Navigation" label, and DS app icon in the top bar.
- **2026-04-03** — Completed Dashboard UI Phase 3. Stats cards, recent collections grid, pinned items, and recent items list. ShadCN Card, Badge, and Button used throughout.
- **2026-04-03** — Started Prisma + Neon PostgreSQL setup.