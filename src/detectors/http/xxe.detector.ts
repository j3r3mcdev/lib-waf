import { WafDetector, WafFinding } from "../../core/types";

type XXEPattern = {
  id: string;
  regex: RegExp;
  message: string;
  severity: number;
};

const XXE_PATTERNS: XXEPattern[] = [
  {
    id: "doctype",
    regex: /<!DOCTYPE[^>]+>/i,
    message: "Déclaration DOCTYPE potentiellement dangereuse détectée",
    severity: 8,
  },
  {
    id: "entity-decl",
    regex: /<!ENTITY[^>]+>/i,
    message: "Déclaration d'entité XML potentiellement dangereuse détectée",
    severity: 9,
  },
  {
    id: "external-entity",
    regex: /SYSTEM\s+["']?(file|http|https|ftp):\/\//i,
    message: "Référence à une entité externe (SYSTEM) détectée",
    severity: 10,
  },
  {
    id: "xxe-oob",
    regex: /<!ENTITY\s+\w+\s+SYSTEM\s+["']?http:\/\/[^"']+>/i,
    message: "Tentative d'XXE Out-Of-Band détectée",
    severity: 10,
  },
  {
    id: "xml-prolog",
    regex: /<\?xml[^>]*>/i,
    message: "Prologue XML détecté (peut contenir une attaque XXE)",
    severity: 5,
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

export const xxeDetector: WafDetector = {
  name: "xxe-detector",

  async run(ctx): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];
    const sources = collectSources(ctx);

    if (!sources.length) return findings;

    for (const pattern of XXE_PATTERNS) {
      let matched = false;

      for (const source of sources) {
        if (pattern.regex.test(source)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        findings.push({
          detector: "xxe-detector",
          severity: pattern.severity,
          message: pattern.message,
          meta: { patternId: pattern.id },
        });
      }
    }

    return findings;
  },
};
