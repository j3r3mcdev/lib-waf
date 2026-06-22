// src/modes/learning-mode.ts
import { WafContext } from "../core/types";

export interface LearningModeConfig {
  enabled: boolean;
  maxHistory?: number; // limite mémoire
}

export class LearningMode {
  private maxHistory: number;

  constructor(private config: LearningModeConfig) {
    this.maxHistory = config.maxHistory ?? 50;
  }

  isEnabled(): boolean {
    return this.config.enabled === true;
  }

  /**
   * Enregistre les patterns observés sans jamais bloquer.
   */
  record(ctx: WafContext): void {
    if (!this.isEnabled()) return;

    const path = ctx.request.path || ctx.request.url || "/";
    const ip = ctx.request.ip || "unknown";
    const session = ctx.request.sessionId || "unknown";

    this.recordGlobalPath(path, ctx);
    this.recordIPPath(ip, path, ctx);
    this.recordSessionSequence(session, path, ctx);
  }

  private recordGlobalPath(path: string, ctx: WafContext) {
    const global =
      ctx.getMetadata<Record<string, number>>("learning.global") || {};

    global[path] = (global[path] || 0) + 1;

    ctx.setMetadata("learning.global", global);
  }

  private recordIPPath(ip: string, path: string, ctx: WafContext) {
    const perIP =
      ctx.getMetadata<Record<string, Record<string, number>>>("learning.ip") ||
      {};

    if (!perIP[ip]) perIP[ip] = {};
    perIP[ip][path] = (perIP[ip][path] || 0) + 1;

    ctx.setMetadata("learning.ip", perIP);
  }

  private recordSessionSequence(
    session: string,
    path: string,
    ctx: WafContext,
  ) {
    const sequences =
      ctx.getMetadata<Record<string, string[]>>("learning.sequence") || {};

    if (!sequences[session]) sequences[session] = [];

    sequences[session].push(path);

    // limite mémoire
    if (sequences[session].length > this.maxHistory) {
      sequences[session] = sequences[session].slice(-this.maxHistory);
    }

    ctx.setMetadata("learning.sequence", sequences);
  }
}
