// src/modes/shadow-mode.ts
import { WafContext } from "../core/types";

export interface ShadowDecision {
  action: "allow" | "block";
  score?: number;
  reputation?: string;
  reasons?: any[];
}

export interface ShadowModeConfig {
  enabled: boolean;
}

export class ShadowMode {
  constructor(private config: ShadowModeConfig) {}

  isEnabled(): boolean {
    return this.config.enabled === true;
  }

  /**
   * Enregistre la décision théorique (ce qui aurait été fait hors shadow mode)
   * sans modifier le comportement réel du WAF.
   */
  record(ctx: WafContext, decision: ShadowDecision): void {
    if (!this.isEnabled()) return;

    const existing =
      ctx.getMetadata<ShadowDecision[]>("shadow.decisions") || [];
    existing.push(decision);

    ctx.setMetadata("shadow.decisions", existing);
  }
}
