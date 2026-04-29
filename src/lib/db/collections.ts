import { prisma } from '@/lib/prisma';

export type SidebarCollection = {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantColor: string | null;
};

export async function getSidebarCollections(): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: { select: { id: true, color: true } },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { count: number; color: string }>();
    for (const ic of col.items) {
      const { id, color } = ic.item.itemType;
      const existing = typeCounts.get(id);
      if (existing) existing.count++;
      else typeCounts.set(id, { count: 1, color });
    }

    let dominantColor: string | null = null;
    let maxCount = 0;
    for (const { count, color } of typeCounts.values()) {
      if (count > maxCount) { maxCount = count; dominantColor = color; }
    }

    return { id: col.id, name: col.name, isFavorite: col.isFavorite, dominantColor };
  });
}

export type CollectionWithStats = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string | null;
  typeIcons: { icon: string; color: string }[];
  updatedAt: Date;
};

export async function getRecentCollections(): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 6,
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: {
                select: { id: true, icon: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { count: number; icon: string; color: string }>();

    for (const ic of col.items) {
      const { id, icon, color } = ic.item.itemType;
      const existing = typeCounts.get(id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(id, { count: 1, icon, color });
      }
    }

    let dominantColor: string | null = null;
    let maxCount = 0;
    for (const { count, color } of typeCounts.values()) {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    }

    const typeIcons = [...typeCounts.values()].map(({ icon, color }) => ({ icon, color }));

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantColor,
      typeIcons,
      updatedAt: col.updatedAt,
    };
  });
}
