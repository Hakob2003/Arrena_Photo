import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    let userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) {
      userRole = await this.prisma.role.create({
        data: { name: 'USER', permissions: ['generations:create'] },
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

    const token = randomBytes(32).toString('hex');
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
      console.error('Failed to send email', e);
    }

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async verifyEmail(token: string) {
    const verification = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.expires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() },
    });

    await this.prisma.verificationToken.delete({ where: { token } });

    return { message: 'Email successfully verified. You can now log in.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email, user.role.name);
  }

  async handleOAuthLogin(provider: string, profile: any) {
    const { email, name, providerAccountId, accessToken } = profile;

    if (!email) {
      throw new BadRequestException(`No email provided by ${provider}`);
    }

    let user = await this.prisma.user.findUnique({ where: { email }, include: { role: true } });

    if (!user) {
      let userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
      if (!userRole) {
        userRole = await this.prisma.role.create({
          data: { name: 'USER', permissions: ['generations:create'] },
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
              accessToken,
            },
          },
        },
        include: { role: true }
      });
    } else {
      // Connect OAuth account if not connected
      const existingOAuth = await this.prisma.oAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } }
      });
      if (!existingOAuth) {
        await this.prisma.oAuthAccount.create({
          data: { userId: user.id, provider, providerAccountId, accessToken }
        });
      }
      
      if (!user.emailVerified) {
         await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() }
         });
      }
    }

    return this.generateTokens(user.id, user.email, user.role.name);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const token = this.jwtService.sign(payload);

    await this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { access_token: token };
  }
}
