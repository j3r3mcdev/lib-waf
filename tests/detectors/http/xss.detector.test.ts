import { WAF } from "../../../src/core/waf";
import { xssDetector } from "../../../src/detectors/http/xss.detector";

describe("XSS Detector", () => {
  it("ne déclenche rien sur une URL normale", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user?id=42",
      headers: {},
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un XSS simple <script>", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/search?q=<script>alert(1)</script>",
      headers: {},
    });

    expect(decision.findings.length).toBeGreaterThan(0);
    expect(decision.findings[0].detector).toBe("xss-detector");
  });

  it("détecte un XSS via javascript:", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/redirect?url=javascript:alert(1)",
      headers: {},
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(2);
  });

  it("détecte un XSS via onerror=", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: '/img?src=x"><img src=x onerror=alert(1)>',
      headers: {},
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(2);
  });
});
