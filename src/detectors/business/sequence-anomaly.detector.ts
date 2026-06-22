// src/detectors/business/sequence-anomaly.detector.ts
import { WafContext, WafDetector, WafFinding } from "../../core/types";

const forbiddenTransitions: Array<{ from: string; to: string }> = [
  { from: "/login", to: "/admin/delete-user" },
  { from: "/checkout", to: "/product" },
  { from: "/reset-password", to: "/admin" },
];

function isForbiddenTransition(from: string, to: string): boolean {
  return forbiddenTransitions.some((t) => t.from === from && t.to === to);
}

function isLoop(seq: string[]): boolean {
  if (seq.length < 4) return false;
  const last4 = seq.slice(-4);
  return last4[0] === last4[2] && last4[1] === last4[3];
}

export const sequenceAnomalyDetector: WafDetector = {
  name: "business.sequence-anomaly",

  async run(ctx: WafContext): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];

    // Récupère la séquence depuis le metadata (FlowTrackerProvider la met ici)
    const sequence = ctx.getMetadata<string[]>("flow.sequence") || [];

    const current = ctx.request.path || ctx.request.url || "/";

    // Détection transition interdite
    if (sequence.length > 0) {
      const last = sequence[sequence.length - 1];

      if (isForbiddenTransition(last, current)) {
        findings.push({
          detector: "business.sequence-anomaly",
          severity: 3,
          message: "Transition de route interdite détectée.",
          meta: { from: last, to: current },
        });
      }
    }

    // Détection boucle
    const extended = [...sequence, current];
    if (isLoop(extended)) {
      findings.push({
        detector: "business.sequence-anomaly",
        severity: 3,
        message: "Boucle de séquence suspecte détectée.",
        meta: { sequence: extended.slice(-4) },
      });
    }

    // Mise à jour de la séquence
    ctx.setMetadata("flow.sequence", extended);

    return findings;
  },
};
