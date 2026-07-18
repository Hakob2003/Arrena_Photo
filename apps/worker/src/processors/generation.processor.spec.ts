import { Test, TestingModule } from "@nestjs/testing";
import { GenerationProcessor } from "./generation.processor";
import { PrismaService } from "../prisma/prisma.service";
import { ModuleRef } from "@nestjs/core";
import { BillingService } from "../billing/billing.service";
import { StorageService } from "../storage/storage.service";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

const mockPrismaService = {
  generation: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  template: {
    findUnique: jest.fn(),
  },
  aIConnection: {
    findFirst: jest.fn(),
  },
  resultImage: {
    create: jest.fn(),
  },
};

const mockBillingService = {
  addCredits: jest.fn(),
};

const mockStorageService = {
  uploadImageFromUrl: jest.fn(),
  deleteFile: jest.fn(),
};

const mockModuleRef = {
  get: jest.fn(),
};

describe("GenerationProcessor", () => {
  let processor: GenerationProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerationProcessor,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ModuleRef, useValue: mockModuleRef },
        { provide: BillingService, useValue: mockBillingService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    processor = module.get<GenerationProcessor>(GenerationProcessor);
    // Suppress logger output in tests
    jest.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });

  describe("onFailed", () => {
    it("should refund credits if final attempt failed", async () => {
      const job = {
        id: "job_1",
        attemptsMade: 3,
        opts: { attempts: 3 },
        data: { generationId: "gen_1" },
      } as unknown as Job;

      mockPrismaService.generation.findUnique.mockResolvedValue({
        id: "gen_1",
        userId: "user_1",
        templateId: "tpl_1",
      });
      mockPrismaService.template.findUnique.mockResolvedValue({
        id: "tpl_1",
        price: 15,
      });

      await processor.onFailed(job, new Error("Test Error"));

      expect(mockBillingService.addCredits).toHaveBeenCalledWith(
        "user_1",
        15,
        "Refund for failed generation",
      );
    });

    it("should NOT refund credits if not final attempt", async () => {
      const job = {
        id: "job_1",
        attemptsMade: 1,
        opts: { attempts: 3 },
        data: { generationId: "gen_1" },
      } as unknown as Job;

      await processor.onFailed(job, new Error("Test Error"));

      expect(mockBillingService.addCredits).not.toHaveBeenCalled();
    });
  });

  describe("process", () => {
    it("should throw error if generation not found", async () => {
      const job = {
        data: { generationId: "gen_1", prompt: "test" },
      } as unknown as Job;

      mockPrismaService.generation.findUnique.mockResolvedValue(null);

      await expect(processor.process(job as any)).rejects.toThrow(
        "Generation not found",
      );
    });
  });
});
