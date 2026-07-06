import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { MailService } from "../mail/mail.service";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { EncryptionUtil } from "../common/utils/encryption.util";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, subscription: true },
    });
    if (!user) throw new UnauthorizedException("User not found");
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role.name,
      credits: user.credits,
      planId: user.subscription?.plan || "FREE",
      preferences: {
        theme: user.theme,
        accentColor: user.accentColor,
        fontSize: user.fontSize,
        compactMode: user.compactMode,
        animationsEnabled: user.animationsEnabled,
        skin: user.skin,
      },
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let userRole = await this.prisma.role.findUnique({
      where: { name: "USER" },
    });
    if (!userRole) {
      userRole = await this.prisma.role.create({
        data: { name: "USER", permissions: ["generations:create"] },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        name: dto.name,
        roleId: userRole.id,
      },
    });

    const token = randomBytes(32).toString("hex");
    await this.prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    try {
      await this.mailService.sendVerificationEmail(user.email, token);
    } catch (e) {
      console.error("Failed to send email", e);
    }

    return {
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }

  async verifyEmail(token: string) {
    const verification = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.expires < new Date()) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    await this.prisma.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() },
    });

    await this.prisma.verificationToken.delete({ where: { token } });

    return { message: "Email successfully verified. You can now log in." };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException("Please verify your email first");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Auto-rehash weak passwords on successful login
    try {
      const rounds = bcrypt.getRounds(user.passwordHash);
      if (rounds < 10) {
        const newHash = await bcrypt.hash(dto.password, 10);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
      }
    } catch (e) {
      // If getRounds throws (e.g. invalid hash format but compare succeeded?), just ignore or rehash
      const newHash = await bcrypt.hash(dto.password, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    return this.generateTokens(user.id, user.email, user.role.name);
  }

  async handleOAuthLogin(provider: string, profile: any) {
    const { email, name, providerAccountId, accessToken, refreshToken } =
      profile;

    if (!email) {
      throw new BadRequestException(`No email provided by ${provider}`);
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    const encryptedAccessToken = EncryptionUtil.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken
      ? EncryptionUtil.encrypt(refreshToken)
      : undefined;

    if (!user) {
      let userRole = await this.prisma.role.findUnique({
        where: { name: "USER" },
      });
      if (!userRole) {
        userRole = await this.prisma.role.create({
          data: { name: "USER", permissions: ["generations:create"] },
        });
      }

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          emailVerified: new Date(), // OAuth emails are already verified
          roleId: userRole.id,
          oauthAccounts: {
            create: {
              provider,
              providerAccountId,
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
            },
          },
        },
        include: { role: true },
      });
    } else {
      // Connect OAuth account if not connected
      const existingOAuth = await this.prisma.oAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
      if (!existingOAuth) {
        await this.prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider,
            providerAccountId,
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
          },
        });
      } else {
        // Update tokens if they changed
        await this.prisma.oAuthAccount.update({
          where: { id: existingOAuth.id },
          data: {
            accessToken: encryptedAccessToken,
            ...(encryptedRefreshToken
              ? { refreshToken: encryptedRefreshToken }
              : {}),
          },
        });
      }

      if (!user.emailVerified) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    }

    return this.generateTokens(user.id, user.email, user.role.name);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true },
    });

    // Add strict token type segregation to prevent token confusion (passing access as refresh or vice-versa)
    const accessPayload = {
      sub: userId,
      email,
      role,
      tokenVersion: user?.tokenVersion || 0,
      type: "access",
    };
    const refreshPayload = {
      sub: userId,
      email,
      role,
      tokenVersion: user?.tokenVersion || 0,
      type: "refresh",
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: "15m",
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: "7d",
    });

    await this.prisma.session.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided");
    }

    try {
      const payload = this.jwtService.verify(refreshToken);

      // Strict type check to prevent using an access token as a refresh token
      if (payload.type && payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      const session = await this.prisma.session.findUnique({
        where: { token: refreshToken },
      });

      if (!session) {
        // Reuse detection: Token is mathematically valid but not in DB
        await this.prisma.session.deleteMany({
          where: { userId: payload.sub },
        });
        throw new UnauthorizedException(
          "Token reuse detected. All sessions revoked.",
        );
      }

      // Valid rotation: delete old session
      await this.prisma.session.delete({ where: { id: session.id } });

      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async logoutEverywhere(userId: string) {
    // Increment tokenVersion to invalidate all existing JWTs immediately
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    // Also delete all active sessions (refresh tokens) from the database
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }
}
