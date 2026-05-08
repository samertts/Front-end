import { ProviderProfile } from './types.ts';

export class PricingEngine {
  private static readonly BASE_TEST_FEE = 1500; // IQD or equivalent
  private static readonly THRESHOLD = 1000; // Tests per month
  private static readonly MIN_BILLING = {
    free: 0,
    basic: 25000,
    premium: 75000,
    institutional: 250000
  };

  static calculateFee(provider: ProviderProfile, testCount: number): number {
    let multiplier = 1.0;
    
    // Plan-based discounts
    if (provider.plan === 'premium') multiplier = 0.85;
    if (provider.plan === 'institutional') multiplier = 0.70;

    // Quality discount
    const qualityDiscount = Math.min((provider.qualityScore - 5) * 0.02, 0.1);
    multiplier -= Math.max(0, qualityDiscount);

    let fee = this.BASE_TEST_FEE * multiplier;

    // Diminishing returns after threshold
    if (testCount > this.THRESHOLD) {
      const volumeDiscount = Math.min((testCount - this.THRESHOLD) * 0.0001, 0.2);
      fee *= (1 - volumeDiscount);
    }

    return Math.round(fee);
  }

  static enforceMinimumBill(provider: ProviderProfile, currentTotal: number): number {
    const min = this.MIN_BILLING[provider.plan] || 0;
    return Math.max(currentTotal, min);
  }
}
