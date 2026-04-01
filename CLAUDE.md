# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, liks and custom types.

**IMPORTANT:** Do not add Claude to any commit messages

## Context Files

Read the follwoing to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 (App Router, SSR + API routes) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + ShadCN UI (dark mode default) |
| Database | Neon (PostgreSQL) via Prisma 7 |
| Auth | NextAuth v5 — email/password + GitHub OAuth |
| File Storage | Cloudflare R2 (S3-compatible) |
| AI | OpenAI `gpt-4o-mini` |
| Payments | Stripe |

React Compiler is enabled (`reactCompiler: true` in `next.config.ts`).

## Architecture

Single Next.js repo — frontend and backend API routes colocated. No separate server.

**Core data relationships:**
- `User` owns many `Item`s and `Collection`s
- `Item` belongs to one `ItemType`, has many `Tag`s, and belongs to many `Collection`s (via `ItemCollection` join table)
- `ItemType` is either system (`isSystem: true`, `userId: null`) or custom (Pro users only)
- `Item.contentType` is `text | file` — determines whether `content` or `fileUrl` is used

**Item types** (seeded, not user-created): `snippet`, `prompt`, `note`, `command`, `link`, `file`, `image`

**URL structure:** `/items/[type]` for type views, `/collections/[id]` for collection views, `/search`, `/settings`, `/settings/billing`

**UI pattern:** Item detail and creation always open in a slide-in drawer — never full page navigation.

## Key Rules

**Database:** Never use `prisma db push`. All schema changes require versioned migrations:
```bash
npx prisma migrate dev --name <migration_name>   # development
npx prisma migrate deploy                         # production
```

**Pro gates:** `isPro` check on `User` model is in place but not enforced during development — all features remain accessible.

**System types:** Seeded via Prisma seed script (7 records with `isSystem: true`, `userId: null`). Never create these from user-facing code.

## Required Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
OPENAI_API_KEY=
```
