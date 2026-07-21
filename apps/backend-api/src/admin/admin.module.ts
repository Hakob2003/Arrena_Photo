import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { ProviderCheckService } from "./provider-check.service";

import { SystemAuditService } from "./audit.service";
import { SocController } from "./soc.controller";
import { SocService } from "./soc.service";

@Module({
  imports: [HttpModule],
  controllers: [AdminController, SocController],
  providers: [
    AdminService,
    ProviderCheckService,
    SystemAuditService,
    SocService,
  ],
})
export class AdminModule {}
