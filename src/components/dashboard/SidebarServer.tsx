import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections } from '@/lib/db/collections';
import { getFirstUserId } from '@/lib/db/users';
import { Sidebar } from './Sidebar';

export async function SidebarServer() {
  const userId = await getFirstUserId();
  const [itemTypes, collections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ]);

  return <Sidebar itemTypes={itemTypes} collections={collections} />;
}