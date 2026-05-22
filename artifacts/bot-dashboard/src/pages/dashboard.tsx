import { useGetBotStats, getGetBotStatsQueryKey } from "@workspace/api-client-react";
import { Shield, ShieldAlert, Gift, Activity, Users, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetBotStats({
    query: {
      queryKey: getGetBotStatsQueryKey(),
      enabled: true,
      refetchInterval: 30000,
    }
  });

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <StatCard 
          title="Total Punishments" 
          value={stats?.totalPunishments} 
          icon={<ShieldAlert className="w-5 h-5 text-destructive" />} 
          loading={isLoading}
        />
        <StatCard 
          title="Pending Reviews" 
          value={stats?.pendingPunishments} 
          icon={<Activity className="w-5 h-5 text-orange-500" />} 
          loading={isLoading}
        />
        <StatCard 
          title="Staff Members" 
          value={stats?.totalStaff} 
          icon={<Users className="w-5 h-5 text-primary" />} 
          loading={isLoading}
        />
        <StatCard 
          title="Active Giveaways" 
          value={stats?.activeGiveaways} 
          icon={<Gift className="w-5 h-5 text-emerald-500" />} 
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-foreground/80">Total Staff Points</span>
              {isLoading ? <Skeleton className="h-6 w-16" /> : <span className="font-mono font-bold text-lg">{stats?.totalStaffPoints?.toLocaleString() || 0}</span>}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-foreground/80">Approved Punishments</span>
              {isLoading ? <Skeleton className="h-6 w-16" /> : <span className="font-mono font-bold text-lg text-emerald-400">{stats?.approvedPunishments?.toLocaleString() || 0}</span>}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-foreground/80">Total Giveaways Hosted</span>
              {isLoading ? <Skeleton className="h-6 w-16" /> : <span className="font-mono font-bold text-lg">{stats?.totalGiveaways?.toLocaleString() || 0}</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Moderation Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    {stats?.totalPunishments && stats.totalPunishments > 0 
                      ? Math.round((stats.approvedPunishments / stats.totalPunishments) * 100) 
                      : 0}%
                  </span>
                  <span className="text-sm text-muted-foreground pb-1">approval rate</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${stats?.totalPunishments ? (stats.approvedPunishments / stats.totalPunishments) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  A high approval rate indicates that staff moderation actions are consistent with server guidelines and are generally upheld by senior reviewers.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value?: number, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card className="bg-card border-card-border shadow-sm hover:-translate-y-1 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-foreground">{value?.toLocaleString() || 0}</p>
            )}
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
