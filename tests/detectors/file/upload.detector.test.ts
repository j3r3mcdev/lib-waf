import { WAF } from "../../../src/core/waf";
import { uploadDetector } from "../../../src/detectors/file/upload.detector";

describe("Upload Detector", () => {
  it("ne déclenche rien si aucun fichier n'est envoyé", async () => {
    const waf = new WAF();
    waf.registerDetector(uploadDetector);

    await waf.init(); // ← OBLIGATOIRE

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: {},
      files: [],
    });

    expect(decision.findings.length).toBe(0);
  });

  it("détecte une extension dangereuse", async () => {
    const waf = new WAF();
    waf.registerDetector(uploadDetector);

    await waf.init(); // ← OBLIGATOIRE

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: {},
      files: [{ originalname: "shell.php", size: 1000 }],
    });

    expect(decision.findings.length).toBe(1);
    expect(decision.findings[0].detector).toBe("upload-detector");
  });

  it("détecte un fichier trop volumineux", async () => {
    const waf = new WAF();
    waf.registerDetector(uploadDetector);

    await waf.init(); // ← OBLIGATOIRE

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: {},
      files: [{ originalname: "bigfile.bin", size: 20 * 1024 * 1024 }],
    });

    expect(decision.findings.length).toBe(1);
  });

  it("détecte plusieurs anomalies dans plusieurs fichiers", async () => {
    const waf = new WAF();
    waf.registerDetector(uploadDetector);

    await waf.init();

    const decision = await waf.evaluate({
      method: "POST",
      url: "/upload",
      headers: {},
      files: [
        { originalname: "script.sh", size: 500 },
        { originalname: "bigfile.exe", size: 30 * 1024 * 1024 },
      ],
    });

    expect(decision.findings.length).toBe(3); // ← correction ici
  });
});
