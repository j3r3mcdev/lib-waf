import { WAF } from "../../../src/core/waf";
import { sqliDetector } from "../../../src/detectors/http/sqli.detector";

describe("SQLi Detector", () => {
  it("ne déclenche rien sur une URL normale", async () => {
    const waf = new WAF();
    waf.registerDetector(sqliDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user?id=42",
      headers: {},
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un SQLi simple", async () => {
    const waf = new WAF();
    waf.registerDetector(sqliDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user?id=1 OR 1=1",
      headers: {},
    });

    expect(decision.findings.length).toBeGreaterThan(0);
    expect(decision.findings[0].detector).toBe("sqli-detector");
  });

  it("détecte un SQLi UNION SELECT", async () => {
    const waf = new WAF();
    waf.registerDetector(sqliDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/search?q=UNION SELECT username,password FROM users",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].message).toContain("SQLi");
  });

  it("détecte un SQLi via sleep()", async () => {
    const waf = new WAF();
    waf.registerDetector(sqliDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/login?user=admin&pass=sleep(5)",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
  });
});
