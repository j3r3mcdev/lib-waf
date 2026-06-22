// tests/detectors/business/business-rules.detector.test.ts
import { businessRulesDetector } from "../../../src/detectors/business/business-rules.detector";
import { WafContext, WafFinding } from "../../../src/core/types";

type TestCtx = WafContext & { providers?: Map<string, any> };

function makeCtx(): TestCtx {
  return {
    request: {
      method: "GET",
      url: "/",
      path: "/",
      headers: {},
      ip: "1.1.1.1",
      asn: "AS999",
    },
    response: null,
    findings: [],
    metadata: {} as Record<string, any>,
    providers: new Map<string, any>(),

    addFinding(f: WafFinding) {
      this.findings.push(f);
    },
    addFindings(list: WafFinding[]) {
      this.findings.push(...list);
    },
    setMetadata(k: string, v: any) {
      this.metadata[k] = v;
    },
    getMetadata<T>(k: string): T | undefined {
      return this.metadata[k] as T | undefined;
    },
    addProvider(name: string, provider: any) {
      if (!this.providers) this.providers = new Map();
      this.providers.set(name, provider);
    },
    getProvider<T>(name: string): T | undefined {
      return this.providers?.get(name) as T | undefined;
    },
  };
}

describe("businessRulesDetector", () => {
  it("détecte l'accès à /purchase sans login", async () => {
    const ctx = makeCtx();
    ctx.request.path = "/purchase";
    ctx.setMetadata("auth.logged", false);

    const findings = await businessRulesDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toMatch(/authentifié/i);
  });

  it("détecte l'accès à /export sans premium", async () => {
    const ctx = makeCtx();
    ctx.request.path = "/export";
    ctx.setMetadata("user.premium", false);

    const findings = await businessRulesDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toMatch(/premium/i);
  });

  it("détecte un admin venant d'un ASN non autorisé", async () => {
    const ctx = makeCtx();
    ctx.setMetadata("user.admin", true);
    ctx.request.asn = "AS999";

    const findings = await businessRulesDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toMatch(/ASN/i);
  });
});
