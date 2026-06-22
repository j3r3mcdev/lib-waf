import { WafContext, WafDetector, WafFinding } from "../../core/types";
import { FlowTrackerProvider } from "../../providers/business/flow-tracker.provider";

export const flowAbuseDetector: WafDetector = {
  name: "business.flow-abuse",

  async run(ctx: WafContext): Promise<WafFinding[]> {
    const tracker = ctx.getProvider<FlowTrackerProvider>(
      "business.flow-tracker",
    );
    if (!tracker) return [];

    const history = tracker.getHistory(ctx);
    const findings: WafFinding[] = [];

    // Exemple simple : boucle suspecte
    if (history.length >= 4) {
      const last = history.slice(-4).map((e) => e.path);
      const loop = last[0] === last[2] && last[1] === last[3];

      if (loop) {
        findings.push({
          detector: "business.flow-abuse",
          severity: 3,
          message: "Boucle de navigation suspecte détectée.",
          meta: { sequence: last },
        });
      }
    }

    // On enregistre l'action APRÈS analyse
    tracker.track(ctx);

    return findings;
  },
};
