import { useGetBotStats, getGetBotStatsQueryKey } from "@workspace/api-client-react";
import { Shield, ShieldAlert, Gift, Activity, Users, Zap, MessageSquare, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetBotStats({
    query: {
      queryKey: getGetBotStatsQueryKey(),
      enabled: true,
      refetchInterval: 30000,
    },
  });

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value={stats?.caseCounter} icon={<Hash className="w-5 h-5 text-primary" />} loading={isLoading} />
        <StatCard title="Punishments Logged" value={stats?.totalPunishments} icon={<ShieldAlert className="w-5 h-5 text-destructive" />} loading={isLoading} />
        <StatCard title="Pending Reviews" value={stats?.pendingPunishments} icon={<Activity className="w-5 h-5 text-orange-500" />} loading={isLoading} />
        <StatCard title="Active Giveaways" value={stats?.activeGiveaways} icon={<Gift className="w-5 h-5 text-emerald-500" />} loading={isLoading} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Staff Members" value={stats?.totalStaff} icon={<Users className="w-5 h-5 text-blue-400" />} loading={isLoading} />
        <StatCard title="Staff Points Total" value={stats?.totalStaffPoints} icon={<Zap className="w-5 h-5 text-yellow-400" />} loading={isLoading} />
        <StatCard title="Total Giveaways" value={stats?.totalGiveaways} icon={<Gift className="w-5 h-5 text-purple-400" />} loading={isLoading} />
        <StatCard title="Tracked Users" value={stats?.totalTrackedUsers} icon={<MessageSquare className="w-5 h-5 text-cyan-400" />} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalPunishments ? (stats.approvedPunishments / stats.totalPunishments) * 100 : 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="font-bold text-emerald-400">{stats?.approvedPunishments ?? 0}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="font-bold text-orange-400">{stats?.pendingPunishments ?? 0}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold">{stats?.totalPunishments ?? 0}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 mt-2">
            {[
              { label: "Case Counter", value: stats?.caseCounter?.toLocaleString() },
              { label: "Total Staff Points", value: stats?.totalStaffPoints?.toLocaleString() },
              { label: "Giveaways Hosted", value: stats?.totalGiveaways?.toLocaleString() },
              { label: "Message Tracked Users", value: stats?.totalTrackedUsers?.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                <span className="text-sm text-foreground/80">{label}</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  <span className="font-mono font-bold text-foreground">{value ?? "0"}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string; value?: number; icon: React.ReactNode; loading: boolean }) {
  return (
    <Card className="bg-card border-card-border shadow-sm hover:-translate-y-0.5 transition-transform duration-200" data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground leading-tight">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-foreground">{value?.toLocaleString() ?? 0}</p>
            )}
          </div>
          <div className="p-2 bg-secondary/50 rounded-lg mt-0.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
