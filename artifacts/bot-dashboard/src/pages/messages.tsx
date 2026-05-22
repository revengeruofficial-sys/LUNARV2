import { useState } from "react";
import { useGetMessageStats, getGetMessageStatsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { shortId } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare } from "lucide-react";

export default function Messages() {
  const [search, setSearch] = useState("");

  const { data: stats, isLoading } = useGetMessageStats({
    query: {
      queryKey: getGetMessageStatsQueryKey(),
      enabled: true,
      refetchInterval: 30000,
    },
  });

  const filtered = stats?.filter((s) =>
    s.userId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="page-messages">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Message Leaderboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {stats ? `${stats.length} tracked users` : "Loading..."}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user ID..."
            className="pl-9 bg-card border-card-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-messages"
          />
        </div>
      </div>

      <Card className="bg-card border-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="text-right">Daily</TableHead>
                <TableHead className="text-right">Weekly</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right font-bold text-primary">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-card-border">
                    <TableCell className="text-center"><Skeleton className="h-5 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered?.length === 0 ? (
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((stat, index) => {
                  const globalRank = stats?.findIndex((s) => s.userId === stat.userId) ?? index;
                  return (
                    <TableRow
                      key={stat.userId}
                      className="border-card-border hover:bg-secondary/40 transition-colors"
                      data-testid={`row-message-${stat.userId}`}
                    >
                      <TableCell className="text-center font-bold text-muted-foreground font-mono text-sm">
                        {globalRank + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{shortId(stat.userId)}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{stat.daily.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{stat.weekly.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{stat.monthly.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold text-primary font-mono">{stat.total.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
