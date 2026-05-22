import { useLocation, Link } from "wouter";
import { LayoutDashboard, Gavel, ShieldAlert, Gift, Settings, MessageSquare } from "lucide-react";
import { cn } from "@/lib/format";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/punishments", label: "Punishments", icon: Gavel },
    { href: "/staff", label: "Staff Leaderboard", icon: ShieldAlert },
    { href: "/giveaways", label: "Giveaways", icon: Gift },
    { href: "/messages", label: "Message Stats", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/20">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-sidebar-foreground tracking-wide uppercase text-sm">Bot Control</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-3">
            Data Views
          </div>
          {navItems.map((item) => {
            const active = location === item.href || (location === "/" && item.href === "/dashboard");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                  active 
                    ? "bg-sidebar-primary/10 text-sidebar-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", active ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            {navItems.find(i => location.includes(i.href))?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">System Online</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
