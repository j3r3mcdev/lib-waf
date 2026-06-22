import { WafContext, WafDetector, WafFinding } from "../../core/types";
import { BehaviorRateProvider } from "../../providers/business/behavior-rate.provider";

export const behaviorAnomalyDetector: WafDetector = {
  name: "business.behavior-anomaly",

  async run(ctx: WafContext): Promise<WafFinding[]> {
    const provider = ctx.getProvider<BehaviorRateProvider>(
      "business.behavior-rate",
    );
    if (!provider) return [];

    const findings: WafFinding[] = [];

    // On analyse AVANT d’enregistrer
    if (provider.isBurst(ctx)) {
      findings.push({
        detector: "business.behavior-anomaly",
        severity: 3,
        message: "Comportement anormal : burst de requêtes détecté.",
        meta: { rate: provider.getRate(ctx) },
      });
    }

    // On enregistre APRÈS analyse
    provider.track(ctx);

    return findings;
  },
};
