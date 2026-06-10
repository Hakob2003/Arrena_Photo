import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateStatus } from '@prisma/client';

@Injectable()
export class TemplatesImportExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportTemplate(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    return {
      name: template.name,
      description: template.description,
      categorySlug: template.category.slug,
      tags: template.tags.map(t => t.name),
      coverUrl: template.coverUrl,
      galleryUrls: template.galleryUrls,
      recommendedModels: template.recommendedModels,
      versions: template.versions.map(v => ({
        versionNumber: v.versionNumber,
        prompt: v.prompt,
        negativePrompt: v.negativePrompt,
        settings: v.settings,
      })),
    };
  }

  async importTemplate(userId: string, data: any) {
    // 1. Убедимся, что категория существует
    let category = await this.prisma.templateCategory.findUnique({ where: { slug: data.categorySlug } });
    if (!category) {
      category = await this.prisma.templateCategory.create({
        data: { name: data.categorySlug, slug: data.categorySlug },
      });
    }

    // 2. Убедимся, что теги существуют
    const tagConnections = await Promise.all(
      (data.tags || []).map(async (tagName: string) => {
        let tag = await this.prisma.templateTag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await this.prisma.templateTag.create({ data: { name: tagName } });
        }
        return { id: tag.id };
      })
    );

    // 3. Создаем шаблон
    const template = await this.prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: category.id,
        creatorId: userId,
        coverUrl: data.coverUrl,
        galleryUrls: data.galleryUrls || [],
        recommendedModels: data.recommendedModels || [],
        status: TemplateStatus.DRAFT,
        tags: { connect: tagConnections },
      },
    });

    // 4. Импортируем версии
    if (data.versions && data.versions.length > 0) {
      await this.prisma.templateVersion.createMany({
        data: data.versions.map((v: any) => ({
          templateId: template.id,
          versionNumber: v.versionNumber,
          prompt: v.prompt,
          negativePrompt: v.negativePrompt,
          settings: v.settings || {},
        })),
      });
    }

    return template;
  }
}
