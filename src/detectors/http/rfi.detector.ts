import { WafDetector } from "../../core/types";

const RFI_PATTERNS = [
  "http://",
  "https://",
  "ftp://",
  "php://input",
  "php://filter",
  "file://",
];

export const rfiDetector: WafDetector = {
  name: "rfi-detector",

  async run(ctx) {
    const findings = [];
    const url = ctx.request.url.toLowerCase();

    for (const pattern of RFI_PATTERNS) {
      if (url.includes(pattern)) {
        findings.push({
          detector: "rfi-detector",
          severity: 5,
          message: `Tentative de RFI détectée : ${pattern}`,
          meta: { pattern, url },
        });
      }
    }

    return findings;
  },
};
