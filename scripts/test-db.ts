import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing database connection...\n');

  // Connection check
  await prisma.$queryRaw`SELECT 1`;
  console.log('✓ Connected to Neon PostgreSQL\n');

  // System item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: 'asc' },
  });
  console.log(`✓ System item types (${itemTypes.length}):`);
  for (const t of itemTypes) {
    console.log(`  - ${t.name} (${t.icon}, ${t.color})`);
  }

  // Demo user
  console.log('\n✓ Demo user:');
  const user = await prisma.user.findUnique({
    where: { email: 'demo@devstash.io' },
    include: {
      _count: { select: { items: true, collections: true } },
    },
  });
  if (!user) throw new Error('Demo user not found');
  console.log(`  - ${user.name} <${user.email}>`);
  console.log(`  - isPro: ${user.isPro} | emailVerified: ${user.emailVerified?.toISOString().split('T')[0]}`);
  console.log(`  - items: ${user._count.items} | collections: ${user._count.collections}`);

  // Collections with item counts
  console.log('\n✓ Collections:');
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { name: 'asc' },
  });
  for (const col of collections) {
    const fav = col.isFavorite ? ' ★' : '';
    console.log(`  - ${col.name}${fav} (${col._count.items} items) — ${col.description}`);
  }

  // Items with tags and type
  console.log('\n✓ Items:');
  const items = await prisma.item.findMany({
    where: { userId: user.id },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  for (const item of items) {
    const tags = item.tags.map((t) => t.tag.name).join(', ');
    const cols = item.collections.map((c) => c.collection.name).join(', ');
    const flags = [item.isPinned ? 'pinned' : '', item.isFavorite ? 'fav' : ''].filter(Boolean).join(', ');
    console.log(`  - [${item.itemType.name}] ${item.title}${flags ? ` (${flags})` : ''}`);
    console.log(`    tags: ${tags || 'none'} | collection: ${cols}`);
  }

  // Row counts summary
  const [users, totalItems, totalCollections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);
  console.log('\n✓ Row counts:');
  console.log(`  users: ${users} | items: ${totalItems} | collections: ${totalCollections} | tags: ${tags}`);

  console.log('\nAll checks passed.');
}

main()
  .catch((e) => {
    console.error('Database test failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
