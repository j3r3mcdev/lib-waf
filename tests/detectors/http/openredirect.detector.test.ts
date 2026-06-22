import { WAF } from "../../../src/core/waf";
import { openRedirectDetector } from "../../../src/detectors/http/openredirect.detector";

describe("Open Redirect Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(openRedirectDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/dashboard",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une URL absolue dans la query", async () => {
    const waf = new WAF();
    waf.registerDetector(openRedirectDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/login?redirect=http://evil.com",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une URL protocol-relative", async () => {
    const waf = new WAF();
    waf.registerDetector(openRedirectDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/auth?next=//attacker.com",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une URL encodée", async () => {
    const waf = new WAF();
    waf.registerDetector(openRedirectDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/redirect?url=%2F%2Fevil.com",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un protocole javascript:", async () => {
    const waf = new WAF();
    waf.registerDetector(openRedirectDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/jump?next=javascript:alert(1)",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
