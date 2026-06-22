import { ShadowMode } from "../../src/modes/shadow-mode";
import { WafContext } from "../../src/core/types";

function makeCtx(): WafContext {
  const ctx: any = {
    request: { path: "/", method: "GET", headers: {}, url: "/" },
    response: null,
    findings: [],
    metadata: {},
    providers: {},

    addFinding(f: unknown) {
      this.findings.push(f);
    },
    addFindings(arr: unknown[]) {
      this.findings.push(...arr);
    },

    addProvider(name: string, provider: unknown) {
      (this as any).providers[name] = provider;
    },
    getProvider<T>(name: string): T | undefined {
      return (this as any).providers[name] as T | undefined;
    },

    setMetadata(k: string, v: unknown) {
      this.metadata[k] = v;
    },
    getMetadata<T>(k: string): T | undefined {
      return this.metadata[k] as T | undefined;
    },
  };

  return ctx;
}

describe("ShadowMode", () => {
  it("enregistre la décision quand il est activé", () => {
    const ctx = makeCtx();
    const shadow = new ShadowMode({ enabled: true });

    shadow.record(ctx, {
      action: "block",
      score: 42,
      reputation: "bad",
    });

    const decisions = ctx.getMetadata<{ action: string; score: number; reputation?: string }[]>(
      "shadow.decisions"
    );

    expect(decisions).toBeDefined();
    expect(decisions!.length).toBe(1);
    expect(decisions![0].action).toBe("block");
    expect(decisions![0].score).toBe(42);
  });

  it("n'enregistre rien quand il est désactivé", () => {
    const ctx = makeCtx();
    const shadow = new ShadowMode({ enabled: false });

    shadow.record(ctx, {
      action: "block",
      score: 99,
    });

    const decisions = ctx.getMetadata<{ action: string; score: number }[]>(
      "shadow.decisions"
    );

    expect(decisions).toBeUndefined();
  });
});
