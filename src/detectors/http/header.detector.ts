import { WafDetector } from "../../core/types";

const FORBIDDEN_HEADERS = [
  "x-forwarded-host",
  "x-original-url",
  "x-rewrite-url",
];

export const headerDetector: WafDetector = {
  name: "header-detector",

  async run(ctx) {
    const req = ctx.request;
    const findings = [];

    const headers = req.headers || {};

    for (const [key, value] of Object.entries(headers)) {
      const lower = key.toLowerCase();

      // 1. Forbidden headers
      if (FORBIDDEN_HEADERS.includes(lower)) {
        findings.push({
          detector: "header-detector",
          severity: 4,
          message: `Header interdit détecté : ${key}`,
          meta: { key, value },
        });
      }

      // 2. Empty header
      if (value === "" || (Array.isArray(value) && value.length === 0)) {
        findings.push({
          detector: "header-detector",
          severity: 2,
          message: `Header vide détecté : ${key}`,
          meta: { key },
        });
      }

      // 3. Duplicate header values
      if (Array.isArray(value) && value.length > 1) {
        findings.push({
          detector: "header-detector",
          severity: 3,
          message: `Header dupliqué : ${key}`,
          meta: { key, count: value.length },
        });
      }
    }

    return findings;
  },
};
