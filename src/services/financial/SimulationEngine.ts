import { ProviderProfile, ProviderPlan } from './types.ts';
import { RankingEngine } from './RankingEngine.ts';
import { PricingEngine } from './PricingEngine.ts';

export class SimulationEngine {
  static simulateMarket(providerCount: number = 10) {
    const plans: ProviderPlan[] = ['free', 'basic', 'premium', 'institutional'];
    const providers: ProviderProfile[] = Array.from({ length: providerCount }, (_, i) => ({
      id: `prov-${i}`,
      name: `Laboratory Alpha ${i}`,
      plan: plans[Math.floor(Math.random() * plans.length)],
      qualityScore: 6 + Math.random() * 4,
      rating: 4 + Math.random(),
      speedScore: 7 + Math.random() * 3,
      priceScore: 5 + Math.random() * 5,
      reliability: 0.8 + Math.random() * 0.2
    }));

    const results = providers.map(p => {
      const bid = p.plan === 'institutional' ? 0.2 : 0.05;
      const score = RankingEngine.calculateScore(p, bid);
      const fee = PricingEngine.calculateFee(p, 1200); // simulate 1200 tests
      
      return {
        id: p.id,
        name: p.name,
        score,
        fee,
        quality: p.qualityScore.toFixed(2)
      };
    });

    return {
      timestamp: new Date().toISOString(),
      providerCount: providers.length,
      averageQuality: (providers.reduce((acc, p) => acc + p.qualityScore, 0) / providers.length).toFixed(2),
      rankings: results.sort((a, b) => b.score - a.score).slice(0, 5),
      marketFairnessScore: 0.95 // Simulated stability metric
    };
  }
}
