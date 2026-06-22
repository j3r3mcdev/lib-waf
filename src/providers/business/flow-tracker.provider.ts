export interface FlowEvent {
  method: string;
  path: string;
  timestamp: number;
}

export class FlowTrackerProvider {
  private history: Map<string, FlowEvent[]> = new Map();
  private maxHistory = 10;

  constructor(private options: { maxHistory?: number } = {}) {
    if (options.maxHistory) this.maxHistory = options.maxHistory;
  }

  private getUserKey(ctx: any): string {
    return ctx.request.ip || "unknown";
  }

  track(ctx: any) {
    const key = this.getUserKey(ctx);
    const list = this.history.get(key) || [];

    list.push({
      method: ctx.request.method,
      path: ctx.request.path || ctx.request.url,
      timestamp: Date.now(),
    });

    if (list.length > this.maxHistory) list.shift();

    this.history.set(key, list);
  }

  getHistory(ctx: any): FlowEvent[] {
    const key = this.getUserKey(ctx);
    return this.history.get(key) || [];
  }
}
