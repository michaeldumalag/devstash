import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your developer knowledge hub</p>
      </div>
    </DashboardShell>
  );
}
