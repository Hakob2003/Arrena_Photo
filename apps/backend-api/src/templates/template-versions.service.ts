import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplateVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createVersion(templateId: string, prompt: string, negativePrompt?: string, settings?: any) {
    const latestVersion = await this.prisma.templateVersion.findFirst({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersion = latestVersion ? latestVersion.versionNumber + 1 : 1;

    return this.prisma.templateVersion.create({
      data: {
        templateId,
        versionNumber: nextVersion,
        prompt,
        negativePrompt,
        settings: settings || {},
      },
    });
  }

  async getVersions(templateId: string) {
    return this.prisma.templateVersion.findMany({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
    });
  }
}
