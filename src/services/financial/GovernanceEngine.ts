export class GovernanceEngine {
  private static readonly EXPECTED_RANGES: Record<string, { min: number, max: number }> = {
    'general_checkup': { min: 3, max: 8 },
    'cardiac_emergency': { min: 2, max: 5 },
    'prenatal': { min: 5, max: 12 }
  };

  static detectOverTesting(doctorId: string, testType: string, count: number): { suspicious: boolean; deviation: number } {
    const range = this.EXPECTED_RANGES[testType];
    if (!range) return { suspicious: false, deviation: 0 };

    if (count > range.max * 1.5) {
      return { suspicious: true, deviation: count / range.max };
    }

    return { suspicious: false, deviation: 0 };
  }

  static applyBehaviorPenalty(baseScore: number, deviation: number): number {
    // Deduct from quality score if doctor consistently over-tests
    const penalty = Math.min(deviation * 0.5, 2.0);
    return Math.max(0, baseScore - penalty);
  }
}
