import { WafDetector, WafFinding } from "../../core/types";

const SUSPICIOUS_DNS_PATTERNS = [
  ".nip.io",
  ".xip.io",
  ".sslip.io",
  ".localtest.me",
  ".lvh.me",
  ".burpcollaborator.net",
  ".oastify.com",
  ".oast.me",
  ".dnslog.cn",
  ".interact.sh",
];

const BASE_PATTERNS = [
  /^[a-z0-9]{20,}(\.[a-z0-9-]+){3,}$/i, // DNS tunneling multi-label
];

export const dnsDetector: WafDetector = {
  name: "dns-detector",

  async run(ctx) {
    const findings: WafFinding[] = [];

    const host = (ctx.request.headers.host || "").toLowerCase();
    if (!host) return findings;

    for (const pattern of SUSPICIOUS_DNS_PATTERNS) {
      if (host.endsWith(pattern)) {
        findings.push({
          detector: "dns-detector",
          severity: 5,
          message: `Domaine suspect détecté : ${pattern}`,
          meta: { host, pattern },
        });
      }
    }

    for (const regex of BASE_PATTERNS) {
      if (regex.test(host)) {
        findings.push({
          detector: "dns-detector",
          severity: 4,
          message: "Pattern de DNS tunneling détecté",
          meta: { host },
        });
      }
    }

    return findings;
  },
};
