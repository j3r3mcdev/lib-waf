import { WafDetector, WafFinding } from "../../core/types";

type NoSQLPattern = {
  id: string;
  regex: RegExp;
  message: string;
  severity: number;
};

const NOSQL_PATTERNS: NoSQLPattern[] = [
  {
    id: "mongodb-operators",
    regex: /\$(ne|gt|gte|lt|lte|in|nin|regex|where)\b/i,
    message: "Opérateur MongoDB détecté",
    severity: 6,
  },
  {
    id: "mongodb-query-object",
    regex: /"\$(ne|gt|gte|lt|lte|in|nin|regex|where)"\s*:/i,
    message: "Objet de requête MongoDB détecté",
    severity: 6,
  },
  {
    id: "boolean-bypass",
    regex: /\b(true|false|null)\b/i,
    message:
      "Valeur booléenne potentiellement utilisée pour contourner une requête NoSQL",
    severity: 4,
  },
  {
    id: "regex-injection",
    regex: /\/.*\/[gimsuy]*/i,
    message:
      "Expression régulière potentiellement injectée dans une requête NoSQL",
    severity: 5,
  },
  {
    id: "firebase-path",
    regex: /(?:^|\/)(users|admin|root|config)\.json\b/i,
    message: "Chemin Firebase potentiellement sensible détecté",
    severity: 7,
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

export const nosqlInjectionDetector: WafDetector = {
  name: "nosql-detector",

  async run(ctx): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];
    const sources = collectSources(ctx);

    if (!sources.length) return findings;

    for (const pattern of NOSQL_PATTERNS) {
      let matched = false;

      for (const source of sources) {
        if (pattern.regex.test(source)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        findings.push({
          detector: "nosql-detector",
          severity: pattern.severity,
          message: pattern.message,
          meta: { patternId: pattern.id },
        });
      }
    }

    return findings;
  },
};
