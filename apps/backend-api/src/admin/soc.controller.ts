import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { SocService } from "./soc.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RoleName } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("admin/soc")
@ApiBearerAuth()
@Roles(RoleName.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/soc")
export class SocController {
  constructor(private readonly socService: SocService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get all SOC Dashboard analytics" })
  @ApiQuery({ name: "timeframe", required: false })
  getSocDashboard(@Query("timeframe") timeframe?: string) {
    return this.socService.getSocDashboard(timeframe);
  }

  @Get("threat-feed")
  @ApiOperation({ summary: "Get live threat feed" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "type", required: false })
  getThreatFeed(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("type") type?: string,
  ) {
    return this.socService.getThreatFeed(
      Number(page) || 1,
      Number(limit) || 20,
      search,
      type,
    );
  }

  @Get("audit-log")
  @ApiOperation({ summary: "Get audit logs for SOC" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "action", required: false })
  getAuditLog(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("action") action?: string,
  ) {
    return this.socService.getAuditLog(
      Number(page) || 1,
      Number(limit) || 20,
      search,
      action,
    );
  }

  @Get("alerts")
  @ApiOperation({ summary: "Get security alerts" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "severity", required: false })
  getAlerts(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("severity") severity?: string,
  ) {
    return this.socService.getAlerts(
      Number(page) || 1,
      Number(limit) || 20,
      severity,
    );
  }

  @Get("timeline")
  @ApiOperation({ summary: "Get attack timeline" })
  @ApiQuery({ name: "limit", required: false })
  getAttackTimeline(@Query("limit") limit?: string) {
    return this.socService.getAttackTimeline(Number(limit) || 50);
  }
}
