// tests/detectors/business/sequence-anomaly.detector.test.ts
import { sequenceAnomalyDetector } from "../../../src/detectors/business/sequence-anomaly.detector";
import { FlowTrackerProvider } from "../../../src/providers/business/flow-tracker.provider";
import { WafContext, WafFinding } from "../../../src/core/types";

type TestCtx = WafContext & { providers: Map<string, any> };

function makeCtx(): TestCtx {
  const ctx: TestCtx = {
    request: {
      method: "GET",
      url: "/",
      path: "/",
      headers: { "user-agent": "UA" },
      ip: "1.1.1.1",
      sessionId: "abc",
    },
    response: null,
    findings: [],
    metadata: {},
    providers: new Map(),

    addFinding(f: WafFinding) {
      this.findings.push(f);
    },
    addFindings(list: WafFinding[]) {
      this.findings.push(...list);
    },
    setMetadata(k, v) {
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

describe("sequenceAnomalyDetector", () => {
  it("détecte une transition interdite", async () => {
    const flowProvider = new FlowTrackerProvider();
    const ctx = makeCtx();

    ctx.addProvider("business.flow-tracker", flowProvider);

    // Simule /login
    ctx.request.path = "/login";
    await sequenceAnomalyDetector.run(ctx);

    // Transition interdite : /login → /admin/delete-user
    ctx.request.path = "/admin/delete-user";
    const findings = await sequenceAnomalyDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toMatch(/Transition de route interdite/i);
  });

  it("détecte une boucle de séquence suspecte", async () => {
    const flowProvider = new FlowTrackerProvider();
    const ctx = makeCtx();

    ctx.addProvider("business.flow-tracker", flowProvider);

    // A → B → A → B
    ctx.request.path = "/a";
    await sequenceAnomalyDetector.run(ctx);

    ctx.request.path = "/b";
    await sequenceAnomalyDetector.run(ctx);

    ctx.request.path = "/a";
    await sequenceAnomalyDetector.run(ctx);

    ctx.request.path = "/b";
    const findings = await sequenceAnomalyDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(
      findings.some((f) => /Boucle de séquence suspecte/i.test(f.message)),
    ).toBe(true);
  });
});
