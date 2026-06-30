import { WAF } from "../core/waf";

// HTTP detectors
import { xssDetector } from "../detectors/http/xss.detector";
import { sqliDetector } from "../detectors/http/sqli.detector";
import { lfiDetector } from "../detectors/http/lfi.detector";
import { rfiDetector } from "../detectors/http/rfi.detector";
import { pathDetector } from "../detectors/http/path.detector";
import { openRedirectDetector } from "../detectors/http/openredirect.detector";
import { sstiDetector } from "../detectors/http/ssti.detector";
import { xxeDetector } from "../detectors/http/xxe.detector";
import { nosqlInjectionDetector } from "../detectors/http/nosql.detector";
import { commandInjectionDetector } from "../detectors/http/command.detector";
import { crlfDetector } from "../detectors/http/crlf.detector";
import { uaDetector } from "../detectors/http/ua.detector";

// Business detectors
import { sequenceAnomalyDetector } from "../detectors/business/sequence-anomaly.detector";
import { businessRulesDetector } from "../detectors/business/business-rules.detector";

export async function createDefaultWaf() {
  const waf = new WAF();

  // Technical detectors
  waf.registerDetector(xssDetector);
  waf.registerDetector(sqliDetector);
  waf.registerDetector(lfiDetector);
  waf.registerDetector(rfiDetector);
  waf.registerDetector(pathDetector);
  waf.registerDetector(openRedirectDetector);
  waf.registerDetector(sstiDetector);
  waf.registerDetector(xxeDetector);
  waf.registerDetector(nosqlInjectionDetector);
  waf.registerDetector(commandInjectionDetector);
  waf.registerDetector(crlfDetector);
  waf.registerDetector(uaDetector);

  // Business / sequence
  waf.registerDetector(sequenceAnomalyDetector);
  waf.registerDetector(businessRulesDetector);

  await waf.init();
  return waf;
}
