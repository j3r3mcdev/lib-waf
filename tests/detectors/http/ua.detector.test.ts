import { WAF } from "../../../src/core/waf";
import { uaDetector } from "../../../src/detectors/http/ua.detector";

describe("UA Detector", () => {
  it("ne déclenche rien sur un UA normal", async () => {
    const waf = new WAF();
    waf.registerDetector(uaDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un UA vide", async () => {
    const waf = new WAF();
    waf.registerDetector(uaDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "user-agent": "",
      },
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].message).toContain("vide");
  });

  it("détecte un UA trop court", async () => {
    const waf = new WAF();
    waf.registerDetector(uaDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "user-agent": "abc",
      },
    });

    expect(decision.findings.length).toBe(1);
  });

  it("détecte un UA suspect (sqlmap)", async () => {
    const waf = new WAF();
    waf.registerDetector(uaDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "user-agent": "sqlmap/1.5",
      },
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].detector).toBe("ua-detector");
  });
});
