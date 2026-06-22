import { WAF } from "../../../src/core/waf";
import { dnsDetector } from "../../../src/detectors/network/dns.detector";

describe("DNS Detector", () => {
  it("ne déclenche rien sur un domaine normal", async () => {
    const waf = new WAF();
    waf.registerDetector(dnsDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: { host: "example.com" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte un domaine rebinding", async () => {
    const waf = new WAF();
    waf.registerDetector(dnsDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: { host: "attacker.nip.io" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });

  it("détecte un pattern de DNS tunneling", async () => {
    const waf = new WAF();
    waf.registerDetector(dnsDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/",
      headers: { host: "ajd92jd92jd92jd92jd9.data.exfil.me" },
    });

    expect(decision.findings.length).toBeGreaterThanOrEqual(1);
  });
});
