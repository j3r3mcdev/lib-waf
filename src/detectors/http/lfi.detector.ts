import { WafDetector } from "../../core/types";

const LFI_PATTERNS = [
  "../",
  "..\\",
  "%2e%2e%2f",
  "%2e%2e%5c",
  "/etc/passwd",
  "/proc/self/environ",
  "/proc/self/fd",
  "php://filter",
  "php://input",
  "file://",
];

export const lfiDetector: WafDetector = {
  name: "lfi-detector",

  async run(ctx) {
    const findings = [];
    const url = ctx.request.url.toLowerCase();

    for (const pattern of LFI_PATTERNS) {
      if (url.includes(pattern)) {
        findings.push({
          detector: "lfi-detector",
          severity: 5,
          message: `Tentative de LFI détectée : ${pattern}`,
          meta: { pattern, url },
        });
      }
    }

    return findings;
  },
};
