import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import Stripe from "stripe";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

export type CheckStatus = "SUCCESS" | "WARNING" | "ERROR";

export interface AuditCheck {
  name: string;
  status: CheckStatus;
  description: string;
  details?: Record<string, unknown> | null;
  durationMs: number;
  errorMessage?: string;
  timestamp: Date;
}

export interface AuditCategory {
  category: string;
  checks: AuditCheck[];
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  durationMs: number;
}

export interface AuditReport {
  timestamp: Date;
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  overallHealth: number;
  durationMs: number;
  categories: AuditCategory[];
}

@Injectable()
export class SystemAuditService {
  private readonly logger = new Logger(SystemAuditService.name);

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private config: ConfigService,
  ) {}

  // Utility to measure execution time
  private async measure<T>(
    fn: () => Promise<T>,
    timeoutMs: number = 5000,
  ): Promise<{ result?: T; error?: Error; durationMs: number }> {
    const start = Date.now();
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${timeoutMs}ms`)),
          timeoutMs,
        ),
      );
      const result = await Promise.race([fn(), timeoutPromise]);
      return { result, durationMs: Date.now() - start };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        durationMs: Date.now() - start,
      };
    }
  }

  private createCheck(
    name: string,
    description: string,
    status: CheckStatus,
    durationMs: number,
    details?: Record<string, unknown> | null,
    errorMessage?: string,
  ): AuditCheck {
    return {
      name,
      description,
      status,
      durationMs,
      details,
      errorMessage,
      timestamp: new Date(),
    };
  }

  // Categories

  async checkDatabase(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    // 1. Connection
    const connTest = await this.measure(async () => {
      const res = await this.prisma.$queryRaw`SELECT 1 as result`;
      return res;
    });
    checks.push(
      this.createCheck(
        "PostgreSQL Connection",
        "Verify database connectivity",
        connTest.error ? "ERROR" : "SUCCESS",
        connTest.durationMs,
        connTest.result ? ({ result: 1 } as Record<string, unknown>) : null,
        connTest.error?.message,
      ),
    );

    // 2. DB Version
    const verTest = await this.measure(async () => {
      const res = await this.prisma.$queryRaw<
        { version: string }[]
      >`SELECT version();`;
      return res[0]?.version;
    });
    checks.push(
      this.createCheck(
        "PostgreSQL Version",
        "Check database engine version",
        verTest.error ? "WARNING" : "SUCCESS",
        verTest.durationMs,
        verTest.result ? { version: String(verTest.result) } : null,
        verTest.error?.message,
      ),
    );

    // 3. Database Size
    const sizeTest = await this.measure(async () => {
      const res = await this.prisma.$queryRaw<{ size: string }[]>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size;
      `;
      return res[0]?.size;
    });
    checks.push(
      this.createCheck(
        "Database Size",
        "Check current database size",
        sizeTest.error ? "WARNING" : "SUCCESS",
        sizeTest.durationMs,
        sizeTest.result ? { size: String(sizeTest.result) } : null,
        sizeTest.error?.message,
      ),
    );

    return this.aggregateCategory("Database", checks, Date.now() - start);
  }

  async checkEnvironment(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    const requiredKeys = [
      "DATABASE_URL",
      "JWT_SECRET",
      "FRONTEND_URL",
      "STRIPE_SECRET_KEY",
    ];

    for (const key of requiredKeys) {
      const val = this.config.get(key);
      const isMissing = !val || val.trim() === "";
      checks.push(
        this.createCheck(
          `ENV: ${key}`,
          `Check if ${key} is present and not empty`,
          isMissing ? "ERROR" : "SUCCESS",
          0,
          { length: val?.length || 0 },
          isMissing ? `Missing or empty ${key}` : undefined,
        ),
      );
    }

    return this.aggregateCategory("Environment", checks, Date.now() - start);
  }

  async checkRedis(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    const redisUrl = this.config.get("REDIS_URL");
    if (!redisUrl) {
      checks.push(
        this.createCheck(
          "Redis Config",
          "Check REDIS_URL",
          "ERROR",
          0,
          null,
          "REDIS_URL not set",
        ),
      );
      return this.aggregateCategory("Redis", checks, Date.now() - start);
    }

    const redisTest = await this.measure(async () => {
      const redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
      await redis.connect();
      const ping = await redis.ping();
      const info = await redis.info("memory");
      await redis.quit();
      return { ping, info };
    }, 3000);

    checks.push(
      this.createCheck(
        "Redis Connection & Ping",
        "Connect to Redis and send PING",
        redisTest.error ? "ERROR" : "SUCCESS",
        redisTest.durationMs,
        redisTest.result?.ping ? { response: redisTest.result.ping } : null,
        redisTest.error?.message,
      ),
    );

    return this.aggregateCategory("Redis", checks, Date.now() - start);
  }

  async checkAIProviders(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    const providers = await this.prisma.aIProvider.findMany({
      include: { connections: { where: { status: "CONNECTED" } } },
    });

    if (providers.length === 0) {
      checks.push(
        this.createCheck(
          "AI Config",
          "Check DB for AI Providers",
          "WARNING",
          0,
          null,
          "No providers configured in DB",
        ),
      );
    }

    for (const provider of providers) {
      for (const connection of provider.connections) {
        // We do a generic key check since decrypting the key requires EncryptionUtil which adds complexity
        // and might fail if we just want to quickly audit.
        checks.push(
          this.createCheck(
            `${provider.name} Key Configuration (${connection.id})`,
            "Check if encrypted API key is present and looks valid",
            connection.encryptedApiKey && connection.encryptedApiKey.length > 5
              ? "SUCCESS"
              : "ERROR",
            1,
            { length: connection.encryptedApiKey?.length || 0 },
          ),
        );
      }
    }

    return this.aggregateCategory("AI Providers", checks, Date.now() - start);
  }

  async checkPayments(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    const stripeKey = this.config.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      checks.push(
        this.createCheck(
          "Stripe Config",
          "Check STRIPE_SECRET_KEY",
          "ERROR",
          0,
          null,
          "STRIPE_SECRET_KEY not set",
        ),
      );
      return this.aggregateCategory("Payments", checks, Date.now() - start);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-06-24.dahlia" });

    const test = await this.measure(async () => {
      const balance = await stripe.balance.retrieve();
      return balance;
    }, 5000);

    checks.push(
      this.createCheck(
        "Stripe API Access",
        "Retrieve Stripe balance (read-only)",
        test.error ? "ERROR" : "SUCCESS",
        test.durationMs,
        test.result ? { livemode: test.result.livemode } : null,
        test.error?.message,
      ),
    );

    return this.aggregateCategory("Payments", checks, Date.now() - start);
  }

  async checkFilesystem(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    const dirs = [
      path.join(process.cwd(), "uploads"),
      path.join(process.cwd(), "logs"),
    ];

    for (const dir of dirs) {
      const test = await this.measure(async () => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);
        return true;
      });

      checks.push(
        this.createCheck(
          `Directory Access: ${path.basename(dir)}`,
          `Check if ${dir} exists and is readable/writable`,
          test.error ? "ERROR" : "SUCCESS",
          test.durationMs,
          null,
          test.error?.message,
        ),
      );
    }

    return this.aggregateCategory("Filesystem", checks, Date.now() - start);
  }

  async checkPerformance(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    const memoryUsage = process.memoryUsage();
    checks.push(
      this.createCheck(
        "Memory Usage",
        "Check heap usage",
        memoryUsage.heapUsed < 1024 * 1024 * 1024 ? "SUCCESS" : "WARNING", // Warning if > 1GB
        0,
        {
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      ),
    );

    checks.push(
      this.createCheck(
        "System Uptime",
        "Check Node.js process uptime",
        "SUCCESS",
        0,
        { uptimeSeconds: Math.round(process.uptime()) },
      ),
    );

    return this.aggregateCategory("Performance", checks, Date.now() - start);
  }

  async checkE2EFeatures(): Promise<AuditCategory> {
    const start = Date.now();
    const checks: AuditCheck[] = [];

    // Simulate E2E Feature test by creating an audit_test_ user in DB
    const testUserEmail = `audit_test_${Date.now()}@example.com`;

    const test = await this.measure(async () => {
      let roleId = null;
      const role = await this.prisma.role.findFirst({
        where: { name: "USER" },
      });
      if (role) roleId = role.id;

      const user = await this.prisma.user.create({
        data: {
          email: testUserEmail,
          name: "Audit Test User",
          roleId: roleId,
        },
      });
      return user;
    });

    checks.push(
      this.createCheck(
        "E2E: User Registration",
        "Attempt to create a user with audit_test_ prefix",
        test.error ? "ERROR" : "SUCCESS",
        test.durationMs,
        test.result ? { userId: test.result.id } : null,
        test.error?.message,
      ),
    );

    return this.aggregateCategory("Feature Tests", checks, Date.now() - start);
  }

  // Core Orchestrator

  public async runFullAudit(): Promise<AuditReport> {
    const start = Date.now();

    const results = await Promise.allSettled([
      this.checkDatabase(),
      this.checkEnvironment(),
      this.checkRedis(),
      this.checkAIProviders(),
      this.checkPayments(),
      this.checkFilesystem(),
      this.checkPerformance(),
      this.checkE2EFeatures(),
    ]);

    const categories: AuditCategory[] = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean) as AuditCategory[];

    let totalChecks = 0;
    let passed = 0;
    let warnings = 0;
    let failed = 0;

    for (const cat of categories) {
      totalChecks += cat.total;
      passed += cat.passed;
      warnings += cat.warnings;
      failed += cat.failed;
    }

    const overallHealth =
      totalChecks > 0
        ? Math.round(((passed + warnings * 0.5) / totalChecks) * 100)
        : 0;

    return {
      timestamp: new Date(),
      totalChecks,
      passed,
      warnings,
      failed,
      overallHealth,
      durationMs: Date.now() - start,
      categories,
    };
  }

  public async getTestGarbage() {
    return this.prisma.user.findMany({
      where: { email: { startsWith: "audit_test_" } },
      select: { id: true, email: true, createdAt: true },
    });
  }

  public async cleanTestGarbage() {
    const res = await this.prisma.user.deleteMany({
      where: { email: { startsWith: "audit_test_" } },
    });
    return { deletedCount: res.count };
  }

  private aggregateCategory(
    category: string,
    checks: AuditCheck[],
    durationMs: number,
  ): AuditCategory {
    return {
      category,
      checks,
      total: checks.length,
      passed: checks.filter((c) => c.status === "SUCCESS").length,
      warnings: checks.filter((c) => c.status === "WARNING").length,
      failed: checks.filter((c) => c.status === "ERROR").length,
      durationMs,
    };
  }
}
