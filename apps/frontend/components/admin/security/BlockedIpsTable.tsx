"use client";

import { useState, useEffect } from "react";
import { adminSecurityApi, BlockedIp } from "@/lib/admin.security.api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldBan, Unlock, Search, Globe2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BlockedIpsTable() {
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // New block form state
  const [ipToBlock, setIpToBlock] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchBlockedIps = async () => {
    try {
      setLoading(true);
      const data = await adminSecurityApi.getBlockedIps();
      setBlockedIps(data);
    } catch (error) {
      toast.error("Failed to load blocked IPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedIps();
  }, []);

  const handleUnblock = async (ip: string) => {
    try {
      await adminSecurityApi.unblockIp(ip);
      toast.success(`IP ${ip} has been unblocked`);
      setBlockedIps((prev) => prev.filter((b) => b.ip !== ip));
    } catch (error) {
      toast.error("Failed to unblock IP");
    }
  };

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipToBlock) return;

    try {
      await adminSecurityApi.blockIp(
        ipToBlock,
        blockReason || "Manual block by admin",
        true,
      );
      toast.success(`IP ${ipToBlock} blocked successfully`);
      setIsDialogOpen(false);
      setIpToBlock("");
      setBlockReason("");
      fetchBlockedIps();
    } catch (error) {
      toast.error("Failed to block IP");
    }
  };

  const filteredIps = blockedIps.filter(
    (b) =>
      b.ip.includes(searchTerm) ||
      (b.reason && b.reason.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search IPs or reasons..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <ShieldBan className="h-4 w-4" />
            Manually Block IP
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block IP Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualBlock} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  placeholder="e.g. 192.168.1.1"
                  value={ipToBlock}
                  onChange={(e) => setIpToBlock(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g. Repeated malicious login attempts"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Confirm Block
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Blocked At</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Loading blacklist...
                </TableCell>
              </TableRow>
            ) : filteredIps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No blocked IPs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredIps.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono font-medium">
                    {b.ip}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Globe2 className="h-3 w-3 text-muted-foreground" />
                      {b.country || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {b.reason || "No reason provided"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(b.blockedAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {b.isPermanent ? (
                      <Badge variant="destructive">Permanent</Badge>
                    ) : (
                      <Badge variant="secondary">
                        {b.expiresAt
                          ? `Expires in ${formatDistanceToNow(new Date(b.expiresAt))}`
                          : "Temporary"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(b.ip)}
                      className="gap-2"
                    >
                      <Unlock className="h-3 w-3" />
                      Unblock
                    </Button>
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
