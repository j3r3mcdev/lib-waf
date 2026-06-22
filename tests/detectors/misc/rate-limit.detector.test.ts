import { WAF } from "../../../src/core/waf";
import { rateLimitDetector } from "../../../src/detectors/misc/rate-limit.detector";

describe("Rate Limit Detector", () => {
  it("ne déclenche rien sur une URL normale", async () => {
    const waf = new WAF();
    waf.registerDetector(rateLimitDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user?id=1",
      headers: {},
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte trop de slashes", async () => {
    const waf = new WAF();
    waf.registerDetector(rateLimitDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/////////////////////////////",
      headers: {},
    });

    // slashCount > 20 + répétition de '/'
    expect(decision.findings.length).toBeGreaterThanOrEqual(2);
  });

  it("détecte une séquence répétée", async () => {
    const waf = new WAF();
    waf.registerDetector(rateLimitDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/aaaaaaaaaaattack", // 10 'a'
      headers: {},
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte trop de paramètres", async () => {
    const waf = new WAF();
    waf.registerDetector(rateLimitDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/test?a=1&b=2&c=3&d=4&e=5&f=6&g=7&h=8&i=9&j=10&k=11",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
  });
});
