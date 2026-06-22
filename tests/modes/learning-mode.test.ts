import { LearningMode } from "../../src/modes/learning-mode";
import { WafContext } from "../../src/core/types";

function makeCtx(): WafContext {
  return ({
    request: {
      path: "/",
      method: "GET",
      headers: {},
      url: "/",
      ip: "1.1.1.1",
      sessionId: "abc",
    },
    response: null,
    findings: [],
    metadata: {},
    providers: {},

    addFinding(this: WafContext, f: unknown) {
      this.findings.push(f as unknown as any);
    },
    addFindings(this: WafContext, arr: unknown[]) {
      this.findings.push(...(arr as unknown as any[]));
    },

    setMetadata(this: WafContext, k: string | number, v: unknown) {
      this.metadata[k] = v;
    },
    getMetadata<T>(this: WafContext, k: string): T | undefined {
      return this.metadata[k] as T | undefined;
    },
    addProvider(this: any, name: string, provider: unknown) {
      (this.providers as Record<string, unknown>)[name] = provider;
    },
    getProvider<T = unknown>(this: any, name: string): T | undefined {
      return (this.providers as Record<string, unknown>)[name] as T | undefined;
    },
  }) as unknown as WafContext;
}

describe("LearningMode", () => {
  it("enregistre les routes globales", () => {
    const ctx = makeCtx();
    const lm = new LearningMode({ enabled: true });

    ctx.request.path = "/home";
    lm.record(ctx);

    const global = ctx.getMetadata<Record<string, number>>("learning.global");
    expect(global?.["/home"]).toBe(1);
  });

  it("enregistre les routes par IP", () => {
    const ctx = makeCtx();
    const lm = new LearningMode({ enabled: true });

    ctx.request.path = "/login";
    lm.record(ctx);

    const perIP = ctx.getMetadata<Record<string, Record<string, number>>>("learning.ip");
    expect(perIP).toBeDefined();
    expect(perIP?.["1.1.1.1"]?.["/login"]).toBe(1);
  });

  it("enregistre les séquences par session", () => {
    const ctx = makeCtx();
    const lm = new LearningMode({ enabled: true });

    ctx.request.path = "/a";
    lm.record(ctx);

    ctx.request.path = "/b";
    lm.record(ctx);

    const seq = ctx.getMetadata<Record<string, string[]>>("learning.sequence") ?? {};
    expect(seq["abc"]).toEqual(["/a", "/b"]);
  });

  it("respecte la limite maxHistory", () => {
    const ctx = makeCtx();
    const lm = new LearningMode({ enabled: true, maxHistory: 3 });

    ctx.request.path = "/1";
    lm.record(ctx);
    ctx.request.path = "/2";
    lm.record(ctx);
    ctx.request.path = "/3";
    lm.record(ctx);
    ctx.request.path = "/4";
    lm.record(ctx);

    const seq = ctx.getMetadata("learning.sequence") as Record<string, string[]>;
    expect(seq["abc"]).toEqual(["/2", "/3", "/4"]);
  });

  it("ne fait rien quand désactivé", () => {
    const ctx = makeCtx();
    const lm = new LearningMode({ enabled: false });

    ctx.request.path = "/x";
    lm.record(ctx);

    expect(ctx.getMetadata("learning.global")).toBeUndefined();
  });
});
