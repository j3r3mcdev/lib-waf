import { WAF } from "../../../src/core/waf";
import { anomalyDetector } from "../../../src/detectors/misc/anomaly.detector";

describe("Anomaly Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(anomalyDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user",
      headers: {
        "user-agent": "jest",
      },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une URL trop longue", async () => {
    const waf = new WAF();
    waf.registerDetector(anomalyDetector);

    await waf.init();

    const longUrl = "/a".repeat(3000);

    const decision = await waf.evaluate({
      method: "GET",
      url: longUrl,
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
  });

  it("détecte un header suspect", async () => {
    const waf = new WAF();
    waf.registerDetector(anomalyDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "x-originating-ip": "evil",
      },
    });

    expect(decision.findings.length).toBe(1);
  });

  it("détecte un caractère suspect dans l’URL", async () => {
    const waf = new WAF();
    waf.registerDetector(anomalyDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/test%00inject",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
  });
});
