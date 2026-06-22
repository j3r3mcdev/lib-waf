import { WafDetector } from "../../core/types";

const SUSPICIOUS_UA = [
  "curl",
  "wget",
  "python-requests",
  "libwww-perl",
  "nikto",
  "sqlmap",
  "fuzzer",
  "scanner",
  "bot",
];

export const uaDetector: WafDetector = {
  name: "ua-detector",

  async run(ctx) {
    const findings = [];
    const ua = (ctx.request.headers["user-agent"] || "").toLowerCase();

    // UA vide
    if (!ua || ua.trim() === "") {
      findings.push({
        detector: "ua-detector",
        severity: 2,
        message: "User-Agent vide détecté",
        meta: {},
      });
      return findings;
    }

    // UA trop court
    if (ua.length < 10) {
      findings.push({
        detector: "ua-detector",
        severity: 2,
        message: "User-Agent anormalement court",
        meta: { ua },
      });
    }

    // Patterns suspects
    for (const pattern of SUSPICIOUS_UA) {
      if (ua.includes(pattern)) {
        findings.push({
          detector: "ua-detector",
          severity: 4,
          message: `User-Agent suspect détecté : ${pattern}`,
          meta: { ua, pattern },
        });
      }
    }

    return findings;
  },
};
