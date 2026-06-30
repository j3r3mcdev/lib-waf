import { WAF } from "../core/waf";
import { xssDetector } from "../detectors/http/xss.detector";

export async function createTestWaf() {
  const waf = new WAF();

  waf.registerDetector(xssDetector);

  await waf.init();
  return waf;
}
