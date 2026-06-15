import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateVersionsService } from './template-versions.service';
import { CreateTemplateDto, UpdateTemplateDto, FilterTemplatesDto, BulkActionDto, BulkTemplateAction, ImportTemplatesRequestDto } from './dto/template.dto';
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
        price: dto.price ?? null,
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
      ...(dto.price !== undefined && { price: dto.price }),
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

  // --- Admin Methods ---

  async delete(id: string) {
    return this.prisma.template.delete({
      where: { id }
    });
  }

  async clone(id: string, userId: string) {
    const original = await this.findOne(id);
    const latestVersion = original.versions[0];

    const newTemplate = await this.prisma.template.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        categoryId: original.categoryId,
        creatorId: userId, // The admin cloning it
        coverUrl: original.coverUrl,
        galleryUrls: original.galleryUrls,
        recommendedModels: original.recommendedModels,
        status: TemplateStatus.DRAFT,
        price: original.price,
        tags: {
          connect: original.tags.map(t => ({ id: t.id }))
        }
      }
    });

    if (latestVersion) {
      await this.versionsService.createVersion(
        newTemplate.id,
        latestVersion.prompt,
        latestVersion.negativePrompt,
        latestVersion.settings
      );
    }

    return this.findOne(newTemplate.id);
  }

  async bulkAction(action: BulkTemplateAction, templateIds: string[]) {
    if (action === BulkTemplateAction.DELETE) {
      return this.prisma.template.deleteMany({
        where: { id: { in: templateIds } }
      });
    }

    let targetStatus: TemplateStatus;
    if (action === BulkTemplateAction.PUBLISH) targetStatus = TemplateStatus.PUBLISHED;
    else if (action === BulkTemplateAction.ARCHIVE) targetStatus = TemplateStatus.ARCHIVED;
    else targetStatus = TemplateStatus.DRAFT;

    return this.prisma.template.updateMany({
      where: { id: { in: templateIds } },
      data: { status: targetStatus }
    });
  }

  async getCategories() {
    let categories = await this.prisma.templateCategory.findMany({
      orderBy: { name: 'asc' }
    });

    if (categories.length === 0) {
      const defaultCategories = [
        'Business', 'Corporate', 'LinkedIn', 'Dating', 'Wedding', 
        'Fashion', 'Gaming', 'Fantasy', 'Anime', 'Pixel Art', 
        'Kids', 'Professional', 'Social Media'
      ];
      
      await this.prisma.templateCategory.createMany({
        data: defaultCategories.map(name => ({
          name,
          slug: name.toLowerCase().replace(/ /g, '-')
        }))
      });
      
      categories = await this.prisma.templateCategory.findMany({
        orderBy: { name: 'asc' }
      });
    }


    return categories;
  }

  async importTemplates(userId: string, dto: ImportTemplatesRequestDto) {
    let imported = 0;
    
    // First, ensure all categories exist and cache their IDs
    const categoryMap = new Map<string, string>();
    const existingCats = await this.getCategories();
    for (const cat of existingCats) {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    }

    for (const tpl of dto.templates) {
      const catNameLower = tpl.categoryName.toLowerCase();
      let categoryId = categoryMap.get(catNameLower);
      
      if (!categoryId) {
        // Create category if it doesn't exist
        const newCat = await this.prisma.templateCategory.create({
          data: {
            name: tpl.categoryName,
            slug: tpl.categoryName.toLowerCase().replace(/\s+/g, '-')
          }
        });
        categoryId = newCat.id;
        categoryMap.set(catNameLower, categoryId);
      }

      // Create template
      const newTemplate = await this.prisma.template.create({
        data: {
          name: tpl.name,
          description: tpl.description || '',
          categoryId,
          creatorId: userId,
          coverUrl: tpl.coverUrl || '',
          galleryUrls: [],
          recommendedModels: tpl.recommendedModels || ['sdxl-1.0'],
          status: tpl.status || TemplateStatus.DRAFT,
          price: tpl.price ?? null,
        }
      });

      // Create version
      await this.versionsService.createVersion(
        newTemplate.id,
        tpl.prompt,
        tpl.negativePrompt || '',
        {}
      );

      imported++;
    }

    return { imported };
  }
}
