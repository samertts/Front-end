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

export interface AdCampaign {
  id: string;
  providerId: string;
  bid: number;
  dailyLimit: number;
  spentToday: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  providerId: string;
  type: 'test_fee' | 'subscription' | 'ad_spend' | 'credit';
  amount: number;
  testId?: string;
  createdAt: string;
}
