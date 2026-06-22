// src/core/decision-engine.ts

import { WafDecision, WafFinding } from "./types";
import { WafContext } from "./context";

export class DecisionEngine {
  constructor(private threshold: number = 5) {}

  computeScore(findings: WafFinding[]): number {
    return findings.reduce((acc, f) => acc + f.severity, 0);
  }

  decide(ctx: WafContext): WafDecision {
    const findings = ctx.findings;
    const score = this.computeScore(findings);

    const action = score >= this.threshold ? "block" : "allow";

    return {
      allow: action === "allow",
      action,
      score,
      findings,
    };
  }
}
