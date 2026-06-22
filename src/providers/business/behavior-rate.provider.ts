export class BehaviorRateProvider {
  private hits: Map<string, number[]> = new Map();
  private windowMs = 5000; // fenêtre d’analyse
  private maxHits = 20; // seuil par défaut

  constructor(options: { windowMs?: number; maxHits?: number } = {}) {
    if (options.windowMs) this.windowMs = options.windowMs;
    if (options.maxHits) this.maxHits = options.maxHits;
  }

  private getUserKey(ctx: any): string {
    return ctx.request.ip || "unknown";
  }

  track(ctx: any) {
    const key = this.getUserKey(ctx);
    const now = Date.now();

    const list = this.hits.get(key) || [];
    list.push(now);

    // Nettoyage : on garde uniquement les hits dans la fenêtre
    const filtered = list.filter((ts) => now - ts <= this.windowMs);
    this.hits.set(key, filtered);
  }

  getRate(ctx: any): number {
    const key = this.getUserKey(ctx);
    const list = this.hits.get(key) || [];
    return list.length;
  }

  isBurst(ctx: any): boolean {
    return this.getRate(ctx) > this.maxHits;
  }
}
