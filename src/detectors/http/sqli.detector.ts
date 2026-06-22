import { WafDetector } from "../../core/types";

const SQLI_PATTERNS = [
  "' or 1=1",
  '" or 1=1',
  " or 1=1",
  " or '1'='1",
  "union select",
  "sleep(",
  "benchmark(",
  "information_schema",
  "load_file(",
  "into outfile",
  "--",
  "#",
  "/*",
];

export const sqliDetector: WafDetector = {
  name: "sqli-detector",

  async run(ctx) {
    const findings = [];
    const url = ctx.request.url.toLowerCase();

    for (const pattern of SQLI_PATTERNS) {
      if (url.includes(pattern)) {
        findings.push({
          detector: "sqli-detector",
          severity: 5,
          message: `Tentative de SQLi détectée : ${pattern}`,
          meta: { pattern, url },
        });
      }
    }

    return findings;
  },
};
