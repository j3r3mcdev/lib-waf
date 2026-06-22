import { ProviderManager } from "../../../src/core/provider-manager";
import { DetectorManager } from "../../../src/core/detector-manager";
import { DecisionEngine } from "../../../src/core/decision-engine";
import { WafContext } from "../../../src/core/types";

import { RouteProfilerProvider } from "../../../src/providers/business/route-profiler.provider";
import { FlowTrackerProvider } from "../../../src/providers/business/flow-tracker.provider";
import { BehaviorRateProvider } from "../../../src/providers/business/behavior-rate.provider";
import { IdentityProvider } from "../../../src/providers/business/identity.provider";

import { routeAnomalyDetector } from "../../../src/detectors/business/route-anomaly.detector";
import { flowAbuseDetector } from "../../../src/detectors/business/flow-abuse.detector";
import { behaviorAnomalyDetector } from "../../../src/detectors/business/behavior-anomaly.detector";
import { identityAnomalyDetector } from "../../../src/detectors/business/identity-anomaly.detector";

function makeCtx(): WafContext & { providers: Map<string, any> } {
  const ctx: WafContext & { providers: Map<string, any> } = {
    request: {
      method: "GET",
      url: "/",
      path: "/",
      headers: { "user-agent": "UA1" },
      ip: "1.1.1.1",
      country: "FR",
      asn: "AS123",
      sessionId: "abc",
    },
    response: null,
    findings: [],
    metadata: {} as Record<string, unknown>,
    providers: new Map(),

    addFinding(f) {
      this.findings.push(f);
    },
    addFindings(list) {
      this.findings.push(...list);
    },
    setMetadata(k: string, v: unknown) {
      this.metadata[k] = v;
    },
    getMetadata<T>(k: string): T | undefined {
      return this.metadata[k] as T | undefined;
    },

    addProvider(name, provider) {
      this.providers.set(name, provider);
    },

    getProvider(name) {
      return this.providers.get(name);
    },
  };

  return ctx;
}

describe("Business Logic Firewall - Integration", () => {
  it("détecte plusieurs anomalies dans un scénario complet", async () => {
    const ctx = makeCtx();

    // Providers
    const routeProfilerProvider = new RouteProfilerProvider({
      learningWindowMs: 0,
    });
    const flowTrackerProvider = new FlowTrackerProvider();
    const behaviorRateProvider = new BehaviorRateProvider({ maxHits: 2 });
    const identityProvider = new IdentityProvider();

    ctx.addProvider("business.route-profiler", routeProfilerProvider);
    ctx.addProvider("business.flow-tracker", flowTrackerProvider);
    ctx.addProvider("business.behavior-rate", behaviorRateProvider);
    ctx.addProvider("business.identity", identityProvider);

    // Detectors
    const detectors = new DetectorManager();
    detectors.register(routeAnomalyDetector);
    detectors.register(flowAbuseDetector);
    detectors.register(behaviorAnomalyDetector);
    detectors.register(identityAnomalyDetector);

    const decision = new DecisionEngine();

    // 1) Première requête (apprentissage)
    await detectors.runAll(ctx);

    // 2) Changement d'identité
    ctx.request.ip = "8.8.8.8";
    ctx.request.headers["user-agent"] = "UA2";
    ctx.request.country = "US";

    // 3) Boucle suspecte
    ctx.request.url = "/a";
    await detectors.runAll(ctx);

    ctx.request.url = "/b";
    await detectors.runAll(ctx);

    ctx.request.url = "/a";
    await detectors.runAll(ctx);

    ctx.request.url = "/b";
    await detectors.runAll(ctx);

    // 4) Burst comportemental
    ctx.request.url = "/spam";
    await detectors.runAll(ctx);
    await detectors.runAll(ctx);
    await detectors.runAll(ctx);

    const finalDecision = decision.decide(ctx);

    expect(ctx.findings.length).toBeGreaterThan(0);
    expect(finalDecision.action).toBe("block"); // ✔ Correction ici
  });
});
