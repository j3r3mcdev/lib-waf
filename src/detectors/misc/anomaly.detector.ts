import { WafDetector } from "../../core/types";

const SUSPICIOUS_HEADERS = ["x-originating-ip", "x-wap-profile", "x-uidh"];

const SUSPICIOUS_CHARS = ["%00", "%ff", "%0d%0a"];

export const anomalyDetector: WafDetector = {
  name: "anomaly-detector",

  async run(ctx) {
    const findings = [];
    const url = ctx.request.url.toLowerCase();
    const headers = ctx.request.headers || {};

    // 1. URL trop longue
    if (url.length > 2000) {
      findings.push({
        detector: "anomaly-detector",
        severity: 3,
        message: "URL anormalement longue",
        meta: { length: url.length },
      });
    }

    // 2. Trop de headers
    const headerCount = Object.keys(headers).length;
    if (headerCount > 40) {
      findings.push({
        detector: "anomaly-detector",
        severity: 3,
        message: "Nombre de headers anormalement élevé",
        meta: { headerCount },
      });
    }

    // 3. Headers suspects
    for (const h of Object.keys(headers)) {
      if (SUSPICIOUS_HEADERS.includes(h.toLowerCase())) {
        findings.push({
          detector: "anomaly-detector",
          severity: 4,
          message: `Header suspect détecté : ${h}`,
          meta: { header: h },
        });
      }
    }

    // 4. Caractères suspects dans l’URL
    for (const c of SUSPICIOUS_CHARS) {
      if (url.includes(c)) {
        findings.push({
          detector: "anomaly-detector",
          severity: 4,
          message: `Caractère suspect détecté dans l’URL : ${c}`,
          meta: { char: c },
        });
      }
    }

    return findings;
  },
};
