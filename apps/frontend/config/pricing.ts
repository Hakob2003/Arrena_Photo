export const CREDIT_PACKAGES = [
  { id: "pack_500", label: "500", amountUsd: 8, credits: 500 },
  { id: "pack_2000", label: "2000", amountUsd: 25, credits: 2000, popular: true },
  { id: "pack_5000", label: "5000", amountUsd: 60, credits: 5000 },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];

export const SUBSCRIPTION_PLANS = [
  { 
    id: 'free', 
    name: 'Free', 
    price: '$0', 
    priceNum: 0, 
    credits: '100', 
    models: 'Basic', 
    features: ['billing.plans.features.free.1', 'billing.plans.features.free.2', 'billing.plans.features.free.3'] 
  },
  { 
    id: 'starter', 
    name: 'Starter', 
    price: '$9', 
    priceNum: 9, 
    credits: '1000', 
    models: 'All', 
    features: ['billing.plans.features.starter.1', 'billing.plans.features.starter.2', 'billing.plans.features.starter.3'] 
  },
  { 
    id: 'pro', 
    name: 'Pro Creator', 
    price: '$29', 
    priceNum: 29, 
    credits: '5000', 
    models: 'All + Exclusive', 
    features: ['billing.plans.features.pro.1', 'billing.plans.features.pro.2', 'billing.plans.features.pro.3'] 
  },
  { 
    id: 'business', 
    name: 'Business', 
    price: '$99', 
    priceNum: 99, 
    credits: 'Unlimited', 
    models: 'All + Exclusive', 
    features: ['billing.plans.features.business.1', 'billing.plans.features.business.2', 'billing.plans.features.business.3'] 
  },
];
