import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateVersionsService } from './template-versions.service';
import { CreateTemplateDto, UpdateTemplateDto, FilterTemplatesDto } from './dto/template.dto';
import { TemplateStatus, Prisma } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private versionsService: TemplateVersionsService,
  ) {}

  async create(userId: string, dto: CreateTemplateDto) {
    const tagConnections = await Promise.all(
      dto.tags.map(async (tagName) => {
        let tag = await this.prisma.templateTag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await this.prisma.templateTag.create({ data: { name: tagName } });
        }
        return { id: tag.id };
      })
    );

    const template = await this.prisma.template.create({
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        creatorId: userId,
        coverUrl: dto.coverUrl,
        galleryUrls: dto.galleryUrls || [],
        recommendedModels: dto.recommendedModels || [],
        status: TemplateStatus.DRAFT,
        tags: { connect: tagConnections },
      },
    });

    await this.versionsService.createVersion(template.id, dto.prompt, dto.negativePrompt, dto.settings);

    return this.findOne(template.id);
  }

  async findAll(query: FilterTemplatesDto) {
    const where: Prisma.TemplateWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.tags && query.tags.length > 0 && {
        tags: { some: { name: { in: query.tags } } }
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ]
      })
    };

    const [total, items] = await Promise.all([
      this.prisma.template.count({ where }),
      this.prisma.template.findMany({
        where,
        include: {
          category: true,
          tags: true,
          _count: { select: { generations: true } },
        },
        skip: query.skip || 0,
        take: query.take || 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, items };
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const updateData: any = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description && { description: dto.description }),
      ...(dto.categoryId && { categoryId: dto.categoryId }),
      ...(dto.coverUrl && { coverUrl: dto.coverUrl }),
      ...(dto.galleryUrls && { galleryUrls: dto.galleryUrls }),
      ...(dto.recommendedModels && { recommendedModels: dto.recommendedModels }),
      ...(dto.status && { status: dto.status }),
    };

    if (dto.tags) {
      const tagConnections = await Promise.all(
        dto.tags.map(async (tagName) => {
          let tag = await this.prisma.templateTag.findUnique({ where: { name: tagName } });
          if (!tag) { tag = await this.prisma.templateTag.create({ data: { name: tagName } }); }
          return { id: tag.id };
        })
      );
      updateData.tags = { set: tagConnections };
    }

    const updatedTemplate = await this.prisma.template.update({
      where: { id },
      data: updateData,
    });

    // Если передан новый промпт - создаем новую версию
    if (dto.prompt) {
      await this.versionsService.createVersion(id, dto.prompt, dto.negativePrompt, dto.settings);
    }

    return this.findOne(id);
  }

  async setStatus(id: string, status: TemplateStatus) {
    return this.prisma.template.update({
      where: { id },
      data: { status },
    });
  }

  async getRecommendations(id: string) {
    const template = await this.findOne(id);
    const tagIds = template.tags.map(t => t.id);

    return this.prisma.template.findMany({
      where: {
        id: { not: id },
        status: TemplateStatus.PUBLISHED,
        OR: [
          { categoryId: template.categoryId },
          { tags: { some: { id: { in: tagIds } } } }
        ]
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
  }
}
