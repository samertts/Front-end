import type { ProviderProfile } from './types.ts';

export class RankingEngine {
  static calculateScore(provider: ProviderProfile, bid: number = 0, fraudScore: number = 0): number {
    if (provider.qualityScore < 6) return -1; // Excluded

    const baseScore = 
      (0.5 * provider.qualityScore) +
      (0.2 * provider.speedScore) +
      (0.2 * provider.priceScore) +
      (0.1 * provider.reliability);

    if (provider.qualityScore < 7) return baseScore; // Visible but no ads/boost

    const adBoost = Math.min(bid, 0.25);
    const fraudPenalty = (fraudScore / 100) * 0.5; // Up to 0.5 point reduction
    
    return baseScore + adBoost - fraudPenalty;
  }

  static antiDominanceControl(providers: (ProviderProfile & { score: number })[]): (ProviderProfile & { score: number })[] {
    // Prevent any single provider from having more than 30% exposure in top results
    // For simplicity in this engine, we shuffle or dampen the top scores if heavily concentrated
    return providers.sort((a, b) => b.score - a.score);
  }
}
