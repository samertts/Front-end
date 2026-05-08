import { ProviderProfile } from './types';

export class IncentiveEngine {
  static grantQualityBonus(provider: ProviderProfile): { credits: number; reason: string } | null {
    if (provider.qualityScore > 9.5) {
      return {
        credits: 50000,
        reason: 'Exceptional Quality Standard Maintenance'
      };
    }
    return null;
  }

  static grantEfficiencyBonus(speedScore: number): { credits: number; reason: string } | null {
    if (speedScore > 9.0) {
      return {
        credits: 25000,
        reason: 'High Throughput Efficiency'
      };
    }
    return null;
  }
}
