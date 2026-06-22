import { WafContext, WafProvider } from "../../core/types";

export interface RouteKey {
  method: string;
  path: string;
}

export interface RouteStats {
  totalRequests: number;
  avgBodySize: number;
  methods: Set<string>;
  lastSeenAt: number;
}

export interface RouteProfile extends RouteStats {
  key: RouteKey;
}

export class RouteProfilerProvider implements WafProvider {
  public readonly name = "business.route-profiler";

  private routes: Map<string, RouteStats> = new Map();
  private readonly learningWindow: number;

  constructor(options?: { learningWindowMs?: number }) {
    this.learningWindow = options?.learningWindowMs ?? 5 * 60 * 1000; // 5 min
  }

  private buildKey(method: string, path: string): string {
    return `${method.toUpperCase()} ${path}`;
  }

  private now(): number {
    return Date.now();
  }

  /** Compatibilité avec TON détecteur */
  public track(ctx: WafContext): void {
    this.trackRequest(ctx);
  }

  public trackRequest(ctx: WafContext): void {
    const method = ctx.request.method || "GET";
    const path = ctx.request.path || ctx.request.url || "/";
    const body = ctx.request.body;

    const bodySize =
      body == null
        ? 0
        : typeof body === "string"
          ? body.length
          : Buffer.isBuffer(body)
            ? body.length
            : JSON.stringify(body).length;

    const key = this.buildKey(method, path);
    const existing = this.routes.get(key);

    if (!existing) {
      this.routes.set(key, {
        totalRequests: 1,
        avgBodySize: bodySize,
        methods: new Set([method.toUpperCase()]),
        lastSeenAt: this.now(),
      });
      return;
    }

    const totalRequests = existing.totalRequests + 1;
    const avgBodySize =
      (existing.avgBodySize * existing.totalRequests + bodySize) /
      totalRequests;

    existing.totalRequests = totalRequests;
    existing.avgBodySize = avgBodySize;
    existing.methods.add(method.toUpperCase());
    existing.lastSeenAt = this.now();
  }

  public getProfile(method: string, path: string): RouteProfile | undefined {
    const key = this.buildKey(method, path);
    const stats = this.routes.get(key);
    if (!stats) return undefined;

    return {
      key: { method: method.toUpperCase(), path },
      totalRequests: stats.totalRequests,
      avgBodySize: stats.avgBodySize,
      methods: new Set(stats.methods),
      lastSeenAt: stats.lastSeenAt,
    };
  }

  /** Compatibilité avec TON détecteur */
  public isLearning(): boolean {
    return this.isInLearningPhase();
  }

  public isInLearningPhase(): boolean {
    const now = this.now();
    for (const stats of this.routes.values()) {
      if (now - stats.lastSeenAt < this.learningWindow) {
        return true;
      }
    }
    return this.routes.size === 0;
  }

  public snapshot(): RouteProfile[] {
    const result: RouteProfile[] = [];
    for (const [key, stats] of this.routes.entries()) {
      const [method, path] = key.split(" ", 2);
      result.push({
        key: { method, path },
        totalRequests: stats.totalRequests,
        avgBodySize: stats.avgBodySize,
        methods: new Set(stats.methods),
        lastSeenAt: stats.lastSeenAt,
      });
    }
    return result;
  }

  public reset(): void {
    this.routes.clear();
  }
}
