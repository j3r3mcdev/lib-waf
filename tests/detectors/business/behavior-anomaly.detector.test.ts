describe("placeholder", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
import { behaviorAnomalyDetector } from "../../../src/detectors/business/behavior-anomaly.detector";
import { BehaviorRateProvider } from "../../../src/providers/business/behavior-rate.provider";
import { WafContext, WafFinding } from "../../../src/core/types";

type TestCtx = WafContext & { _providers?: Map<string, any> };

function makeCtx(): TestCtx {
  return {
    request: { method: "GET", url: "/", headers: {}, ip: "1.1.1.1" },
    response: null,
    findings: [],
    metadata: {},

    addFinding(f: WafFinding) {
      this.findings.push(f);
    },
    addFindings(list: WafFinding[]) {
      this.findings.push(...list);
    },
    setMetadata<T>(key: string, value: T) {
      this.metadata[key] = value;
    },
    getMetadata<T>(key: string): T | undefined {
      return this.metadata[key] as T | undefined;
    },

    addProvider(name, provider) {
      if (!this._providers) this._providers = new Map();
      this._providers.set(name, provider);
    },

    getProvider(name) {
      return this._providers?.get(name);
    },
  };
}

describe("behaviorAnomalyDetector", () => {
  it("détecte un burst de requêtes", async () => {
    const provider = new BehaviorRateProvider({ maxHits: 3, windowMs: 5000 });
    const ctx = makeCtx();

    ctx.addProvider("business.behavior-rate", provider);

    // Simule un burst
    for (let i = 0; i < 4; i++) {
      await behaviorAnomalyDetector.run(ctx);
    }

    const findings = await behaviorAnomalyDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toMatch(/burst/i);
  });
});
