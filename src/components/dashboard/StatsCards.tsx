import { mockCollections, mockItems, mockItemTypeCounts } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, FolderOpen, Star, Bookmark } from 'lucide-react';

const totalItems = Object.values(mockItemTypeCounts).reduce((a, b) => a + b, 0);

const stats = [
  {
    label: 'Total Items',
    value: totalItems,
    icon: Layers,
  },
  {
    label: 'Collections',
    value: mockCollections.length,
    icon: FolderOpen,
  },
  {
    label: 'Favorite Items',
    value: mockItems.filter((i) => i.isFavorite).length,
    icon: Star,
  },
  {
    label: 'Favorite Collections',
    value: mockCollections.filter((c) => c.isFavorite).length,
    icon: Bookmark,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-2xl font-bold">{value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
