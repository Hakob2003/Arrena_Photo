"use client";

import { useState, useEffect } from "react";
import { adminSecurityApi, SecurityEvent } from "@/lib/admin.security.api";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, ShieldAlert, Ban, Globe2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LiveMonitor({
  initialEvents,
}: {
  initialEvents: SecurityEvent[];
}) {
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Poll for live events every 3 seconds as requested
    const fetchLiveEvents = async () => {
      try {
        const latestEvents = await adminSecurityApi.getEvents(20);
        setEvents(latestEvents);
      } catch (error) {
        console.error("Live monitor poll failed:", error);
      }
    };

    const interval = setInterval(fetchLiveEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 90) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (score >= 70)
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4 animate-pulse text-green-500" />
        Live Monitoring Active — Polling every 3s
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Attack Type</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No security events detected recently.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id} className="group">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                      {event.attackType}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {event.ip}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Globe2 className="h-3 w-3 text-muted-foreground" />
                      {event.city ? `${event.city}, ` : ""}
                      {event.country || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">
                    {event.endpoint}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRiskColor(event.riskScore)}
                    >
                      {event.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.isBlocked ? (
                      <Badge
                        variant="destructive"
                        className="flex w-max items-center gap-1"
                      >
                        <Ban className="h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Allowed</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
