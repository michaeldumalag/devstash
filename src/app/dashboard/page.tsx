import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="text-primary">DevStash</span>
        </div>
        <div className="flex-1 flex items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-8 h-8 text-sm bg-muted border-0"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            New Collection
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Item
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar placeholder */}
        <aside className="w-56 border-r border-border shrink-0 p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Sidebar</h2>
        </aside>

        {/* Main placeholder */}
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Main</h2>
        </main>
      </div>
    </div>
  );
}
