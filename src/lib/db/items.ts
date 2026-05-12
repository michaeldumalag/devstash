import { prisma } from '@/lib/prisma';

export type ItemWithMeta = {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  typeIcon: string;
  typeColor: string;
  typeName: string;
  tags: string[];
};

export type DashboardStats = {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
};

const itemSelect = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  itemType: {
    select: { icon: true, color: true, name: true },
  },
  tags: {
    select: { tag: { select: { name: true } } },
  },
} as const;

function mapItem(item: {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  itemType: { icon: string; color: string; name: string };
  tags: { tag: { name: string } }[];
}): ItemWithMeta {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    typeName: item.itemType.name,
    tags: item.tags.map((t) => t.tag.name),
  };
}

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true, userId },
    orderBy: { updatedAt: 'desc' },
    select: itemSelect,
  });
  return items.map(mapItem);
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithMeta[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: itemSelect,
  });
  return items.map(mapItem);
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { isFavorite: true, userId } }),
    prisma.collection.count({ where: { isFavorite: true, userId } }),
  ]);
  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

export type ItemTypeWithCount = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

const ITEM_TYPE_ORDER = ['snippet', 'prompt', 'command', 'note', 'file', 'image', 'link'];

export async function getItemTypesWithCounts(userId: string): Promise<ItemTypeWithCount[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: { where: { userId } } } },
    },
  });
  return types
    .map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    }))
    .sort((a, b) => {
      const ai = ITEM_TYPE_ORDER.indexOf(a.name);
      const bi = ITEM_TYPE_ORDER.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
}