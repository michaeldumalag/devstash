import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardMain } from '@/components/dashboard/DashboardMain';
import { SidebarServer } from '@/components/dashboard/SidebarServer';

export default function DashboardPage() {
  return (
    <DashboardShell sidebarSlot={<SidebarServer />}>
      <DashboardMain />
    </DashboardShell>
  );
}