import { identityAnomalyDetector } from "../../../src/detectors/business/identity-anomaly.detector";
import { IdentityProvider } from "../../../src/providers/business/identity.provider";
import { WafContext, WafFinding } from "../../../src/core/types";

type TestCtx = WafContext & { _providers?: Map<string, any> };

function makeCtx(): TestCtx {
  return {
    request: {
      method: "GET",
      url: "/",
      headers: { "user-agent": "UA1" },
      ip: "1.1.1.1",
      country: "FR",
      asn: "AS123",
    },
    response: null,
    findings: [],
    metadata: {},

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
      if (!this._providers) this._providers = new Map();
      this._providers.set(name, provider);
    },

    getProvider(name) {
      return this._providers?.get(name);
    },
  };
}

describe("identityAnomalyDetector", () => {
  it("détecte un changement d'identité", async () => {
    const provider = new IdentityProvider();
    const ctx = makeCtx();

    ctx.addProvider("business.identity", provider);

    // 1) Première identité
    await identityAnomalyDetector.run(ctx);

    // 2) Identité différente
    ctx.request.ip = "8.8.8.8";
    ctx.request.headers["user-agent"] = "UA2";
    ctx.request.country = "US";

    const findings = await identityAnomalyDetector.run(ctx);

    expect(findings.length).toBeGreaterThan(0);
  });
});
