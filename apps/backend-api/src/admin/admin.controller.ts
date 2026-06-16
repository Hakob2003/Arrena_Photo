import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Req, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users/recent')
  @ApiOperation({ summary: 'Get recently registered users' })
  getRecentUsers() {
    return this.adminService.getRecentUsers();
  }

  // --- Users ---
  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  getAllUsers(
    @Query('page') page?: string, 
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string
  ) {
    return this.adminService.getAllUsers(Number(page) || 1, Number(limit) || 20, search, role);
  }

  @Post('users/:id/credits')
  @ApiOperation({ summary: 'Add or remove credits from a user' })
  updateUserCredits(@Param('id') id: string, @Body() body: { amount: number, reason: string }) {
    return this.adminService.updateUserCredits(id, body.amount, body.reason);
  }

  @Post('users/:id/plan')
  @ApiOperation({ summary: 'Change user subscription plan' })
  updateUserPlan(@Param('id') id: string, @Body() body: { plan: string }) {
    return this.adminService.updateUserPlan(id, body.plan);
  }

  @Post('users/import')
  @ApiOperation({ summary: 'Import users from CSV (emails)' })
  importUsers(@Body() body: { emails: string[] }) {
    return this.adminService.importUsers(body.emails);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user' })
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // --- Templates ---
  @Get('templates')
  @ApiOperation({ summary: 'Get all templates with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAllTemplates(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllTemplates(Number(page) || 1, Number(limit) || 20);
  }

  @Post('templates/:id/approve')
  @ApiOperation({ summary: 'Approve a template for marketplace' })
  approveTemplate(@Param('id') id: string) {
    return this.adminService.approveTemplate(id);
  }

  @Post('templates/:id/reject')
  @ApiOperation({ summary: 'Reject a template' })
  rejectTemplate(@Param('id') id: string) {
    return this.adminService.rejectTemplate(id);
  }

  // --- Generations ---
  @Get('generations')
  @ApiOperation({ summary: 'Get generations history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getGenerations(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getGenerations(Number(page) || 1, Number(limit) || 20);
  }

  // --- Audit Logs ---
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get system audit logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAuditLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAuditLogs(Number(page) || 1, Number(limit) || 20);
  }

  // --- Payouts (Marketplace) ---
  @Get('payouts')
  @ApiOperation({ summary: 'Get marketplace payouts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getPayouts(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getPayouts(Number(page) || 1, Number(limit) || 20);
  }

  @Post('payouts/:id/process')
  @ApiOperation({ summary: 'Process a payout request' })
  processPayout(@Param('id') id: string) {
    return this.adminService.processPayout(id);
  }

  // --- API Keys ---
  @Get('api-providers')
  @ApiOperation({ summary: 'Get list of AI Providers and global API key status' })
  getApiProviders(@Req() req) {
    // Assuming req.user contains the authenticated admin user
    return this.adminService.getApiProviders(req.user.id);
  }

  @Post('api-providers/:providerId/key')
  @ApiOperation({ summary: 'Set global API key for a provider' })
  updateProviderKey(
    @Req() req,
    @Param('providerId') providerId: string,
    @Body('apiKey') apiKey: string
  ) {
    return this.adminService.updateGlobalApiKey(req.user.id, providerId, apiKey);
  }

  // --- Billing ---
  @Get('billing')
  @ApiOperation({ summary: 'Get billing stats and recent purchases' })
  getBillingStats() {
    return this.adminService.getBillingStats();
  }

  // --- AI Models ---
  @Get('ai-models')
  @ApiOperation({ summary: 'Get all AI models with pagination and filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'providerId', required: false })
  getAIModels(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('providerId') providerId?: string
  ) {
    return this.adminService.getAIModels(Number(page) || 1, Number(limit) || 50, search, providerId);
  }

  @Get('ai-models/providers')
  @ApiOperation({ summary: 'Get list of AI providers' })
  getAIProvidersList() {
    return this.adminService.getAIProvidersList();
  }

  @Post('ai-models')
  @ApiOperation({ summary: 'Create a new AI model' })
  createAIModel(@Body() body: {
    name: string;
    slug: string;
    providerId: string;
    endpoint?: string;
    description?: string;
    isFree?: boolean;
    isActive?: boolean;
    costPerToken?: number;
    speed?: string;
  }) {
    return this.adminService.createAIModel(body);
  }

  @Put('ai-models/:id')
  @ApiOperation({ summary: 'Update an AI model' })
  updateAIModel(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateAIModel(id, body);
  }

  @Post('ai-models/:id/toggle')
  @ApiOperation({ summary: 'Toggle AI model active status' })
  toggleAIModel(@Param('id') id: string) {
    return this.adminService.toggleAIModel(id);
  }

  @Delete('ai-models/:id')
  @ApiOperation({ summary: 'Delete an AI model' })
  deleteAIModel(@Param('id') id: string) {
    return this.adminService.deleteAIModel(id);
  }
}

