import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { ProviderCheckService } from "./provider-check.service";

import { SystemAuditService } from "./audit.service";

@Module({
  imports: [HttpModule],
  controllers: [AdminController],
  providers: [AdminService, ProviderCheckService, SystemAuditService],
})
export class AdminModule {}
