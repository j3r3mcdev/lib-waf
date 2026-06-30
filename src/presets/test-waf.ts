import { WAF } from "../core/waf";

// Technical detectors (ceux que tu veux tester dans le user-service)
import { xssDetector } from "../detectors/http/xss.detector";
import { sqliDetector } from "../detectors/http/sqli.detector";
import { lfiDetector } from "../detectors/http/lfi.detector";
import { rfiDetector } from "../detectors/http/rfi.detector";
import { pathDetector } from "../detectors/http/path.detector";
import { nosqlInjectionDetector } from "../detectors/http/nosql.detector";
import { commandInjectionDetector } from "../detectors/http/command.detector";

export async function createTestWaf() {
  const waf = new WAF();

  // On charge uniquement les detectors utiles aux tests
  waf.registerDetector(xssDetector);
  waf.registerDetector(sqliDetector);
  waf.registerDetector(lfiDetector);
  waf.registerDetector(rfiDetector);
  waf.registerDetector(pathDetector);
  waf.registerDetector(nosqlInjectionDetector);
  waf.registerDetector(commandInjectionDetector);

  // Pas de providers lourds → tests rapides et stables
  await waf.init();
  return waf;
}
