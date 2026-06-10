import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async purchaseTemplate(userId: string, templateId: string) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
      include: { marketplace: true },
    });

    if (!template) throw new NotFoundException('Template not found');
    if (!template.isApproved) throw new BadRequestException('Template not approved for sale');

    const price = template.price || 0;

    if (price === 0) {
      // Free download
      await this.prisma.template.update({
        where: { id: templateId },
        data: { downloadCount: { increment: 1 } },
      });
      return { success: true, purchased: true, message: 'Template downloaded' };
    }

    // Check if already purchased
    if (template.marketplace) {
      const existing = await this.prisma.purchase.findFirst({
        where: { userId, marketplaceItemId: template.marketplace.id },
      });
      if (existing) return { success: true, purchased: true, message: 'Already purchased' };

      // Pseudo-logic for buying using credits or payment integration
      // Assume user has credits (from User model) or we charge via Stripe here
      
      await this.prisma.purchase.create({
        data: {
          userId,
          marketplaceItemId: template.marketplace.id,
          amount: price,
        },
      });

      await this.prisma.template.update({
        where: { id: templateId },
        data: { downloadCount: { increment: 1 } },
      });

      return { success: true, purchased: true, message: 'Template purchased successfully' };
    }

    throw new BadRequestException('Template is not listed on marketplace');
  }

  async reportTemplate(userId: string, templateId: string, reason: string, details?: string) {
    return this.prisma.templateReport.create({
      data: {
        userId,
        templateId,
        reason,
        details,
      },
    });
  }
}
