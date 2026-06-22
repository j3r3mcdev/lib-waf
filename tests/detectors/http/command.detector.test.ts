import { WAF } from "../../../src/core/waf";
import { commandInjectionDetector } from "../../../src/detectors/http/command.detector";

describe("Command Injection Detector", () => {
  it("ne déclenche rien sur une requête normale", async () => {
    const waf = new WAF();
    waf.registerDetector(commandInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/products?category=books",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une commande shell simple dans la query", async () => {
    const waf = new WAF();
    waf.registerDetector(commandInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/search?q=test;rm -rf /",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un subshell $(id) dans le body", async () => {
    const waf = new WAF();
    waf.registerDetector(commandInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/submit",
      headers: { host: "example.com", "content-type": "application/json" },
      body: {
        name: "test",
        comment: "hello $(id)",
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte une commande Windows cmd.exe dans un header", async () => {
    const waf = new WAF();
    waf.registerDetector(commandInjectionDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: {
        host: "example.com",
        "x-debug": "cmd.exe /c whoami",
      },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
