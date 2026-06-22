import { WafContext, WafDetector, WafFinding } from "../../core/types";
import { IdentityProvider } from "../../providers/business/identity.provider";

export const identityAnomalyDetector: WafDetector = {
  name: "business.identity-anomaly",

  async run(ctx: WafContext): Promise<WafFinding[]> {
    const provider = ctx.getProvider<IdentityProvider>("business.identity");
    if (!provider) return [];

    const findings: WafFinding[] = [];

    const last = provider.getLast(ctx);
    const current = provider.buildFingerprint(ctx);

    if (last) {
      if (last.ip !== current.ip) {
        findings.push({
          detector: "business.identity-anomaly",
          severity: 3,
          message: "Changement d'IP suspect.",
          meta: { from: last.ip, to: current.ip },
        });
      }

      if (last.ua !== current.ua) {
        findings.push({
          detector: "business.identity-anomaly",
          severity: 2,
          message: "Changement d'user-agent suspect.",
          meta: { from: last.ua, to: current.ua },
        });
      }

      if (last.country && current.country && last.country !== current.country) {
        findings.push({
          detector: "business.identity-anomaly",
          severity: 3,
          message: "Changement de pays soudain.",
          meta: { from: last.country, to: current.country },
        });
      }
    }

    // On enregistre APRÈS analyse
    provider.track(ctx);

    return findings;
  },
};
