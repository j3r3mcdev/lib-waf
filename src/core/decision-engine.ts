import { WafDecision } from "./types";
import { WafContext } from "./context";

export class DecisionEngine {
  private threshold = 10;

  computeScore(ctx: WafContext): number {
    return ctx.findings.reduce((acc, f) => acc + f.severity, 0);
  }

  decide(ctx: WafContext): WafDecision {
    const score = this.computeScore(ctx);

    return {
      action: score >= this.threshold ? "block" : "allow",
      score,
      findings: ctx.findings,
    };
  }
}
