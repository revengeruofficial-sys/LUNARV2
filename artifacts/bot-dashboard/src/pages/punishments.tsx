import { useState } from "react";
import { useGetPunishments, getGetPunishmentsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { shortId, formatTimeAgo } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Punishments() {
  const [search, setSearch] = useState("");

  const { data: logs, isLoading } = useGetPunishments({
    query: {
      queryKey: getGetPunishmentsQueryKey(),
      enabled: true,
      refetchInterval: 30000,
    },
  });

  const filtered = logs?.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.target.toLowerCase().includes(q) ||
      log.moderator.toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q) ||
      log.type.toLowerCase().includes(q) ||
      log.status.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "pending":  return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      case "denied":   return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:         return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "ban":     return "text-destructive font-bold";
      case "timeout": return "text-orange-400 font-bold";
      case "warn":    return "text-yellow-400 font-bold";
      default:        return "text-foreground font-bold";
    }
  };

  return (
    <div className="space-y-6" data-testid="page-punishments">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Punishment Logs</h2>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {filtered?.length ?? 0} of {logs?.length ?? 0} entries
            </p>
          )}
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user, reason, type..."
            className="pl-9 bg-card border-card-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-punishments"
          />
        </div>
      </div>

      <Card className="bg-card border-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="w-24">Case ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Moderator</TableHead>
                <TableHead className="w-1/3">Reason</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-card-border">
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full max-w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered?.length === 0 ? (
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? `No results for "${search}"` : "No punishments found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-card-border hover:bg-secondary/40 transition-colors"
                    data-testid={`row-punishment-${log.id}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.id.slice(0, 10)}</TableCell>
                    <TableCell className={getTypeColor(log.type)}>{log.type.toUpperCase()}</TableCell>
                    <TableCell className="font-mono text-sm">{shortId(log.target)}</TableCell>
                    <TableCell className="font-mono text-sm">{shortId(log.moderator)}</TableCell>
                    <TableCell className="truncate max-w-xs text-sm" title={log.reason}>{log.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatTimeAgo(log.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={`border-none ${getStatusColor(log.status)}`} variant="outline">
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
