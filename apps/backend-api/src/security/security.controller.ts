import { Controller, Get, Post, Body, UseGuards, Query } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { SecurityService } from "./security.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("admin/security")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @SkipThrottle()
  @Get("dashboard")
  async getDashboard() {
    return this.securityService.getDashboardStats();
  }

  @SkipThrottle()
  @Get("events")
  async getEvents(@Query("limit") limit: string) {
    return this.securityService.getLiveEvents(parseInt(limit || "50", 10));
  }

  @Get("blocked-ips")
  async getBlockedIps() {
    return this.securityService.getBlockedIps();
  }

  @Post("block-ip")
  async blockIp(
    @Body()
    body: {
      ip: string;
      reason: string;
      isPermanent: boolean;
      hours: number;
    },
  ) {
    await this.securityService.blockIp(
      body.ip,
      body.reason,
      body.isPermanent,
      body.hours,
    );
    return { success: true };
  }

  @Post("unblock-ip")
  async unblockIp(@Body() body: { ip: string }) {
    await this.securityService.unblockIp(body.ip);
    return { success: true };
  }
}
