import { WafDetector, WafFinding } from "../../core/types";

type OpenRedirectPattern = {
  id: string;
  regex: RegExp;
  message: string;
  severity: number;
};

const OPENREDIRECT_PATTERNS: OpenRedirectPattern[] = [
  {
    id: "absolute-url",
    regex: /(https?:\/\/[a-z0-9\.\-]+(:[0-9]+)?)/i,
    message: "URL absolue potentiellement utilisée pour un open redirect",
    severity: 6,
  },
  {
    id: "protocol-relative",
    regex: /(^|[=])\/\/[a-z0-9\.\-]+/i,
    message: "URL protocol-relative potentiellement dangereuse détectée",
    severity: 7,
  },
  {
    id: "encoded-http",
    regex: /(%2f%2f|%2F%2F)[a-z0-9\.\-]+/i,
    message: "URL encodée potentiellement utilisée pour un open redirect",
    severity: 7,
  },
  {
    id: "redirect-parameter",
    regex: /(redirect|url|next|return|goto)=/i,
    message: "Paramètre de redirection détecté",
    severity: 5,
  },
  {
    id: "javascript-protocol",
    regex: /javascript:/i,
    message: "Protocole javascript: détecté (open redirect possible)",
    severity: 9,
  },
];

function collectSources(ctx: any): string[] {
  const sources: string[] = [];
  const req = ctx.request || {};

  if (req.url) sources.push(String(req.url));

  if (req.query) {
    try {
      sources.push(JSON.stringify(req.query));
    } catch {}
  }

  if (req.body) {
    try {
      sources.push(
        typeof req.body === "string" ? req.body : JSON.stringify(req.body),
      );
    } catch {}
  }

  if (req.headers) {
    for (const value of Object.values(req.headers)) {
      if (value != null) sources.push(String(value));
    }
  }

  return sources;
}

export const openRedirectDetector: WafDetector = {
  name: "openredirect-detector",

  async run(ctx): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];
    const sources = collectSources(ctx);

    if (!sources.length) return findings;

    for (const pattern of OPENREDIRECT_PATTERNS) {
      let matched = false;

      for (const source of sources) {
        if (pattern.regex.test(source)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        findings.push({
          detector: "openredirect-detector",
          severity: pattern.severity,
          message: pattern.message,
          meta: { patternId: pattern.id },
        });
      }
    }

    return findings;
  },
};
