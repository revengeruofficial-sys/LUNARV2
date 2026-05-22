import { useGetStaffLeaderboard, getGetStaffLeaderboardQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { shortId } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Staff() {
  const { data: staffList, isLoading } = useGetStaffLeaderboard({
    query: {
      queryKey: getGetStaffLeaderboardQueryKey(),
      enabled: true,
    }
  });

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Award className="w-5 h-5 text-amber-700" />;
      default: return <span className="text-sm font-bold text-muted-foreground w-5 text-center inline-block">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-6" data-testid="page-staff">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Staff Leaderboard</h2>
      </div>

      <Card className="bg-card border-card-border overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-card-border hover:bg-transparent">
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Staff Member</TableHead>
              <TableHead className="text-right">Modlogs</TableHead>
              <TableHead className="text-right">Tickets</TableHead>
              <TableHead className="text-right">Giveaways</TableHead>
              <TableHead className="text-right">Strikes</TableHead>
              <TableHead className="text-right text-primary font-bold">Total Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-card-border">
                  <TableCell className="text-center"><Skeleton className="h-6 w-6 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : staffList?.length === 0 ? (
              <TableRow className="border-card-border hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No staff data available.
                </TableCell>
              </TableRow>
            ) : (
              staffList?.map((staff, index) => (
                <TableRow key={staff.userId} className="border-card-border hover:bg-secondary/40 transition-colors">
                  <TableCell className="text-center flex justify-center py-4">
                    {getRankIcon(index)}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {shortId(staff.userId)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono">{staff.modlogs}</TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono">{staff.tickets}</TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono">{staff.giveaways}</TableCell>
                  <TableCell className="text-right">
                    {staff.strikes > 0 ? (
                      <Badge variant="destructive" className="font-mono bg-destructive/20 text-destructive border-none">
                        <AlertTriangle className="w-3 h-3 mr-1" /> {staff.strikes}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground font-mono">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg font-mono">
                    {staff.total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
