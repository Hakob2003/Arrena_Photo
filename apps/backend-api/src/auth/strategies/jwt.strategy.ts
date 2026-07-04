import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies["access_token"];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>("JWT_SECRET") ||
        (() => {
          throw new Error("JWT_SECRET is not defined in environment variables");
        })(),
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    tokenVersion?: number;
    type?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, tokenVersion: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Check tokenVersion for Logout Everywhere functionality
    // Allow payload.tokenVersion to be undefined for backwards compatibility with old tokens
    // but if it is defined, it must match user.tokenVersion.
    if (
      payload.tokenVersion !== undefined &&
      payload.tokenVersion !== user.tokenVersion
    ) {
      throw new UnauthorizedException("Token revoked");
    }

    if (payload.type && payload.type !== "access") {
      throw new UnauthorizedException("Invalid token type");
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
