import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/marketplace.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async addReview(userId: string, templateId: string, dto: CreateReviewDto) {
    const template = await this.prisma.template.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');

    const existing = await this.prisma.review.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });
    if (existing) throw new BadRequestException('You already reviewed this template');

    const review = await this.prisma.review.create({
      data: {
        userId,
        templateId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    await this.updateTemplateRating(templateId);
    return review;
  }

  private async updateTemplateRating(templateId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { templateId },
      _avg: { rating: true },
    });
    await this.prisma.template.update({
      where: { id: templateId },
      data: { avgRating: agg._avg.rating || 0 },
    });
  }

  async getReviews(templateId: string) {
    return this.prisma.review.findMany({
      where: { templateId },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
