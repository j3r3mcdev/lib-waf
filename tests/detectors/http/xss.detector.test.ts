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
      body: {},
      query: {},
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un XSS simple dans l’URL", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/search?q=<script>alert(1)</script>",
      headers: {},
      body: {},
      query: {},
    });

    expect(decision.findings.length).toBeGreaterThan(0);
    expect(decision.findings[0].detector).toBe("xss-detector");
  });

  it("détecte un XSS dans le body JSON", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/submit",
      headers: {},
      body: { message: "<script>alert('xss')</script>" },
      query: {},
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
      body: {},
      query: {},
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un XSS via onerror=", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: '/img?src=x"><img src=x onerror=alert(1)>',
      headers: {},
      body: {},
      query: {},
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un XSS dans les headers", async () => {
    const waf = new WAF();
    waf.registerDetector(xssDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "x-custom": "<script>alert('xss')</script>",
      },
      body: {},
      query: {},
    });

    expect(decision.findings.length).toBeGreaterThan(0);
  });
});
