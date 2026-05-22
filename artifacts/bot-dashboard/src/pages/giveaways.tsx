import { useGetGiveaways, getGetGiveawaysQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { shortId, formatTimeAgo } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Pause, CheckCircle } from "lucide-react";

export default function Giveaways() {
  const { data: giveaways, isLoading } = useGetGiveaways({
    query: {
      queryKey: getGetGiveawaysQueryKey(),
      enabled: true,
    }
  });

  return (
    <div className="space-y-6" data-testid="page-giveaways">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Giveaway History</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-card border-card-border overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : giveaways?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-lg">
            No giveaways found.
          </div>
        ) : (
          giveaways?.map((giveaway) => (
            <Card key={giveaway.id} className="bg-card border-card-border overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2" title={giveaway.prize}>
                    {giveaway.prize}
                  </h3>
                  {giveaway.ended ? (
                    <Badge variant="outline" className="bg-secondary text-muted-foreground border-none flex-shrink-0">
                      Ended
                    </Badge>
                  ) : giveaway.paused ? (
                    <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-none flex-shrink-0">
                      Paused
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-none flex-shrink-0 animate-pulse">
                      Active
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 mt-auto text-sm">
                  <div className="flex justify-between items-center text-muted-foreground border-b border-border/40 pb-2">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Host</span>
                    <span className="font-mono">{shortId(giveaway.host)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground border-b border-border/40 pb-2">
                    <span className="flex items-center gap-2"><TrophyIcon className="w-4 h-4" /> Winners</span>
                    <span className="font-mono font-medium">{giveaway.winnerCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground border-b border-border/40 pb-2">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Entries</span>
                    <span className="font-mono">{giveaway.entryCount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground pt-1">
                    <span className="flex items-center gap-2">
                      {giveaway.ended ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {giveaway.ended ? "Ended" : "Ends"}
                    </span>
                    <span className="font-medium text-foreground">
                      {giveaway.endAt ? formatTimeAgo(giveaway.endAt) : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 6 3 7 6 7s6-1 6-7V2Z" />
    </svg>
  );
}
