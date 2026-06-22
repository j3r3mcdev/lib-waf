import { WAF } from "../../../src/core/waf";
import { pathDetector } from "../../../src/detectors/http/path.detector";

describe("Path Detector", () => {
  it("ne déclenche rien sur une URL normale", async () => {
    const waf = new WAF();
    waf.registerDetector(pathDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user/profile",
      headers: {},
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un path traversal simple", async () => {
    const waf = new WAF();
    waf.registerDetector(pathDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/../../etc/passwd",
      headers: {},
    });

    expect(decision.findings.length).toBeGreaterThan(0);
    expect(decision.findings[0].detector).toBe("path-detector");
  });

  it("détecte un path traversal encodé", async () => {
    const waf = new WAF();
    waf.registerDetector(pathDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/%2e%2e%2fsecret",
      headers: {},
    });

    expect(decision.findings.length).toBe(2);
    expect(decision.findings[0].message).toContain("path traversal");
  });

  it("détecte un bypass unicode", async () => {
    const waf = new WAF();
    waf.registerDetector(pathDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/%c0%afetc/passwd",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
  });
});
