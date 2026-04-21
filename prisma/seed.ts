import 'dotenv/config';
import { PrismaClient, ContentType } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── System item types ────────────────────────────────────────────────────────

const systemTypes = [
  { name: 'snippet', icon: 'Code',       color: '#3b82f6' },
  { name: 'prompt',  icon: 'Sparkles',   color: '#8b5cf6' },
  { name: 'command', icon: 'Terminal',   color: '#f97316' },
  { name: 'note',    icon: 'StickyNote', color: '#fde047' },
  { name: 'file',    icon: 'File',       color: '#6b7280' },
  { name: 'image',   icon: 'Image',      color: '#ec4899' },
  { name: 'link',    icon: 'Link',       color: '#10b981' },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database...\n');

  // 1. System item types
  console.log('→ System item types');
  const typeMap: Record<string, string> = {};
  for (const t of systemTypes) {
    const existing = await prisma.itemType.findFirst({ where: { name: t.name, userId: null } });
    const type = existing ?? await prisma.itemType.create({
      data: { ...t, isSystem: true, userId: null },
    });
    typeMap[t.name] = type.id;
  }
  console.log(`  ✓ ${systemTypes.length} types`);

  // 2. Demo user
  console.log('→ Demo user');
  const passwordHash = await bcrypt.hash('12345678', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@devstash.io' },
    update: {},
    create: {
      email: 'demo@devstash.io',
      name: 'Demo User',
      isPro: false,
      emailVerified: new Date(),
      // password stored as a hashed string in the name field is wrong —
      // we store it in a separate field once auth is wired; for now store on user via a raw column isn't in schema.
      // We'll add a `password` field when auth is implemented. Hash logged for reference:
    },
  });
  console.log(`  ✓ ${user.email} (id: ${user.id})`);
  // Log hash so it can be used when auth is wired up
  console.log(`  ✓ Password hash (store when auth schema is added): ${passwordHash}`);

  // 3. Collections and items
  console.log('→ Collections & items');

  // ── React Patterns ──────────────────────────────────────────────────────────
  const reactPatterns = await prisma.collection.upsert({
    where: { id: 'seed-col-react-patterns' },
    update: {},
    create: {
      id: 'seed-col-react-patterns',
      name: 'React Patterns',
      description: 'Reusable React patterns and hooks',
      isFavorite: true,
      userId: user.id,
      defaultTypeId: typeMap.snippet,
    },
  });

  const reactItems = [
    {
      id: 'seed-item-use-debounce',
      title: 'useDebounce Hook',
      description: 'Delays updating a value until after a specified wait time',
      content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
      language: 'typescript',
      tags: ['react', 'hooks', 'performance'],
      isPinned: true,
      isFavorite: true,
    },
    {
      id: 'seed-item-context-provider',
      title: 'Compound Component Pattern',
      description: 'Context-based compound component with typed sub-components',
      content: `import { createContext, useContext, useState, ReactNode } from 'react';

interface AccordionContextValue {
  openItem: string | null;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('useAccordion must be used within Accordion');
  return ctx;
}

function Accordion({ children }: { children: ReactNode }) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const toggle = (id: string) => setOpenItem(prev => prev === id ? null : id);
  return (
    <AccordionContext value={{ openItem, toggle }}>
      {children}
    </AccordionContext>
  );
}

function AccordionItem({ id, children }: { id: string; children: ReactNode }) {
  const { openItem, toggle } = useAccordion();
  return (
    <div>
      <button onClick={() => toggle(id)}>Toggle</button>
      {openItem === id && <div>{children}</div>}
    </div>
  );
}

Accordion.Item = AccordionItem;
export { Accordion };`,
      language: 'typescript',
      tags: ['react', 'patterns', 'compound-components'],
      isPinned: false,
      isFavorite: false,
    },
    {
      id: 'seed-item-use-local-storage',
      title: 'useLocalStorage Hook',
      description: 'Sync state to localStorage with SSR safety',
      content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
      language: 'typescript',
      tags: ['react', 'hooks', 'localStorage'],
      isPinned: false,
      isFavorite: true,
    },
  ];

  for (const item of reactItems) {
    const { tags, ...data } = item;
    const created = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...data,
        contentType: ContentType.text,
        userId: user.id,
        itemTypeId: typeMap.snippet,
        tags: {
          create: await Promise.all(tags.map(async (name) => {
            const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
            return { tagId: tag.id };
          })),
        },
      },
    });
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: created.id, collectionId: reactPatterns.id } },
      update: {},
      create: { itemId: created.id, collectionId: reactPatterns.id },
    });
  }
  console.log(`  ✓ React Patterns (${reactItems.length} snippets)`);

  // ── AI Workflows ────────────────────────────────────────────────────────────
  const aiWorkflows = await prisma.collection.upsert({
    where: { id: 'seed-col-ai-workflows' },
    update: {},
    create: {
      id: 'seed-col-ai-workflows',
      name: 'AI Workflows',
      description: 'AI prompts and workflow automations',
      isFavorite: true,
      userId: user.id,
      defaultTypeId: typeMap.prompt,
    },
  });

  const aiItems = [
    {
      id: 'seed-item-code-review-prompt',
      title: 'Code Review Prompt',
      description: 'Thorough code review covering bugs, performance, and best practices',
      content: `You are an expert software engineer. Review the following code and provide structured feedback covering:

1. **Bugs & Logic Errors** — Any incorrect behavior or edge cases
2. **Performance** — Unnecessary re-renders, expensive operations, or memory leaks
3. **Security** — Injection risks, exposed secrets, or unsafe operations
4. **Readability** — Naming, structure, and clarity
5. **Best Practices** — Patterns, conventions, and idiomatic usage

Be specific and include line references. Suggest improved code where applicable.

\`\`\`
{PASTE_CODE_HERE}
\`\`\``,
      tags: ['ai', 'code-review', 'prompts'],
      isPinned: true,
      isFavorite: true,
    },
    {
      id: 'seed-item-docs-prompt',
      title: 'Documentation Generator',
      description: 'Generate JSDoc/TSDoc comments for functions and classes',
      content: `Generate comprehensive JSDoc/TSDoc documentation for the following code. Include:

- A clear one-line summary
- @param descriptions with types
- @returns description with type
- @throws if applicable
- @example with a practical usage example

Keep descriptions concise but informative. Use the existing code style as a reference.

\`\`\`typescript
{PASTE_CODE_HERE}
\`\`\``,
      tags: ['ai', 'documentation', 'prompts'],
      isPinned: false,
      isFavorite: false,
    },
    {
      id: 'seed-item-refactor-prompt',
      title: 'Refactoring Assistant',
      description: 'Refactor code for clarity, maintainability, and modern patterns',
      content: `Refactor the following code with these goals:

- **Simplify** — Remove unnecessary complexity and reduce nesting
- **Modernize** — Use current language features and patterns
- **Decompose** — Break large functions into focused, single-responsibility units
- **Type safety** — Improve TypeScript types where applicable
- **No behavior changes** — Functional output must remain identical

Explain each change briefly. Show the refactored code in full.

\`\`\`
{PASTE_CODE_HERE}
\`\`\``,
      tags: ['ai', 'refactoring', 'prompts'],
      isPinned: false,
      isFavorite: false,
    },
  ];

  for (const item of aiItems) {
    const { tags, ...data } = item;
    const created = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...data,
        contentType: ContentType.text,
        userId: user.id,
        itemTypeId: typeMap.prompt,
        tags: {
          create: await Promise.all(tags.map(async (name) => {
            const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
            return { tagId: tag.id };
          })),
        },
      },
    });
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: created.id, collectionId: aiWorkflows.id } },
      update: {},
      create: { itemId: created.id, collectionId: aiWorkflows.id },
    });
  }
  console.log(`  ✓ AI Workflows (${aiItems.length} prompts)`);

  // ── DevOps ──────────────────────────────────────────────────────────────────
  const devops = await prisma.collection.upsert({
    where: { id: 'seed-col-devops' },
    update: {},
    create: {
      id: 'seed-col-devops',
      name: 'DevOps',
      description: 'Infrastructure and deployment resources',
      isFavorite: false,
      userId: user.id,
      defaultTypeId: typeMap.snippet,
    },
  });

  const devopsItems = [
    {
      id: 'seed-item-dockerfile',
      title: 'Next.js Dockerfile',
      description: 'Multi-stage Docker build for a Next.js app with standalone output',
      typeKey: 'snippet' as const,
      content: `FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]`,
      language: 'dockerfile',
      tags: ['docker', 'nextjs', 'devops'],
      isPinned: false,
      isFavorite: false,
    },
    {
      id: 'seed-item-deploy-script',
      title: 'Zero-downtime Deploy',
      description: 'Pull latest, migrate database, restart app with zero downtime',
      typeKey: 'command' as const,
      content: `git pull origin main && npm ci --omit=dev && npx prisma migrate deploy && pm2 reload all --update-env`,
      language: null,
      tags: ['deploy', 'devops', 'pm2'],
      isPinned: false,
      isFavorite: false,
    },
    {
      id: 'seed-item-neon-docs',
      title: 'Neon Postgres Docs',
      description: 'Official Neon serverless Postgres documentation',
      typeKey: 'link' as const,
      content: null,
      url: 'https://neon.tech/docs',
      language: null,
      tags: ['neon', 'postgres', 'docs'],
      isPinned: false,
      isFavorite: false,
    },
    {
      id: 'seed-item-prisma-docs',
      title: 'Prisma ORM Docs',
      description: 'Prisma ORM documentation including Prisma 7 migration guide',
      typeKey: 'link' as const,
      content: null,
      url: 'https://www.prisma.io/docs',
      language: null,
      tags: ['prisma', 'orm', 'docs'],
      isPinned: false,
      isFavorite: false,
    },
  ];

  for (const item of devopsItems) {
    const { tags, typeKey, ...data } = item;
    const created = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...data,
        contentType: ContentType.text,
        userId: user.id,
        itemTypeId: typeMap[typeKey],
        tags: {
          create: await Promise.all(tags.map(async (name) => {
            const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
            return { tagId: tag.id };
          })),
        },
      },
    });
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: created.id, collectionId: devops.id } },
      update: {},
      create: { itemId: created.id, collectionId: devops.id },
    });
  }
  console.log(`  ✓ DevOps (${devopsItems.length} items)`);

  // ── Terminal Commands ───────────────────────────────────────────────────────
  const terminalCmds = await prisma.collection.upsert({
    where: { id: 'seed-col-terminal-commands' },
    update: {},
    create: {
      id: 'seed-col-terminal-commands',
      name: 'Terminal Commands',
      description: 'Useful shell commands for everyday development',
      isFavorite: false,
      userId: user.id,
      defaultTypeId: typeMap.command,
    },
  });

  const commandItems = [
    {
      id: 'seed-item-git-undo',
      title: 'Git — Undo Last Commit',
      description: 'Undo the last commit but keep changes staged',
      content: 'git reset --soft HEAD~1',
      tags: ['git', 'undo'],
    },
    {
      id: 'seed-item-docker-clean',
      title: 'Docker — Remove All Stopped Containers',
      description: 'Prune stopped containers, unused images, networks, and build cache',
      content: 'docker system prune -af --volumes',
      tags: ['docker', 'cleanup'],
    },
    {
      id: 'seed-item-kill-port',
      title: 'Kill Process on Port',
      description: 'Find and kill whatever is listening on a given port',
      content: 'lsof -ti tcp:3000 | xargs kill -9',
      tags: ['process', 'port', 'shell'],
    },
    {
      id: 'seed-item-npm-outdated',
      title: 'Check Outdated Packages',
      description: 'List all outdated npm dependencies and interactively update them',
      content: 'npx npm-check-updates -i',
      tags: ['npm', 'dependencies', 'updates'],
    },
  ];

  for (const item of commandItems) {
    const { tags, ...data } = item;
    const created = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...data,
        contentType: ContentType.text,
        userId: user.id,
        itemTypeId: typeMap.command,
        language: null,
        isPinned: false,
        isFavorite: false,
        tags: {
          create: await Promise.all(tags.map(async (name) => {
            const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
            return { tagId: tag.id };
          })),
        },
      },
    });
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: created.id, collectionId: terminalCmds.id } },
      update: {},
      create: { itemId: created.id, collectionId: terminalCmds.id },
    });
  }
  console.log(`  ✓ Terminal Commands (${commandItems.length} commands)`);

  // ── Design Resources ────────────────────────────────────────────────────────
  const designResources = await prisma.collection.upsert({
    where: { id: 'seed-col-design-resources' },
    update: {},
    create: {
      id: 'seed-col-design-resources',
      name: 'Design Resources',
      description: 'UI/UX resources and references',
      isFavorite: false,
      userId: user.id,
      defaultTypeId: typeMap.link,
    },
  });

  const designLinks = [
    {
      id: 'seed-item-tailwind-docs',
      title: 'Tailwind CSS Docs',
      description: 'Official Tailwind CSS utility-first framework documentation',
      url: 'https://tailwindcss.com/docs',
      tags: ['tailwind', 'css', 'docs'],
    },
    {
      id: 'seed-item-shadcn-ui',
      title: 'shadcn/ui Components',
      description: 'Beautifully designed components built with Radix and Tailwind',
      url: 'https://ui.shadcn.com',
      tags: ['shadcn', 'components', 'ui'],
    },
    {
      id: 'seed-item-radix-ui',
      title: 'Radix UI Primitives',
      description: 'Unstyled, accessible component primitives for React',
      url: 'https://www.radix-ui.com',
      tags: ['radix', 'accessibility', 'components'],
    },
    {
      id: 'seed-item-lucide-icons',
      title: 'Lucide Icons',
      description: 'Beautiful and consistent open-source icon library',
      url: 'https://lucide.dev/icons',
      tags: ['icons', 'lucide', 'ui'],
    },
  ];

  for (const item of designLinks) {
    const { tags, url, ...data } = item;
    const created = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...data,
        url,
        content: null,
        contentType: ContentType.text,
        userId: user.id,
        itemTypeId: typeMap.link,
        language: null,
        isPinned: false,
        isFavorite: false,
        tags: {
          create: await Promise.all(tags.map(async (name) => {
            const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
            return { tagId: tag.id };
          })),
        },
      },
    });
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: created.id, collectionId: designResources.id } },
      update: {},
      create: { itemId: created.id, collectionId: designResources.id },
    });
  }
  console.log(`  ✓ Design Resources (${designLinks.length} links)`);

  console.log('\nSeed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());