import { WafDetector, WafFinding } from "../../core/types";

type SSTIPattern = {
  id: string;
  regex: RegExp;
  message: string;
  severity: number;
};

const SSTI_PATTERNS: SSTIPattern[] = [
  {
    id: "jinja-expression",
    regex: /\{\{[^}]{1,50}\}\}/,
    message: "Expression Jinja2/Twig potentiellement dangereuse détectée",
    severity: 7,
  },
  {
    id: "jinja-statement",
    regex: /\{%[^%]{1,50}%\}/,
    message: "Bloc Jinja2/Twig potentiellement dangereux détecté",
    severity: 7,
  },
  {
    id: "erb-expression",
    regex: /<%=?[^%]{1,50}%>/,
    message: "Expression ERB (Ruby) potentiellement dangereuse détectée",
    severity: 7,
  },
  {
    id: "velocity",
    regex: /\$\{[^}]{1,50}\}/,
    message: "Expression Apache Velocity potentiellement dangereuse détectée",
    severity: 6,
  },
  {
    id: "freemarker",
    regex: /\[\=[^\]]{1,50}\]/,
    message: "Expression Freemarker potentiellement dangereuse détectée",
    severity: 6,
  },
  {
    id: "go-template",
    regex: /\{\{[A-Za-z0-9._\-]+\s*\.[^}]+\}\}/,
    message: "Expression Go Template potentiellement dangereuse détectée",
    severity: 6,
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

export const sstiDetector: WafDetector = {
  name: "ssti-detector",

  async run(ctx): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];
    const sources = collectSources(ctx);

    if (!sources.length) return findings;

    for (const pattern of SSTI_PATTERNS) {
      let matched = false;

      for (const source of sources) {
        if (pattern.regex.test(source)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        findings.push({
          detector: "ssti-detector",
          severity: pattern.severity,
          message: pattern.message,
          meta: { patternId: pattern.id },
        });
      }
    }

    return findings;
  },
};
