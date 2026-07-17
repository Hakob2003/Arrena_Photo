export interface CreateIntentResult {
  clientSecret: string;
  providerPaymentId: string;
}

export interface CreateSubscriptionResult {
  clientSecret: string;
  subscriptionId: string;
  providerPaymentId: string;
}

export interface PaymentProvider {
  /**
   * Retrieves an existing provider customer ID or creates a new one
   */
  getOrCreateCustomer(email: string, name?: string, userId?: string): Promise<string>;

  /**
   * Creates a payment intent for a one-time purchase (e.g. credits)
   */
  createPaymentIntentForCredits(
    userId: string,
    customerId: string,
    amountUsd: number,
    credits: number
  ): Promise<CreateIntentResult>;

  /**
   * Creates or resumes a recurring subscription
   */
  createSubscription(
    userId: string,
    customerId: string,
    priceId: string,
    planName: string
  ): Promise<CreateSubscriptionResult>;

  /**
   * Cancels an active subscription in the provider
   */
  cancelSubscription(subscriptionId: string): Promise<void>;

  /**
   * Used to cleanup stale incomplete subscriptions
   */
  listIncompleteSubscriptions(customerId: string): Promise<any[]>;
  
  /**
   * Process a direct payment token from Google Pay or Apple Pay
   * Since this is a direct token charge, it might not need a clientSecret returned,
   * but rather processes the payment synchronously or returns a requirement for 3DS.
   */
  processWalletToken(
    token: any, 
    amountUsd: number, 
    customerId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; providerPaymentId?: string; errorMessage?: string }>;

  /**
   * Process a direct subscription token from Google Pay or Apple Pay
   */
  processWalletSubscriptionToken(
    token: any,
    customerId: string,
    priceId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; providerPaymentId?: string; errorMessage?: string }>;
}
