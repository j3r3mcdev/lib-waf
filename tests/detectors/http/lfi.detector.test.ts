import { WAF } from "../../../src/core/waf";
import { lfiDetector } from "../../../src/detectors/http/lfi.detector";

describe("LFI Detector", () => {
  it("ne déclenche rien sur une URL normale", async () => {
    const waf = new WAF();
    waf.registerDetector(lfiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user/profile",
      headers: {},
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un LFI simple", async () => {
    const waf = new WAF();
    waf.registerDetector(lfiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/../../etc/passwd",
      headers: {},
    });

    expect(decision.findings.length).toBeGreaterThan(0);
    expect(decision.findings[0].detector).toBe("lfi-detector");
  });

  it("détecte un LFI encodé", async () => {
    const waf = new WAF();
    waf.registerDetector(lfiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/%2e%2e%2fetc/passwd",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].message).toContain("LFI");
  });

  it("détecte un LFI via php://filter", async () => {
    const waf = new WAF();
    waf.registerDetector(lfiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/?file=php://filter/convert.base64-encode/resource=index.php",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
  });
});
