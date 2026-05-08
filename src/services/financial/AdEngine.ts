import { AdCampaign } from './types';

export class AdEngine {
  static validateClick(campaign: AdCampaign, context: { ip: string; userId?: string }): { valid: boolean; reason?: string } {
    if (!campaign.active) return { valid: false, reason: 'Campaign inactive' };
    if (campaign.spentToday >= campaign.dailyLimit) return { valid: false, reason: 'Budget exceeded' };
    
    return { valid: true };
  }

  static calculateClickCost(campaign: AdCampaign, qualityScore: number): number {
    // Hybrid CPC/CPA logic: cost influenced by bid and quality
    const baseCost = campaign.bid * 100; // normalized
    const qualityDampener = Math.max(0.5, 1 - (qualityScore - 7) * 0.1);
    return Math.round(baseCost * qualityDampener);
  }
}

export class FraudEngine {
  private static clickHistory: Map<string, number[]> = new Map();

  static detectClickFraud(ip: string, campaignId: string): boolean {
    const now = Date.now();
    const key = `${ip}:${campaignId}`;
    let history = this.clickHistory.get(key) || [];
    
    // Filter last 1 minute
    history = history.filter(ts => now - ts < 60000);
    
    if (history.length > 3) { // More than 3 clicks per provider per minute from same IP
      return true;
    }
    
    history.push(now);
    this.clickHistory.set(key, history);
    return false;
  }
}
