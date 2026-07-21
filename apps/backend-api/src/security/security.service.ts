import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as geoip from "geoip-lite";

export interface LogSecurityEventDto {
  ip: string;
  macAddress?: string | null;
  userId?: string | null;
  endpoint: string;
  method: string;
  attackType: string;
  riskScore: number;
  isBlocked: boolean;
  reason?: string | null;
  payloadHash?: string | null;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  // In-memory cache for fast lookups
  private blockedIpsCache: Set<string> = new Set();
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL_MS = 60000; // 1 minute

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  private async refreshCache() {
    try {
      const blocked = await this.prisma.blockedIp.findMany({
        where: {
          OR: [{ isPermanent: true }, { expiresAt: { gt: new Date() } }],
        },
        select: { ip: true },
      });
      this.blockedIpsCache = new Set(blocked.map((b) => b.ip));
      this.lastCacheUpdate = Date.now();
    } catch (e) {
      this.logger.error("Failed to refresh blocked IPs cache", e);
    }
  }

  async isIpBlocked(ip: string): Promise<boolean> {
    if (Date.now() - this.lastCacheUpdate > this.CACHE_TTL_MS) {
      // Background refresh to not block request
      this.refreshCache().catch((e) => this.logger.error(e));
    }
    return this.blockedIpsCache.has(ip);
  }

  async logEvent(data: LogSecurityEventDto) {
    const geo = geoip.lookup(data.ip);

    await this.prisma.securityEvent.create({
      data: {
        ip: data.ip,
        macAddress: data.macAddress,
        country: geo?.country || null,
        city: geo?.city || null,
        userId: data.userId,
        endpoint: data.endpoint,
        method: data.method,
        attackType: data.attackType,
        riskScore: data.riskScore,
        isBlocked: data.isBlocked,
        reason: data.reason,
        payloadHash: data.payloadHash,
      },
    });

    // Simple brute-force or high-risk auto-blocker logic
    if (data.riskScore >= 80 && !this.blockedIpsCache.has(data.ip)) {
      await this.blockIp(
        data.ip,
        "Auto-blocked by WAF due to high-risk attack",
        false,
        24,
      );
    }
  }

  async blockIp(ip: string, reason: string, isPermanent = false, hours = 24) {
    const geo = geoip.lookup(ip);

    await this.prisma.blockedIp.upsert({
      where: { ip },
      update: {
        reason,
        isPermanent,
        expiresAt: isPermanent ? null : new Date(Date.now() + hours * 3600000),
      },
      create: {
        ip,
        reason,
        country: geo?.country || null,
        isPermanent,
        expiresAt: isPermanent ? null : new Date(Date.now() + hours * 3600000),
      },
    });

    this.blockedIpsCache.add(ip);
    this.logger.log(`Blocked IP: ${ip} for ${reason}`);
  }

  async unblockIp(ip: string) {
    await this.prisma.blockedIp.deleteMany({ where: { ip } });
    this.blockedIpsCache.delete(ip);
    this.logger.log(`Unblocked IP: ${ip}`);
  }

  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalBlockedIps,
      attacksToday,
      topAttacks,
      topCountries,
      recentEvents,
    ] = await Promise.all([
      this.prisma.blockedIp.count(),
      this.prisma.securityEvent.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.securityEvent.groupBy({
        by: ["attackType"],
        _count: true,
        orderBy: { _count: { attackType: "desc" } },
        take: 5,
      }),
      this.prisma.securityEvent.groupBy({
        by: ["country"],
        where: { country: { not: null } },
        _count: true,
        orderBy: { _count: { country: "desc" } },
        take: 5,
      }),
      this.prisma.securityEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          ip: true,
          endpoint: true,
          attackType: true,
          riskScore: true,
          isBlocked: true,
          createdAt: true,
          country: true,
        },
      }),
    ]);

    // Very simple security score calculation
    let score = 100;
    if (attacksToday > 100) score -= 10;
    if (attacksToday > 1000) score -= 10;
    if (totalBlockedIps > 50) score -= 5;

    return {
      healthScore: Math.max(score, 0),
      metrics: {
        attacksToday,
        totalBlockedIps,
        activeSessions: await this.prisma.session.count(), // Approx metric
      },
      charts: {
        topAttacks: topAttacks.map((a) => ({
          name: a.attackType,
          count: a._count,
        })),
        topCountries: topCountries.map((c) => ({
          name: c.country,
          count: c._count,
        })),
      },
      recentEvents,
    };
  }

  async getBlockedIps() {
    return this.prisma.blockedIp.findMany({
      orderBy: { blockedAt: "desc" },
    });
  }

  async getLiveEvents(limit = 50) {
    return this.prisma.securityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
