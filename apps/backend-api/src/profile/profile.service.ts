import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  UpdateProfileDto,
  UpdatePreferencesDto,
  UpdateNotificationsDto,
  UpdateSecurityDto,
} from "./dto/profile.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        socialLinks: true,
        theme: true,
        accentColor: true,
        fontSize: true,
        compactMode: true,
        animationsEnabled: true,
        skin: true,
        notifyEmail: true,
        notifyGenerations: true,
        notifyMarketing: true,
        notifyNews: true,
        notifySystem: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async updatePersonalInfo(userId: string, dto: UpdateProfileDto) {
    if (dto.nickname) {
      const existing = await this.prisma.user.findFirst({
        where: { nickname: dto.nickname, id: { not: userId } },
      });
      if (existing) throw new BadRequestException("Nickname is already taken");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        socialLinks: dto.socialLinks
          ? JSON.stringify(dto.socialLinks)
          : undefined,
      },
    });
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async updatePassword(userId: string, dto: UpdateSecurityDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    if (!user.passwordHash)
      throw new BadRequestException(
        "User does not have a password set (social login)",
      );

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) throw new BadRequestException("Invalid current password");

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true };
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        country: true,
        device: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async logoutAllDevices(userId: string, currentSessionId: string) {
    const result = await this.prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });
    return { success: true, count: result.count };
  }

  async getStatistics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { generations: true },
        },
      },
    });

    // Count successful generations
    const successfulGenerations = await this.prisma.generation.count({
      where: { userId, status: "DONE" },
    });

    // Spent credits
    const spentCreditsAggr = await this.prisma.creditTransaction.aggregate({
      where: { userId, amount: { lt: 0 } },
      _sum: { amount: true },
    });

    // Top AI Model
    const topModelUsage = await this.prisma.generation.groupBy({
      by: ["aiModelId"],
      where: { userId, status: "DONE" },
      _count: { aiModelId: true },
      orderBy: { _count: { aiModelId: "desc" } },
      take: 1,
    });

    let favoriteModel = "None";
    if (topModelUsage.length > 0) {
      const modelInfo = await this.prisma.aIModel.findUnique({
        where: { id: topModelUsage[0].aiModelId },
        select: { name: true },
      });
      if (modelInfo) favoriteModel = modelInfo.name;
    }

    return {
      registeredAt: user?.createdAt,
      lastLogin: user?.lastLogin,
      totalGenerations: user?._count.generations || 0,
      successfulGenerations,
      favoriteModel,
      spentCredits: Math.abs(spentCreditsAggr._sum.amount || 0),
      currentCredits: user?.credits || 0,
    };
  }

  async getActivity(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const queryLimit = skip + limit;

    const [generations, sessions, totalGenerations, totalSessions] =
      await Promise.all([
        this.prisma.generation.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: queryLimit,
          select: {
            id: true,
            status: true,
            createdAt: true,
            aiModel: { select: { name: true } },
          },
        }),
        this.prisma.session.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: queryLimit,
          select: { id: true, device: true, ipAddress: true, createdAt: true },
        }),
        this.prisma.generation.count({ where: { userId } }),
        this.prisma.session.count({ where: { userId } }),
      ]);

    const activities = [
      ...generations.map((g) => ({
        id: g.id,
        type: "GENERATION",
        action: `Generated image using ${g.aiModel?.name || "AI Model"}`,
        status: g.status,
        date: g.createdAt,
      })),
      ...sessions.map((s) => ({
        id: s.id,
        type: "LOGIN",
        action: `Signed in on ${s.device || "Unknown Device"} from ${s.ipAddress || "Unknown IP"}`,
        status: "SUCCESS",
        date: s.createdAt,
      })),
    ];

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      items: activities.slice(skip, skip + limit),
      total: totalGenerations + totalSessions,
    };
  }
}
