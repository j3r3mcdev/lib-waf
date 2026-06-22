import { WafDetector, WafFinding } from "../../core/types";

type CRLFPattern = {
  id: string;
  regex: RegExp;
  message: string;
  severity: number;
};

const CRLF_PATTERNS: CRLFPattern[] = [
  {
    id: "raw-crlf",
    regex: /\r\n/i,
    message: "Séquence CRLF brute détectée",
    severity: 9,
  },
  {
    id: "raw-lf",
    regex: /\n/,
    message: "Séquence LF brute détectée",
    severity: 7,
  },
  {
    id: "encoded-crlf",
    regex: /%0d%0a|%0D%0A|%0a|%0A/i,
    message: "Séquence CRLF encodée détectée",
    severity: 8,
  },
  {
    id: "header-injection",
    regex: /\r\n[a-z0-9\-]+:/i,
    message: "Tentative d'injection d'en-tête HTTP détectée",
    severity: 10,
  },
  {
    id: "response-splitting",
    regex: /(set-cookie|location):/i,
    message: "Tentative de HTTP Response Splitting détectée",
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

export const crlfDetector: WafDetector = {
  name: "crlf-detector",

  async run(ctx): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];
    const sources = collectSources(ctx);

    if (!sources.length) return findings;

    for (const pattern of CRLF_PATTERNS) {
      let matched = false;

      for (const source of sources) {
        if (pattern.regex.test(source)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        findings.push({
          detector: "crlf-detector",
          severity: pattern.severity,
          message: pattern.message,
          meta: { patternId: pattern.id },
        });
      }
    }

    return findings;
  },
};
