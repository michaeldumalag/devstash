import { getDashboardStats } from '@/lib/db/items';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, FolderOpen, Star, Bookmark } from 'lucide-react';

export async function StatsCards() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'Total Items', value: stats.totalItems, icon: Layers },
    { label: 'Collections', value: stats.totalCollections, icon: FolderOpen },
    { label: 'Favorite Items', value: stats.favoriteItems, icon: Star },
    { label: 'Favorite Collections', value: stats.favoriteCollections, icon: Bookmark },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
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