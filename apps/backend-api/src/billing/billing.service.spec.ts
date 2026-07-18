import { Test, TestingModule } from "@nestjs/testing";
import { BillingService } from "./billing.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  creditTransaction: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  paymentMethod: {
    findMany: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  invoice: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe("BillingService", () => {
  let service: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("addCredits", () => {
    it("should throw BadRequestException if amount is negative", async () => {
      await expect(service.addCredits("user_1", -10, "Test")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should add credits and create a transaction successfully", async () => {
      mockPrismaService.user.update.mockResolvedValue({
        id: "user_1",
        credits: 20,
      });
      mockPrismaService.creditTransaction.create.mockResolvedValue({
        id: "txn_1",
      });

      const result = await service.addCredits("user_1", 10, "Test Deposit");

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user_1" },
        data: { credits: { increment: 10 } },
      });
      expect(mockPrismaService.creditTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: "user_1",
          amount: 10,
          reason: "Test Deposit",
        },
      });
      expect(result).toEqual({
        user: { id: "user_1", credits: 20 },
        transaction: { id: "txn_1" },
      });
    });
  });

  describe("deductCredits", () => {
    it("should throw BadRequestException if user does not have enough credits", async () => {
      mockPrismaService.user.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deductCredits("user_1", 10, "Test Spend"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should deduct credits successfully if sufficient balance", async () => {
      mockPrismaService.user.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: "user_1",
        credits: 40,
      });
      mockPrismaService.creditTransaction.create.mockResolvedValue({
        id: "txn_2",
      });

      const result = await service.deductCredits("user_1", 10, "Test Spend");

      expect(mockPrismaService.user.updateMany).toHaveBeenCalledWith({
        where: { id: "user_1", credits: { gte: 10 } },
        data: { credits: { decrement: 10 } },
      });
      expect(result).toEqual({
        user: { id: "user_1", credits: 40 },
        transaction: { id: "txn_2" },
      });
    });
  });

  describe("getSubscription", () => {
    it("should return FREE plan if user has no subscription", async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      const sub = await service.getSubscription("user_1");
      expect(sub.plan).toBe(SubscriptionPlan.FREE);
    });
  });
});
