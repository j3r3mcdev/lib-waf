export interface IdentityFingerprint {
  ip: string;
  ua: string;
  asn?: string;
  country?: string;
}

export class IdentityProvider {
  private lastIdentity: Map<string, IdentityFingerprint> = new Map();

  constructor() {}

  private getUserKey(ctx: any): string {
    return ctx.request.sessionId || "anonymous";
  }

  buildFingerprint(ctx: any): IdentityFingerprint {
    return {
      ip: ctx.request.ip || "",
      ua: ctx.request.headers?.["user-agent"] || "",
      asn: ctx.request.asn,
      country: ctx.request.country,
    };
  }

  getLast(ctx: any): IdentityFingerprint | undefined {
    const key = this.getUserKey(ctx);
    return this.lastIdentity.get(key);
  }

  track(ctx: any) {
    const key = this.getUserKey(ctx);
    const fp = this.buildFingerprint(ctx);
    this.lastIdentity.set(key, fp);
  }
}
