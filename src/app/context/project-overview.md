## DevStash Project Specifications

🚀 **Centralized Developer Knowledge Hub** for code snippets, AI prompts, docs, commands & more.

---

# DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all dev knowledge & resources.**

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Target Users](#target-users)
3. [Feature Set](#feature-set)
4. [Data Models](#data-models)
5. [Prisma Schema](#prisma-schema)
6. [Tech Stack](#tech-stack)
7. [Monetization](#monetization)
8. [UI/UX Guidelines](#uiux-guidelines)
9. [Item Type Reference](#item-type-reference)
10. [URL Structure](#url-structure)
11. [Architecture Diagram](#architecture-diagram)
12. [Development Notes](#development-notes)

---

## Problem Statement

Developers fragment their essential knowledge across too many tools:

| Where it lives now | What gets lost there |
|--------------------|----------------------|
| VS Code / Notion | Code snippets |
| Chat history | AI prompts & context |
| Browser bookmarks | Useful links |
| Random folders | Docs & files |
| `.txt` files | Terminal commands |
| GitHub Gists | Project templates |
| Bash history | One-off commands |

This creates constant context switching, lost knowledge, and inconsistent workflows. **DevStash fixes this with a single, unified hub.**

---

## Target Users

| User Type | Core Need |
|-----------|-----------|
| **Everyday Developer** | Fast access to snippets, prompts, commands, and links |
| **AI-First Developer** | Organize prompts, context files, system messages, and workflows |
| **Content Creator / Educator** | Store code blocks, explanations, and course notes |
| **Full-Stack Builder** | Collect patterns, boilerplates, and API examples |

---

## Feature Set

### A. Items & Item Types

Each item has a **type** that controls its behavior and appearance. Types are either **system** (built-in, non-editable) or **custom** (user-created, Pro).

**System Types:**

| Type | Content Kind | Route | Pro Only |
|------|-------------|-------|----------|
| `snippet` | text | `/items/snippets` | No |
| `prompt` | text | `/items/prompts` | No |
| `note` | text | `/items/notes` | No |
| `command` | text | `/items/commands` | No |
| `link` | url | `/items/links` | No |
| `file` | file | `/items/files` | ✅ Yes |
| `image` | file | `/items/images` | ✅ Yes |

- Items are created and accessed via a **slide-in drawer** for speed
- Content types: `text`, `url`, `file`

---

### B. Collections

- Users create named collections (e.g., "React Patterns", "Interview Prep")
- Collections can contain **any mix of item types**
- A single item can belong to **multiple collections**
- Collections have an optional `defaultTypeId` for new items added without an explicit type

---

### C. Search

Full-text search across:
- Item **title**
- Item **content**
- **Tags**
- **Type** filter

---

### D. Authentication

- Email/password
- GitHub OAuth
- Powered by **NextAuth v5**

---

### E. Core Features

- ⭐ Favorite collections and items
- 📌 Pin items to top
- 🕐 Recently used items
- 📥 Import code from a file
- ✍️ Markdown editor for text-type items
- 📁 File upload for `file` / `image` types
- 📤 Export data (JSON / ZIP)
- 🌙 Dark mode (default) / Light mode toggle
- 🔗 Add/remove items to/from multiple collections
- 👁️ View which collections an item belongs to

---

### F. AI Features (Pro Only)

- 🏷️ **Auto-tag suggestions** — AI suggests relevant tags on item creation
- 📝 **AI Summaries** — Summarize long notes or code files
- 🔍 **Explain This Code** — Plain-English code explanation
- ✨ **Prompt Optimizer** — Improve and refine AI prompts

---

## Data Models

### Entity Relationships

```
USER
 ├── many ITEMs
 ├── many COLLECTIONs
 └── many custom ITEMTYPEs

ITEM
 ├── belongs to one ITEMTYPE
 ├── many TAGs (via join)
 └── many COLLECTIONs (via ITEMCOLLECTION join table)

COLLECTION
 └── many ITEMs (via ITEMCOLLECTION join table)

ITEMTYPE
 ├── system types (user = null)
 └── custom types (user = owner)
```

### Field Notes

- `contentType` on `Item` is `text | file` — determines whether `content` or `fileUrl` is used
- `url` field is only populated for `link` type items
- `language` is optional metadata for syntax-highlighted code items
- `fileUrl` points to a Cloudflare R2 object URL

---

## Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// AUTH (NextAuth v5 adapter tables)
// ─────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─────────────────────────────────────────
// CORE MODELS
// ─────────────────────────────────────────

model User {
  id                   String       @id @default(cuid())
  name                 String?
  email                String?      @unique
  emailVerified        DateTime?
  image                String?
  isPro                Boolean      @default(false)
  stripeCustomerId     String?      @unique
  stripeSubscriptionId String?      @unique
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]   // custom types only
}

model ItemType {
  id       String @id @default(cuid())
  name     String // "snippet", "prompt", "command", etc.
  icon     String // Lucide icon name e.g. "Code", "Sparkles"
  color    String // hex color e.g. "#3b82f6"
  isSystem Boolean @default(false)

  userId String? // null for system types
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items       Item[]
  collections Collection[] @relation("DefaultType")

  @@unique([name, userId]) // system types: unique by name; custom: unique per user
}

model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType // text | file
  content     String?     @db.Text // null if file
  fileUrl     String?     // Cloudflare R2 URL, null if text
  fileName    String?     // original filename
  fileSize    Int?        // bytes
  url         String?     // only for link type
  description String?     @db.Text
  language    String?     // e.g. "ruby", "typescript" — for syntax highlighting
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  lastUsedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  tags        TagsOnItems[]
  collections ItemCollection[]
}

model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  isFavorite  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  defaultTypeId String?
  defaultType   ItemType? @relation("DefaultType", fields: [defaultTypeId], references: [id])

  items ItemCollection[]
}

// Join table: Item ↔ Collection (many-to-many)
model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

model Tag {
  id   String @id @default(cuid())
  name String @unique

  items TagsOnItems[]
}

// Join table: Item ↔ Tag (many-to-many)
model TagsOnItems {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum ContentType {
  text
  file
}
```

> ⚠️ **Never use `db push` in development or production.** Always generate and run migrations:
> ```bash
> npx prisma migrate dev --name <migration_name>
> npx prisma migrate deploy  # production
> ```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16 / React 19 | SSR + API routes in one repo |
| **Language** | TypeScript | Strict mode recommended |
| **Database** | Neon (PostgreSQL) | Serverless Postgres |
| **ORM** | Prisma 7 | Always fetch latest docs before migrations |
| **Caching** | Redis | Optional — evaluate per feature |
| **File Storage** | Cloudflare R2 | S3-compatible, no egress fees |
| **Auth** | NextAuth v5 | Email/password + GitHub OAuth |
| **AI** | OpenAI `gpt-4o-mini` | Auto-tagging, summaries, explain, optimizer |
| **Styling** | Tailwind CSS v4 + ShadCN UI | Dark mode default |

### Useful Docs

- [Prisma 7 Docs](https://www.prisma.io/docs)
- [NextAuth v5 Docs](https://authjs.dev)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [ShadCN UI](https://ui.shadcn.com)
- [Neon Docs](https://neon.tech/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## Monetization

> 💡 **During development:** All features are accessible to all users. Pro gates are stubbed but not enforced.

### Free Tier

- 50 items total
- 3 collections
- All system types **except** `file` and `image`
- Basic search
- No AI features
- No file/image uploads

### Pro — $8/month or $72/year

- Unlimited items & collections
- File & image uploads (Cloudflare R2)
- Custom item types *(coming later)*
- AI auto-tagging
- AI code explanation
- AI prompt optimizer
- Export data (JSON / ZIP)
- Priority support

### Implementation

Stripe fields are on the `User` model:
- `isPro` — boolean gate for Pro features
- `stripeCustomerId` — links user to Stripe
- `stripeSubscriptionId` — tracks active subscription

---

## UI/UX Guidelines

### General Principles

- Modern, minimal, developer-focused aesthetic
- **Dark mode by default**, light mode optional
- Clean typography with generous whitespace
- Subtle borders and shadows
- Inspired by: [Notion](https://notion.so), [Linear](https://linear.app), [Raycast](https://raycast.com)
- Syntax highlighting on all code blocks

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Sidebar (collapsible)     │  Main Content              │
│                            │                            │
│  ▸ Snippets                │  ┌──────┐ ┌──────┐        │
│  ▸ Commands                │  │Coll. │ │Coll. │        │
│  ▸ Prompts                 │  │ card │ │ card │        │
│  ▸ Notes                   │  └──────┘ └──────┘        │
│  ▸ Links                   │                            │
│  ───────────               │  Items (color-coded cards) │
│  Collections               │                            │
│  ▸ React Patterns          │                            │
│  ▸ Interview Prep          │                            │
└────────────────────────────────────────────────────────┘
```

- **Sidebar:** Item type nav links + recent collections. Becomes a **drawer** on mobile.
- **Main:** Color-coded collection cards (background tinted to dominant item type). Items display as color-coded cards (border color = type color).
- **Item detail:** Opens in a **slide-in drawer** (not a full page navigation).

### Micro-interactions

- Smooth transitions on drawer open/close
- Hover states on all cards
- Toast notifications for create / edit / delete / copy actions
- Loading skeletons on data fetch

---

## Item Type Reference

| Type | Icon | Color | Hex |
|------|------|-------|-----|
| Snippet | `Code` | Blue | `#3b82f6` |
| Prompt | `Sparkles` | Purple | `#8b5cf6` |
| Command | `Terminal` | Orange | `#f97316` |
| Note | `StickyNote` | Yellow | `#fde047` |
| File | `File` | Gray | `#6b7280` |
| Image | `Image` | Pink | `#ec4899` |
| Link | `Link` | Emerald | `#10b981` |

> All icons are from [Lucide React](https://lucide.dev).

---

## URL Structure

| Route | Description |
|-------|-------------|
| `/` | Dashboard / home |
| `/items/snippets` | All snippets |
| `/items/prompts` | All prompts |
| `/items/commands` | All commands |
| `/items/notes` | All notes |
| `/items/links` | All links |
| `/items/files` | All files (Pro) |
| `/items/images` | All images (Pro) |
| `/collections` | All collections |
| `/collections/[id]` | Single collection view |
| `/search` | Search results |
| `/settings` | User settings |
| `/settings/billing` | Subscription management |

---

## Architecture Diagram

```
                        ┌──────────────────────┐
                        │    Next.js 16 App     │
                        │  (SSR + API Routes)   │
                        └──────────┬───────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼───────┐  ┌─────────▼──────┐  ┌────────▼────────┐
     │  Neon Postgres  │  │ Cloudflare R2  │  │  OpenAI API     │
     │  (via Prisma)   │  │ (file uploads) │  │  gpt-4o-mini    │
     └────────────────┘  └────────────────┘  └─────────────────┘
              │
     ┌────────▼────────┐
     │  Redis (cache)  │
     │  (optional)     │
     └─────────────────┘

     Auth: NextAuth v5
     ├── Email/Password
     └── GitHub OAuth
```

---

## Development Notes

### Key Decisions

- **One repo** — Next.js handles both frontend and backend API routes, minimizing overhead
- **Prisma migrations only** — never `db push`. All schema changes go through versioned migration files
- **Freemium gates are stubbed** — `isPro` check in place, but not enforced during development so all features remain accessible
- **R2 for files** — no egress fees vs. S3; S3-compatible API means easy swap if needed
- **System types are seeded** — `ItemType` rows with `isSystem: true` are inserted via a Prisma seed script, not created by users

### Seed Script Responsibilities

- Create the 7 system `ItemType` records (`snippet`, `prompt`, `note`, `command`, `link`, `file`, `image`)
- All system types have `userId: null`

### Environment Variables Needed

```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# OpenAI
OPENAI_API_KEY=
```

### Screenshots

Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact.  Use it as a reference

- @context/screenshots/dashboard-ui-main.png
- @context/screenshots/dashboard-ui-drawer.png