import { WAF } from "../../../src/core/waf";
import { headerDetector } from "../../../src/detectors/http/header.detector";

describe("Header Detector", () => {
  it("ne déclenche rien sur des headers normaux", async () => {
    const waf = new WAF();
    waf.registerDetector(headerDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        host: "example.com",
        "user-agent": "jest-test",
      },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un header interdit", async () => {
    const waf = new WAF();
    waf.registerDetector(headerDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "x-forwarded-host": "evil.com",
      },
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].message).toContain("Header interdit");
  });

  it("détecte un header vide", async () => {
    const waf = new WAF();
    waf.registerDetector(headerDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        "x-test": "",
      },
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].message).toContain("Header vide");
  });

  it("détecte un header dupliqué", async () => {
    const waf = new WAF();
    waf.registerDetector(headerDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        accept: ["text/html", "application/json"],
      },
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].message).toContain("Header dupliqué");
  });
});
