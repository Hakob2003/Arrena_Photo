import { Test, TestingModule } from "@nestjs/testing";
import { StripeProvider } from "./stripe.provider";
import { ConfigService } from "@nestjs/config";

// Mock the entire Stripe module
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => {
    return {
      customers: {
        create: jest.fn().mockResolvedValue({ id: "cus_123" }),
      },
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: "pi_123",
          client_secret: "secret_123",
        }),
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue({
          id: "sub_123",
          latest_invoice: {
            payment_intent: {
              id: "pi_sub",
              client_secret: "secret_sub",
            },
          },
        }),
      },
    };
  });
});

describe("StripeProvider", () => {
  let provider: StripeProvider;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === "STRIPE_SECRET_KEY") return "sk_test_123";
              return null;
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<StripeProvider>(StripeProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(provider).toBeDefined();
  });

  describe("getOrCreateCustomer", () => {
    it("should create a customer and return the ID", async () => {
      const customerId = await provider.getOrCreateCustomer(
        "test@example.com",
        "Test User",
        "user_1",
      );
      expect(customerId).toBe("cus_123");
    });
  });

  describe("createPaymentIntentForCredits", () => {
    it("should return clientSecret and providerPaymentId", async () => {
      const result = await provider.createPaymentIntentForCredits(
        "user_1",
        "cus_123",
        10,
        100,
      );
      expect(result).toEqual({
        clientSecret: "secret_123",
        providerPaymentId: "pi_123",
      });
    });
  });

  describe("createSubscription", () => {
    it("should create subscription and return intent details", async () => {
      const result = await provider.createSubscription(
        "user_1",
        "cus_123",
        "price_123",
        "PRO",
      );
      expect(result).toEqual({
        clientSecret: "secret_sub",
        subscriptionId: "sub_123",
        providerPaymentId: "pi_sub",
      });
    });
  });
});
