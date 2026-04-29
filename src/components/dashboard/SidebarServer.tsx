import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections } from '@/lib/db/collections';
import { Sidebar } from './Sidebar';

export async function SidebarServer() {
  const [itemTypes, collections] = await Promise.all([
    getItemTypesWithCounts(),
    getSidebarCollections(),
  ]);

  return <Sidebar itemTypes={itemTypes} collections={collections} />;
}