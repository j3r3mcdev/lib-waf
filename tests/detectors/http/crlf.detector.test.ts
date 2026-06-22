import { WAF } from "../../../src/core/waf";
import { crlfDetector } from "../../../src/detectors/http/crlf.detector";

describe("CRLF Injection Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(crlfDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/home",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une séquence CRLF brute", async () => {
    const waf = new WAF();
    waf.registerDetector(crlfDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/test?x=\r\nSet-Cookie:evil=1",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une séquence CRLF encodée", async () => {
    const waf = new WAF();
    waf.registerDetector(crlfDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/test?redirect=%0d%0aSet-Cookie:evil=1",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une injection d'en-tête HTTP", async () => {
    const waf = new WAF();
    waf.registerDetector(crlfDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/submit",
      headers: {
        host: "example.com",
        "x-custom": "value\r\nLocation: http://evil.com",
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
