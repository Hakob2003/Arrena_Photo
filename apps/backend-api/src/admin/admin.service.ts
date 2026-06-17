import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      usersCount,
      usersDay,
      usersWeek,
      usersMonth,
      templatesCount,
      generationsCount,
      generationsSuccess,
      generationsFailed,
      totalRevenue,
      activeSubscriptions,
      popularTemplates,
      aiUsageSum
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: oneMonthAgo } } }),
      this.prisma.template.count(),
      this.prisma.generation.count(),
      this.prisma.generation.count({ where: { status: 'DONE' } }),
      this.prisma.generation.count({ where: { status: 'FAILED' } }),
      this.prisma.purchase.aggregate({ _sum: { amount: true } }),
      this.prisma.subscription.count({ where: { plan: { not: 'FREE' } } }),
      this.prisma.template.findMany({
        take: 5,
        orderBy: { downloadCount: 'desc' },
        select: { id: true, name: true, downloadCount: true }
      }),
      this.prisma.aIUsage.aggregate({ _sum: { totalTokens: true } })
    ]);

    // For chart data, generating a 7-day mock trend for now.
    // In production, this would be a group-by query using prisma.$queryRaw
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 500) + 50,
        generations: Math.floor(Math.random() * 200) + 100,
      };
    });

    return {
      users: usersCount,
      newUsers: {
        day: usersDay,
        week: usersWeek,
        month: usersMonth
      },
      templates: templatesCount,
      generations: {
        total: generationsCount,
        success: generationsSuccess,
        failed: generationsFailed
      },
      revenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
      popularTemplates,
      apiTokensUsed: aiUsageSum._sum.totalTokens || 0,
      chartData
    };
  }

  async getRecentUsers() {
    return this.prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, createdAt: true, role: { select: { name: true } } },
    });
  }

  // --- Users ---
  async getAllUsers(page: number = 1, limit: number = 20, search?: string, roleName?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (roleName) {
      where.role = { name: roleName.toUpperCase() };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { 
          role: true, 
          subscription: true,
          _count: { select: { generations: true } }
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    
    // Map the users to include generation count cleanly
    const mappedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      status: u.status,
      credits: u.credits,
      role: u.role,
      plan: u.subscription?.plan || 'FREE',
      generationCount: u._count.generations
    }));
    
    return { users: mappedUsers, total, page, limit };
  }

  async updateUserCredits(userId: string, amount: number, reason: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: amount }
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: amount > 0 ? 'CREDITS_ADDED' : 'CREDITS_REMOVED',
        details: { amount, reason }
      }
    });

    return user;
  }

  async updateUserPlan(userId: string, plan: string) {
    // Basic logic: update or create a subscription
    const existingSub = await this.prisma.subscription.findFirst({
      where: { userId }
    });

    // Validate plan name
    const validPlan = plan === 'PRO' || plan === 'ENTERPRISE' ? plan : 'FREE';

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: { plan: validPlan, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // 30 days
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: validPlan,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PLAN_CHANGED',
        details: { plan }
      }
    });

    return { success: true };
  }

  async importUsers(emails: string[]) {
    // Create users with no password (they will reset it or use OAuth)
    const role = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!role) throw new NotFoundException('USER role not found');

    let importedCount = 0;
    for (const email of emails) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (!existing) {
        await this.prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            roleId: role.id,
          }
        });
        importedCount++;
      }
    }

    return { success: true, importedCount };
  }

  async banUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'BANNED' }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_BANNED',
        details: { reason: 'Banned by admin' },
      }
    });
    
    return { success: true, message: 'User banned successfully' };
  }

  async unbanUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_UNBANNED',
        details: { reason: 'Unbanned by admin' },
      }
    });
    
    return { success: true, message: 'User unbanned successfully' };
  }

  async deleteUser(userId: string) {
    // Delete user completely
    await this.prisma.user.delete({
      where: { id: userId }
    });
    return { success: true, message: 'User deleted successfully' };
  }

  // --- Templates ---
  async getAllTemplates(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { name: true, email: true } }, category: true },
      }),
      this.prisma.template.count(),
    ]);
    return { templates, total, page, limit };
  }

  async approveTemplate(templateId: string) {
    return this.prisma.template.update({
      where: { id: templateId },
      data: { isApproved: true, status: 'PUBLISHED' },
    });
  }

  async rejectTemplate(templateId: string) {
    return this.prisma.template.update({
      where: { id: templateId },
      data: { isApproved: false, status: 'DRAFT' },
    });
  }

  // --- Generations ---
  async getGenerations(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [generations, total] = await Promise.all([
      this.prisma.generation.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } }, aiModel: true },
      }),
      this.prisma.generation.count(),
    ]);
    return { generations, total, page, limit };
  }

  // --- Audit Logs ---
  async getAuditLogs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { logs, total, page, limit };
  }

  // --- Payouts (Marketplace) ---
  async getPayouts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [payouts, total, metrics] = await Promise.all([
      this.prisma.payout.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      this.prisma.payout.count(),
      this.prisma.payout.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      })
    ]);

    // Also get pending total
    const pendingMetrics = await this.prisma.payout.aggregate({
      _sum: { amount: true },
      where: { status: 'PENDING' }
    });

    return { 
      payouts, 
      total, 
      page, 
      limit,
      totalPaid: metrics._sum.amount || 0,
      pendingAmount: pendingMetrics._sum.amount || 0
    };
  }

  async processPayout(payoutId: string) {
    return this.prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'COMPLETED' }
    });
  }

  // --- API Keys (AI Providers) ---
  async getApiProviders(adminId: string) {
    const providers = await this.prisma.aIProvider.findMany({
      include: {
        connections: {
          where: { userId: adminId },
          select: { id: true, encryptedApiKey: true }
        }
      }
    });

    return providers.map(p => ({
      id: p.id,
      name: p.name,
      isGlobal: p.isGlobal,
      hasKeySet: p.connections.length > 0 && !!p.connections[0].encryptedApiKey
    }));
  }

  async updateGlobalApiKey(adminId: string, providerId: string, apiKey: string) {
    // In a real app, use AES-256-GCM encryption here.
    // For demonstration, we just base64 it or store directly if it's an MVP
    const encryptedKey = Buffer.from(apiKey).toString('base64'); // Mock encryption

    const existingConnection = await this.prisma.aIConnection.findUnique({
      where: { userId_providerId: { userId: adminId, providerId } }
    });

    if (existingConnection) {
      return this.prisma.aIConnection.update({
        where: { id: existingConnection.id },
        data: { encryptedApiKey: encryptedKey }
      });
    }

    return this.prisma.aIConnection.create({
      data: {
        userId: adminId,
        providerId,
        encryptedApiKey: encryptedKey
      }
    });
  }

  // --- Billing ---
  async getBillingStats() {
    const [totalRevenue, activeSubscriptions, recentPurchases] = await Promise.all([
      this.prisma.purchase.aggregate({ _sum: { amount: true } }),
      this.prisma.subscription.count({ where: { plan: { not: 'FREE' } } }),
      this.prisma.purchase.findMany({
        take: 10,
        orderBy: { purchasedAt: 'desc' },
        include: { user: { select: { email: true } } }
      })
    ]);

    return {
      revenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
      recentPurchases
    };
  }

  // --- AI Models ---
  async getAIModels(page: number = 1, limit: number = 50, search?: string, providerId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (providerId) {
      where.providerId = providerId;
    }

    const [models, total] = await Promise.all([
      this.prisma.aIModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: { select: { id: true, name: true } },
          _count: { select: { generations: true } }
        }
      }),
      this.prisma.aIModel.count({ where })
    ]);

    const mappedModels = models.map(m => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      endpoint: m.endpoint,
      description: m.description,
      isFree: m.isFree,
      isActive: m.isActive,
      costPerToken: m.costPerToken,
      speed: m.speed,
      provider: m.provider,
      requestCount: m._count.generations,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));

    return { models: mappedModels, total, page, limit };
  }

  async getAIProvidersList() {
    return this.prisma.aIProvider.findMany({
      select: { id: true, name: true, isGlobal: true, _count: { select: { models: true } } },
      orderBy: { name: 'asc' }
    });
  }

  async createAIModel(data: {
    name: string;
    slug: string;
    providerId: string;
    endpoint?: string;
    description?: string;
    isFree?: boolean;
    isActive?: boolean;
    costPerToken?: number;
    speed?: string;
  }) {
    // Ensure provider exists, create if not
    let provider = await this.prisma.aIProvider.findUnique({ where: { id: data.providerId } });
    if (!provider) {
      // Try finding by name
      provider = await this.prisma.aIProvider.findUnique({ where: { name: data.providerId } });
    }
    if (!provider) {
      provider = await this.prisma.aIProvider.create({
        data: { name: data.providerId, isGlobal: true }
      });
    }

    return this.prisma.aIModel.create({
      data: {
        name: data.name,
        slug: data.slug,
        providerId: provider.id,
        endpoint: data.endpoint,
        description: data.description,
        isFree: data.isFree ?? false,
        isActive: data.isActive ?? true,
        costPerToken: data.costPerToken ?? 0,
        speed: data.speed ?? 'medium',
      },
      include: {
        provider: { select: { id: true, name: true } },
        _count: { select: { generations: true } }
      }
    });
  }

  async updateAIModel(id: string, data: {
    name?: string;
    slug?: string;
    providerId?: string;
    endpoint?: string;
    description?: string;
    isFree?: boolean;
    isActive?: boolean;
    costPerToken?: number;
    speed?: string;
  }) {
    const model = await this.prisma.aIModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException('AI Model not found');

    return this.prisma.aIModel.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.providerId !== undefined && { providerId: data.providerId }),
        ...(data.endpoint !== undefined && { endpoint: data.endpoint }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.costPerToken !== undefined && { costPerToken: data.costPerToken }),
        ...(data.speed !== undefined && { speed: data.speed }),
      },
      include: {
        provider: { select: { id: true, name: true } },
        _count: { select: { generations: true } }
      }
    });
  }

  async toggleAIModel(id: string) {
    const model = await this.prisma.aIModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException('AI Model not found');

    return this.prisma.aIModel.update({
      where: { id },
      data: { isActive: !model.isActive },
      include: {
        provider: { select: { id: true, name: true } },
        _count: { select: { generations: true } }
      }
    });
  }

  async deleteAIModel(id: string) {
    const model = await this.prisma.aIModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException('AI Model not found');

    await this.prisma.aIModel.delete({ where: { id } });
    return { success: true, message: 'AI Model deleted' };
  }

  // --- AI Model & Template Assignment ---
  
  async getTemplatesForAssignment() {
    return this.prisma.template.findMany({
      select: {
        id: true,
        name: true,
        recommendedModels: true,
        category: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  async assignModelToTemplates(modelId: string, templateIds: string[]) {
    const model = await this.prisma.aIModel.findUnique({ where: { id: modelId } });
    if (!model) throw new NotFoundException('AI Model not found');

    const slug = model.slug;

    // Get all templates that currently have this model slug in recommendedModels
    const currentTemplates = await this.prisma.template.findMany({
      where: { recommendedModels: { has: slug } },
      select: { id: true, recommendedModels: true }
    });

    const currentIds = currentTemplates.map(t => t.id);

    // Templates to add slug to
    const toAdd = templateIds.filter(id => !currentIds.includes(id));
    // Templates to remove slug from
    const toRemove = currentIds.filter(id => !templateIds.includes(id));

    // Update templates to add slug
    for (const tId of toAdd) {
      const t = await this.prisma.template.findUnique({ where: { id: tId }, select: { recommendedModels: true } });
      if (t) {
        await this.prisma.template.update({
          where: { id: tId },
          data: {
            recommendedModels: {
              set: [...t.recommendedModels, slug]
            }
          }
        });
      }
    }

    // Update templates to remove slug
    for (const tId of toRemove) {
      const t = currentTemplates.find(ct => ct.id === tId);
      if (t) {
        await this.prisma.template.update({
          where: { id: tId },
          data: {
            recommendedModels: {
              set: t.recommendedModels.filter(s => s !== slug)
            }
          }
        });
      }
    }

    return { success: true, message: 'Model assignments updated' };
  }
}
