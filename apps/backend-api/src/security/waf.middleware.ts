import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { SecurityService } from "./security.service";

@Injectable()
export class WafMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WafMiddleware.name);

  // Regex patterns for detecting common attacks
  private readonly SQLI_PATTERN =
    /(?:')|(?:--)|(\b(?:SELECT|UPDATE|UNION|INSERT|DROP|DELETE|CREATE|ALTER)\b(?:[\s\S]*)\b(?:FROM|INTO|TABLE|DATABASE)\b)|(\b(?:OR|AND)\b\s+(?:'[^']+'|"[^"]+"|\d+)\s*(?:=|LIKE|<|>)\s*(?:'[^']+'|"[^"]+"|\d+))/i;
  private readonly XSS_PATTERN =
    /(?:<script>)|(?:javascript:)|(?:onerror=)|(?:onload=)|(?:<img\s+src=.*onerror=)/i;
  private readonly PATH_TRAVERSAL_PATTERN =
    /(?:\.\.\/)|(?:\.\.\\)|(?:\/etc\/passwd)|(?:c:\\windows)/i;

  constructor(private readonly securityService: SecurityService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS") {
      return next();
    }

    // 1. IP Blacklist check
    const ip =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "unknown";
    // Clean up multiple IPs if proxy is used
    const clientIp = ip.split(",")[0].trim();

    // Check if IP is blocked (using cached service)
    const isBlocked = await this.securityService.isIpBlocked(clientIp);
    if (isBlocked) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Your IP address has been blocked due to suspicious activity.",
      });
    }

    // 2. Scan request for malicious payloads
    const payloadString = JSON.stringify({
      body: req.body,
      query: req.query,
      // Scan important headers, avoid scanning all headers as they contain harmless cookies/tokens
      userAgent: req.headers["user-agent"],
    });

    let detectedAttack: string | null = null;
    let riskScore = 0;

    if (
      this.SQLI_PATTERN.test(payloadString) ||
      this.SQLI_PATTERN.test(req.url)
    ) {
      detectedAttack = "SQL_INJECTION";
      riskScore = 80;
    } else if (
      this.XSS_PATTERN.test(payloadString) ||
      this.XSS_PATTERN.test(req.url)
    ) {
      detectedAttack = "XSS";
      riskScore = 70;
    } else if (
      this.PATH_TRAVERSAL_PATTERN.test(payloadString) ||
      this.PATH_TRAVERSAL_PATTERN.test(req.url)
    ) {
      detectedAttack = "PATH_TRAVERSAL";
      riskScore = 90;
    }

    if (detectedAttack) {
      this.logger.warn(
        `Detected ${detectedAttack} from IP: ${clientIp} on ${req.method} ${req.url}`,
      );

      await this.securityService.logEvent({
        ip: clientIp,
        macAddress: (req.headers["x-mac-address"] as string) || null,
        userId: (req as any).user?.id || null,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        attackType: detectedAttack,
        riskScore,
        isBlocked: true, // We block these immediately
        reason: "Detected malicious payload matching WAF signatures.",
        payloadHash: this.hashPayload(payloadString),
      });

      return res.status(403).json({
        error: "Forbidden",
        message: "Malicious payload detected and blocked.",
      });
    }

    // Pass control to next middleware
    next();
  }

  private hashPayload(payload: string): string {
    const crypto = require("crypto");
    return crypto
      .createHash("sha256")
      .update(payload)
      .digest("hex")
      .substring(0, 16);
  }
}
