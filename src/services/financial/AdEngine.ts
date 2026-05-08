import type { AdCampaign, ClickContext, FraudReport } from './types.ts';

export class AdEngine {
  static validateClick(campaign: AdCampaign, context: ClickContext): { valid: boolean; reason?: string } {
    if (!campaign.active) return { valid: false, reason: 'Campaign inactive' };
    if (campaign.spentToday >= campaign.dailyLimit) return { valid: false, reason: 'Budget exceeded' };
    
    // Check for self-click (Provider clicking their own ad)
    if (context.userId === campaign.providerId) {
      return { valid: false, reason: 'Self-click detected' };
    }

    return { valid: true };
  }

  static calculateClickCost(campaign: AdCampaign, qualityScore: number): number {
    // Hybrid CPC/CPA logic: cost influenced by bid and quality
    const baseCost = campaign.bid * 100; // normalized
    const qualityDampener = Math.max(0.5, 1 - (qualityScore - 7) * 0.1);
    
    // Apply fraud penalty to cost if fraud score is high
    const fraudMultiplier = 1 + (campaign.fraudScore || 0) / 100;
    
    return Math.round(baseCost * qualityDampener * fraudMultiplier);
  }
}

export class FraudEngine {
  private static clickLog: Map<string, { ts: number; context: ClickContext }[]> = new Map();
  private static readonly MAX_VELOCITY = 5; // 5 clicks per minute
  private static readonly WINDOW_MS = 60000;

  static checkFraud(campaign: AdCampaign, context: ClickContext): FraudReport {
    const now = Date.now();
    const reasons: string[] = [];
    let score = 0;

    // 1. Self-Click Detection
    if (context.userId === campaign.providerId) {
      reasons.push('Self-click attempt');
      score += 100;
    }

    // 2. Click Velocity (IP-based)
    const ipKey = `ip:${context.ip}:${campaign.id}`;
    const ipHistory = this.getHistory(ipKey, now);
    if (ipHistory.length >= this.MAX_VELOCITY) {
      reasons.push('IP velocity abuse');
      score += 40;
    }
    this.recordClick(ipKey, context, now);

    // 3. Device Fingerprint Anomaly
    const fpKey = `fp:${context.fingerprint}:${campaign.id}`;
    const fpHistory = this.getHistory(fpKey, now);
    if (fpHistory.length >= 2) { // Multiple clicks from same device for same ad
       reasons.push('Device fingerprint anomaly');
       score += 30;
    }
    this.recordClick(fpKey, context, now);

    // 4. IP Cluster Analysis (Simulated)
    if (context.ip.startsWith('192.168.')) { // Demo logic: internal IPs flagged
      reasons.push('Blacklisted IP range');
      score += 20;
    }

    const isFraud = score >= 50;
    let penaltyRecommendation: FraudReport['penaltyRecommendation'] = 'flag';
    
    if (score >= 90) penaltyRecommendation = 'deactivate';
    else if (score >= 50) penaltyRecommendation = 'throttle';

    return {
      isFraud,
      score,
      reasons,
      penaltyRecommendation
    };
  }

  private static getHistory(key: string, now: number) {
    let history = this.clickLog.get(key) || [];
    history = history.filter(c => now - c.ts < this.WINDOW_MS);
    return history;
  }

  private static recordClick(key: string, context: ClickContext, ts: number) {
    const history = this.clickLog.get(key) || [];
    history.push({ ts, context });
    this.clickLog.set(key, history.filter(c => ts - c.ts < this.WINDOW_MS * 5)); // Keep a bit more for trend analysis
  }
}
