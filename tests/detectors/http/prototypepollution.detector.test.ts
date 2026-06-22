import { WAF } from "../../../src/core/waf";
import { prototypePollutionDetector } from "../../../src/detectors/http/prototypepollution.detector";

describe("Prototype Pollution Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(prototypePollutionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/api/user",
      headers: { host: "example.com" },
      body: { name: "john" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte __proto__ dans la query", async () => {
    const waf = new WAF();
    waf.registerDetector(prototypePollutionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api?__proto__=evil",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte constructor dans la query", async () => {
    const waf = new WAF();
    waf.registerDetector(prototypePollutionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api?constructor=hack",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte __proto__ dans un body JSON", async () => {
    const waf = new WAF();
    waf.registerDetector(prototypePollutionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/api/update",
      headers: {
        host: "example.com",
        "content-type": "application/json",
      },
      body: '{"__proto__": {"admin": true}}',
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une version encodée de __proto__", async () => {
    const waf = new WAF();
    waf.registerDetector(prototypePollutionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api?x=%5F%5Fproto%5F%5F",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un accès profond dangereux", async () => {
    const waf = new WAF();
    waf.registerDetector(prototypePollutionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/api",
      headers: { host: "example.com" },
      body: {
        user: {
          settings: {
            constructor: { evil: true },
          },
        },
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
