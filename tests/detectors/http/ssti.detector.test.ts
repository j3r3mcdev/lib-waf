import { WAF } from "../../../src/core/waf";
import { sstiDetector } from "../../../src/detectors/http/ssti.detector";

describe("SSTI Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(sstiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/products?category=books",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une expression Jinja2 dans la query", async () => {
    const waf = new WAF();
    waf.registerDetector(sstiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/search?q={{7*7}}",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une expression ERB dans le body JSON", async () => {
    const waf = new WAF();
    waf.registerDetector(sstiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/submit",
      headers: {
        host: "example.com",
        "content-type": "application/json",
      },
      body: {
        template: "<%= 7 * 7 %>",
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une expression Velocity dans un header", async () => {
    const waf = new WAF();
    waf.registerDetector(sstiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        host: "example.com",
        "x-template": "${7*7}",
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une expression Go Template dans la query", async () => {
    const waf = new WAF();
    waf.registerDetector(sstiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/render?tpl={{ user.name .value }}",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
