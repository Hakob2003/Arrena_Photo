import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  Body,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ProviderCheckService } from "./provider-check.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { IJwtPayload } from "@arrena-photo/shared-types";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { RoleName } from "@prisma/client";
import { SystemAuditService } from "./audit.service";

@ApiTags("admin")
@ApiBearerAuth()
@Roles(RoleName.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly providerCheckService: ProviderCheckService,
    private readonly systemAuditService: SystemAuditService,
  ) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get overall dashboard statistics" })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("analytics")
  @ApiOperation({ summary: "Get deep dive analytics data" })
  getAnalytics() {
    return this.adminService.getAnalyticsStats();
  }

  @Get("users/recent")
  @ApiOperation({ summary: "Get recently registered users" })
  getRecentUsers() {
    return this.adminService.getRecentUsers();
  }

  // --- Users ---
  @Get("users")
  @ApiOperation({ summary: "Get all users with pagination and filters" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "role", required: false })
  getAllUsers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("role") role?: string,
  ) {
    return this.adminService.getAllUsers(
      Number(page) || 1,
      Number(limit) || 20,
      search,
      role,
    );
  }

  @Post("users/:id/credits")
  @ApiOperation({ summary: "Add or remove credits from a user" })
  updateUserCredits(
    @Param("id") id: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.adminService.updateUserCredits(id, body.amount, body.reason);
  }

  @Post("users/:id/plan")
  @ApiOperation({ summary: "Change user subscription plan" })
  updateUserPlan(@Param("id") id: string, @Body() body: { plan: string }) {
    return this.adminService.updateUserPlan(id, body.plan);
  }

  @Post("users/import")
  @ApiOperation({ summary: "Import users from CSV (emails)" })
  importUsers(@Body() body: { emails: string[] }) {
    return this.adminService.importUsers(body.emails);
  }

  @Post("users/:id/ban")
  @ApiOperation({ summary: "Ban a user" })
  banUser(@Param("id") id: string) {
    return this.adminService.banUser(id);
  }

  @Post("users/:id/unban")
  @ApiOperation({ summary: "Unban a user" })
  unbanUser(@Param("id") id: string) {
    return this.adminService.unbanUser(id);
  }

  @Delete("users/:id")
  @ApiOperation({ summary: "Delete a user" })
  deleteUser(@Param("id") id: string) {
    return this.adminService.deleteUser(id);
  }

  // --- Templates ---
  @Get("templates")
  @ApiOperation({ summary: "Get all templates with pagination" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getAllTemplates(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.adminService.getAllTemplates(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post("templates/:id/approve")
  @ApiOperation({ summary: "Approve a template for marketplace" })
  approveTemplate(@Param("id") id: string) {
    return this.adminService.approveTemplate(id);
  }

  @Post("templates/:id/reject")
  @ApiOperation({ summary: "Reject a template" })
  rejectTemplate(@Param("id") id: string) {
    return this.adminService.rejectTemplate(id);
  }

  // --- Generations ---
  @Get("generations")
  @ApiOperation({ summary: "Get generations history" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getGenerations(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.adminService.getGenerations(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  // --- Audit Logs ---
  @Get("audit-logs")
  @ApiOperation({ summary: "Get system audit logs" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getAuditLogs(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.adminService.getAuditLogs(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  // --- Payouts (Marketplace) ---
  @Get("payouts")
  @ApiOperation({ summary: "Get marketplace payouts" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getPayouts(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.adminService.getPayouts(Number(page) || 1, Number(limit) || 20);
  }

  @Post("payouts/:id/process")
  @ApiOperation({ summary: "Process a payout request" })
  processPayout(@Param("id") id: string) {
    return this.adminService.processPayout(id);
  }

  // --- API Keys ---
  @Get("api-providers")
  @ApiOperation({
    summary: "Get list of AI Providers and global API key status",
  })
  getApiProviders(@CurrentUser() user: IJwtPayload) {
    // Assuming user contains the authenticated admin user
    return this.adminService.getApiProviders(user.id);
  }

  @Post("api-providers/:providerId/key")
  @ApiOperation({ summary: "Set global API key for a provider" })
  updateProviderKey(
    @CurrentUser() user: IJwtPayload,
    @Param("providerId") providerId: string,
    @Body("apiKey") apiKey: string,
  ) {
    return this.adminService.updateGlobalApiKey(user.id, providerId, apiKey);
  }

  @Post("api-providers/:providerId/check")
  @ApiOperation({ summary: "Check connection for provider" })
  checkProviderConnection(@Param("providerId") providerId: string) {
    return this.providerCheckService.checkConnection(providerId);
  }

  @Post("api-providers/:providerId/test")
  @ApiOperation({ summary: "Test generation for provider" })
  testProviderGeneration(@Param("providerId") providerId: string) {
    return this.providerCheckService.testGeneration(providerId);
  }

  @Post("api-providers/:providerId/toggle-monitor")
  @ApiOperation({ summary: "Toggle auto-monitor for provider" })
  toggleMonitor(
    @CurrentUser() user: IJwtPayload,
    @Param("providerId") providerId: string,
    @Body() body: { isAutoMonitorOn: boolean; monitorInterval: string },
  ) {
    return this.adminService.toggleAutoMonitor(user.id, providerId, body);
  }

  // --- Billing ---
  @Get("billing")
  @ApiOperation({ summary: "Get billing stats and recent purchases" })
  getBillingStats() {
    return this.adminService.getBillingStats();
  }

  // --- AI Models ---
  @Get("ai-models")
  @ApiOperation({ summary: "Get all AI models with pagination and filters" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "providerId", required: false })
  getAIModels(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("providerId") providerId?: string,
  ) {
    return this.adminService.getAIModels(
      Number(page) || 1,
      Number(limit) || 50,
      search,
      providerId,
    );
  }

  @Get("ai-models/providers")
  @ApiOperation({ summary: "Get list of AI providers" })
  getAIProvidersList() {
    return this.adminService.getAIProvidersList();
  }

  @Post("ai-models")
  @ApiOperation({ summary: "Create a new AI model" })
  createAIModel(
    @Body()
    body: {
      name: string;
      slug: string;
      providerId: string;
      endpoint?: string;
      description?: string;
      isFree?: boolean;
      isActive?: boolean;
      costPerToken?: number;
      speed?: string;
    },
  ) {
    return this.adminService.createAIModel(body);
  }

  @Put("ai-models/:id")
  @ApiOperation({ summary: "Update an AI model" })
  updateAIModel(@Param("id") id: string, @Body() body: any) {
    return this.adminService.updateAIModel(id, body);
  }

  @Post("ai-models/:id/toggle")
  @ApiOperation({ summary: "Toggle AI model active status" })
  toggleAIModel(@Param("id") id: string) {
    return this.adminService.toggleAIModel(id);
  }

  @Delete("ai-models/:id")
  @ApiOperation({ summary: "Delete an AI model" })
  deleteAIModel(@Param("id") id: string) {
    return this.adminService.deleteAIModel(id);
  }

  @Get("ai-models/templates")
  @ApiOperation({ summary: "Get list of templates for AI model assignment" })
  getTemplatesForAssignment() {
    return this.adminService.getTemplatesForAssignment();
  }

  @Post("ai-models/:id/assign-templates")
  @ApiOperation({ summary: "Assign an AI model to specific templates" })
  assignModelToTemplates(
    @Param("id") id: string,
    @Body() body: { templateIds: string[] },
  ) {
    return this.adminService.assignModelToTemplates(id, body.templateIds);
  }

  @Get("system-audit")
  @ApiOperation({ summary: "Run a full system audit" })
  runSystemAudit() {
    return this.systemAuditService.runFullAudit();
  }

  @Get("system-audit/garbage")
  @ApiOperation({
    summary: "Get all test garbage data generated by system audit",
  })
  getSystemAuditGarbage() {
    return this.systemAuditService.getTestGarbage();
  }

  @Delete("system-audit/garbage")
  @ApiOperation({
    summary: "Delete all test garbage data generated by system audit",
  })
  cleanSystemAuditGarbage() {
    return this.systemAuditService.cleanTestGarbage();
  }
}
