import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Query,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService, IOAuthProfile } from "./auth.service";
import { SecurityService } from "../security/security.service";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { IJwtPayload } from "@arrena-photo/shared-types";
import { Throttle } from "@nestjs/throttler";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly securityService: SecurityService,
  ) {}

  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  private setCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const isProd = process.env.NODE_ENV === "production";
    const secureAttr = isProd ? "; Secure" : "";

    const accessCookie = `access_token=${tokens.access_token}; HttpOnly${secureAttr}; SameSite=Lax; Path=/; Max-Age=900`;
    const refreshCookie = `refresh_token=${tokens.refresh_token}; HttpOnly${secureAttr}; SameSite=Lax; Path=/v1/auth/refresh; Max-Age=604800`;

    // In Express 5 / NestJS, setting an array works for multiple Set-Cookie headers
    res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);
  }

  @Get("test-cookie")
  testCookie(@Res() res: Response) {
    res.setHeader("Set-Cookie", "test=value; HttpOnly");
    res.json({ success: true });
  }

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login and get JWT token" })
  @ApiResponse({ status: 200, description: "Login successful" })
  async login(
    @Body() dto: LoginDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const result = await this.authService.login(dto);
      this.setCookies(res, result);
      return res.json({ success: true, access_token: result.access_token });
    } catch (error: any) {
      if (error?.status === HttpStatus.UNAUTHORIZED) {
        const clientIp =
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          "unknown";
        const ip = clientIp.split(",")[0].trim();

        // Don't block the request, just log it asynchronously
        this.securityService
          .logEvent({
            ip,
            macAddress: (req.headers["x-mac-address"] as string) || null,
            endpoint: req.originalUrl || req.url,
            method: req.method,
            attackType: "FAILED_LOGIN",
            riskScore: 30,
            isBlocked: false,
            reason: `Failed login attempt for email: ${dto.email}`,
          })
          .catch((err) => console.error("Failed to log security event", err));
      }
      throw error;
    }
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh JWT token" })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies["refresh_token"];
    const result = await this.authService.refreshTokens(refreshToken);
    this.setCookies(res, result);
    return { success: true, access_token: result.access_token };
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout current session" })
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/v1/auth/refresh" });
    return { success: true };
  }

  @Post("logout-everywhere")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Invalidate all sessions (Logout Everywhere)" })
  @HttpCode(HttpStatus.OK)
  async logoutEverywhere(
    @CurrentUser() user: IJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutEverywhere(user.id);
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/v1/auth/refresh" });
    return { success: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user profile including credits" })
  async getMe(@CurrentUser() user: IJwtPayload) {
    return this.authService.getMe(user.id);
  }

  @Get("verify")
  @ApiOperation({ summary: "Verify email token" })
  async verifyEmail(@Query("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  // --- GOOGLE ---
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    // Redirects to Google
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthCallback(
    @Req() req: Request & { user: IOAuthProfile },
    @Res() res: Response,
  ) {
    const result = await this.authService.handleOAuthLogin("google", req.user);
    this.setCookies(res, result);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?token=${result.access_token}`,
    );
  }

  // --- VK ---
  @Get("vk")
  @UseGuards(AuthGuard("vkontakte"))
  async vkAuth() {
    // Redirects to VK
  }

  @Get("vk/callback")
  @UseGuards(AuthGuard("vkontakte"))
  async vkAuthCallback(
    @Req() req: Request & { user: IOAuthProfile },
    @Res() res: Response,
  ) {
    const result = await this.authService.handleOAuthLogin("vk", req.user);
    this.setCookies(res, result);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?token=${result.access_token}`,
    );
  }

  // --- FACEBOOK ---
  @Get("facebook")
  @UseGuards(AuthGuard("facebook"))
  async facebookAuth() {
    // Redirects to Facebook
  }

  @Get("facebook/callback")
  @UseGuards(AuthGuard("facebook"))
  async facebookAuthCallback(
    @Req() req: Request & { user: IOAuthProfile },
    @Res() res: Response,
  ) {
    const result = await this.authService.handleOAuthLogin(
      "facebook",
      req.user,
    );
    this.setCookies(res, result);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?token=${result.access_token}`,
    );
  }
}
