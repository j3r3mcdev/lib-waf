import { WAF } from "../../../src/core/waf";
import { nosqlInjectionDetector } from "../../../src/detectors/http/nosql.detector";

describe("NoSQL Injection Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(nosqlInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/products?category=books",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un opérateur MongoDB dans la query", async () => {
    const waf = new WAF();
    waf.registerDetector(nosqlInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/search?filter[$ne]=1",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un objet MongoDB dans le body JSON", async () => {
    const waf = new WAF();
    waf.registerDetector(nosqlInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/login",
      headers: { host: "example.com", "content-type": "application/json" },
      body: {
        username: { $gt: "" },
        password: "test",
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une regex injectée dans le body", async () => {
    const waf = new WAF();
    waf.registerDetector(nosqlInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/filter",
      headers: { host: "example.com", "content-type": "application/json" },
      body: {
        name: "/.*/i",
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un chemin Firebase sensible", async () => {
    const waf = new WAF();
    waf.registerDetector(nosqlInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/users.json",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
