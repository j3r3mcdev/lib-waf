import { routeAnomalyDetector } from "../../../src/detectors/business/route-anomaly.detector";
import { RouteProfilerProvider } from "../../../src/providers/business/route-profiler.provider";
import { WafContext, WafFinding } from "../../../src/core/types";

type TestWafContext = WafContext & { _providers?: Map<string, unknown> };

function makeCtx(): TestWafContext {
  return {
    request: { method: "GET", url: "/", headers: {} },
    response: null,
    findings: [],
    metadata: {},

    addFinding(f: WafFinding) {
      this.findings.push(f);
    },

    addFindings(list: WafFinding[]) {
      this.findings.push(...list);
    },

    setMetadata(key: string, value: unknown) {
      this.metadata[key] = value;
    },

    getMetadata<T>(key: string): T | undefined {
      return this.metadata[key] as T;
    },

    addProvider(name: string, provider: unknown) {
      if (!this._providers) this._providers = new Map();
      this._providers.set(name, provider);
    },

    getProvider<T>(name: string): T | undefined {
      return this._providers?.get(name) as T | undefined;
    },
  };
}

describe("routeAnomalyDetector", () => {
  it("détecte une route inconnue après apprentissage", async () => {
    const profiler = new RouteProfilerProvider({ learningWindowMs: 0 });
    const ctx = makeCtx();

    ctx.addProvider("business.route-profiler", profiler);

    // On apprend une route connue
    ctx.request.method = "GET";
    ctx.request.url = "/";
    delete ctx.request.path; // IMPORTANT

    profiler.track(ctx);

    // Nouvelle route inconnue
    ctx.request.method = "POST";
    ctx.request.url = "/unknown";
    delete ctx.request.path; // IMPORTANT

    const findings = await routeAnomalyDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });
});
