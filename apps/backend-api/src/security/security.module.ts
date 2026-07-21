import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { SecurityService } from "./security.service";
import { SecurityController } from "./security.controller";
import { WafMiddleware } from "./waf.middleware";

@Module({
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WafMiddleware).forRoutes("*");
  }
}
