import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific role by ID' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Update permissions for a role (Admin only)' })
  updatePermissions(
    @Param('id') id: string,
    @Body('permissions') permissions: string[],
  ) {
    return this.rolesService.updatePermissions(id, permissions);
  }
}
