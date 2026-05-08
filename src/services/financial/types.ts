export const FINANCIAL_TYPES_READY = true;

export type ProviderPlan = 'free' | 'basic' | 'premium' | 'institutional';

export interface ProviderProfile {
  id: string;
  name: string;
  plan: ProviderPlan;
  qualityScore: number;
  rating: number;
  speedScore: number;
  priceScore: number;
  reliability: number;
}

export interface ClickContext {
  ip: string;
  userAgent: string;
  fingerprint: string;
  userId?: string;
  referrer?: string;
}

export interface AdCampaign {
  id: string;
  providerId: string;
  bid: number;
  dailyLimit: number;
  spentToday: number;
  active: boolean;
  fraudScore?: number;
  deactivatedReason?: string;
}

export interface FraudReport {
  isFraud: boolean;
  score: number;
  reasons: string[];
  penaltyRecommendation?: 'deactivate' | 'throttle' | 'flag';
}

export interface Transaction {
  id: string;
  providerId: string;
  type: 'test_fee' | 'subscription' | 'ad_spend' | 'credit';
  amount: number;
  testId?: string;
  createdAt: string;
}
