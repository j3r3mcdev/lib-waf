import { WAF } from "../../../src/core/waf";
import { mimeDetector } from "../../../src/detectors/file/mime.detector";

describe("MIME Detector", () => {
  it("autorise un MIME valide", async () => {
    const waf = new WAF();
    waf.registerDetector(mimeDetector);

    await waf.init(); // ← OBLIGATOIRE

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: { "content-type": "image/png" },
    });

    expect(decision.findings.length).toBe(0);
  });

  it("bloque un MIME interdit", async () => {
    const waf = new WAF();
    waf.registerDetector(mimeDetector);

    await waf.init(); // ← OBLIGATOIRE

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: { "content-type": "application/x-php" },
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].detector).toBe("mime-detector");
  });

  it("gère correctement content-type sous forme de tableau", async () => {
    const waf = new WAF();
    waf.registerDetector(mimeDetector);

    await waf.init(); // ← OBLIGATOIRE

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: { "content-type": ["image/jpeg"] },
    });

    expect(decision.findings.length).toBe(0);
  });
});
