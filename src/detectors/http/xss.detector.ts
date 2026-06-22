import { WafDetector } from "../../core/types";

const XSS_PATTERNS = [
  "<script",
  "</script",
  "javascript:",
  "onerror=",
  "onload=",
  "onclick=",
  "onmouseover=",
  "onfocus=",
  "onblur=",
  "svg/onload",
  "expression(",
  "document.cookie",
  "alert(",
  '"><',
  "'><",
];

export const xssDetector: WafDetector = {
  name: "xss-detector",

  async run(ctx) {
    const findings = [];
    const url = ctx.request.url.toLowerCase();

    for (const pattern of XSS_PATTERNS) {
      if (url.includes(pattern)) {
        findings.push({
          detector: "xss-detector",
          severity: 5,
          message: `Tentative de XSS détectée : ${pattern}`,
          meta: { pattern, url },
        });
      }
    }

    return findings;
  },
};
