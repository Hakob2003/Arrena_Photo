import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFavorite(userId: string, templateId: string) {
    const existing = await this.prisma.templateFav.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });

    if (existing) {
      await this.prisma.templateFav.delete({ where: { id: existing.id } });
      return { favorited: false };
    } else {
      await this.prisma.templateFav.create({ data: { userId, templateId } });
      return { favorited: true };
    }
  }

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');

    const existing = await this.prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await this.prisma.userFollow.delete({ where: { id: existing.id } });
      return { following: false };
    } else {
      await this.prisma.userFollow.create({ data: { followerId, followingId } });
      return { following: true };
    }
  }
}
