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

    // Analyse URL
    const url = ctx.request.url?.toLowerCase() ?? "";

    // Analyse body JSON (si c’est un objet)
    let bodyString = "";
    if (typeof ctx.request.body === "string") {
      bodyString = ctx.request.body.toLowerCase();
    } else if (
      typeof ctx.request.body === "object" &&
      ctx.request.body !== null
    ) {
      bodyString = JSON.stringify(ctx.request.body).toLowerCase();
    }

    // Analyse query params
    const queryString = JSON.stringify(ctx.request.query || {}).toLowerCase();

    // Analyse headers
    const headersString = JSON.stringify(
      ctx.request.headers || {},
    ).toLowerCase();

    const haystack =
      url + " " + bodyString + " " + queryString + " " + headersString;

    for (const pattern of XSS_PATTERNS) {
      if (haystack.includes(pattern)) {
        findings.push({
          detector: "xss-detector",
          severity: 5,
          message: `Tentative de XSS détectée : ${pattern}`,
          meta: { pattern, url, body: ctx.request.body },
        });
      }
    }

    return findings;
  },
};
