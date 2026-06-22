import { WafDetector } from "../../core/types";

const PATH_TRAVERSAL_PATTERNS = [
  "../",
  "..\\",
  "%2e%2e%2f",
  "%2e%2e%5c",
  "%2e%2f",
  "%2e%5c",
  "%c0%af",
  "%ef%bc%8f",
  "/etc/passwd",
  "/proc/self/environ",
];

export const pathDetector: WafDetector = {
  name: "path-detector",

  async run(ctx) {
    const findings = [];
    const url = ctx.request.url.toLowerCase();

    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (url.includes(pattern)) {
        findings.push({
          detector: "path-detector",
          severity: 5,
          message: `Tentative de path traversal détectée : ${pattern}`,
          meta: { pattern, url },
        });
      }
    }

    return findings;
  },
};
