import Link from 'next/link';
import { getRecentCollections } from '@/lib/db/collections';
import { getPinnedItems, getRecentItems } from '@/lib/db/items';
import { StatsCards } from './StatsCards';
import { CollectionCard } from './CollectionCard';
import { ItemRow } from './ItemRow';

export async function DashboardMain() {
  const [recentCollections, pinnedItems, recentItems] = await Promise.all([
    getRecentCollections(),
    getPinnedItems(),
    getRecentItems(),
  ]);

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Recent Collections */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Collections</h2>
          <Link href="/collections" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentCollections.map((col) => (
            <CollectionCard
              key={col.id}
              id={col.id}
              name={col.name}
              description={col.description}
              itemCount={col.itemCount}
              isFavorite={col.isFavorite}
              dominantColor={col.dominantColor}
              typeIcons={col.typeIcons}
            />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">Pinned</h2>
          <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {pinnedItems.map((item) => (
              <ItemRow
                key={item.id}
                title={item.title}
                description={item.description}
                typeIcon={item.typeIcon}
                typeColor={item.typeColor}
                typeName={item.typeName}
                tags={item.tags}
                isFavorite={item.isFavorite}
                isPinned={item.isPinned}
                createdAt={item.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Recent Items</h2>
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {recentItems.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={item.description}
              typeIcon={item.typeIcon}
              typeColor={item.typeColor}
              typeName={item.typeName}
              tags={item.tags}
              isFavorite={item.isFavorite}
              isPinned={item.isPinned}
              createdAt={item.createdAt}
            />
          ))}
        </div>
      </section>
    </div>
  );
}