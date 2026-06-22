import { WafDetector, WafFinding } from "../../core/types";

type PPPattern = {
  id: string;
  regex: RegExp;
  message: string;
  severity: number;
};

const PROTOTYPE_PATTERNS: PPPattern[] = [
  {
    id: "proto-direct",
    regex: /(__proto__|constructor|prototype)\s*[:=]/i,
    message: "Tentative directe de pollution du prototype détectée",
    severity: 9,
  },
  {
    id: "proto-query",
    regex: /(\?|&)(__proto__|constructor|prototype)=/i,
    message:
      "Paramètre de query potentiellement utilisé pour une pollution du prototype",
    severity: 8,
  },
  {
    id: "proto-json",
    // JSON.stringify(body) produit {"__proto__":{...}}
    regex: /"(__proto__|constructor|prototype)"\s*:/i,
    message: "Clé JSON dangereuse détectée (risque de prototype pollution)",
    severity: 9,
  },
  {
    id: "encoded-proto",
    regex: /%5f%5fproto%5f%5f|%5F%5Fproto%5F%5F/i,
    message: "Séquence encodée __proto__ détectée",
    severity: 8,
  },
  {
    id: "deep-object",
    // ✔ Corrigé : pattern valide, sans retour à la ligne
    regex: /\w+\[(?:__proto__|constructor|prototype)\]/i,
    message: "Accès profond potentiellement dangereux détecté",
    severity: 7,
  },
];

function collectSources(ctx: any): string[] {
  const sources: string[] = [];

  const req = ctx.request || {};

  // 🔥 Correction : lire d’abord ctx.body
  const body =
    ctx.body ??
    req.body ??
    (typeof ctx.request === "object" ? ctx.request.body : undefined);

  if (req.url) sources.push(String(req.url));

  if (req.query) {
    try {
      sources.push(JSON.stringify(req.query));
    } catch {}
  }

  if (body) {
    try {
      sources.push(typeof body === "string" ? body : JSON.stringify(body));
    } catch {}
  }

  if (req.headers) {
    for (const value of Object.values(req.headers)) {
      if (value != null) sources.push(String(value));
    }
  }
  return sources;
}

export const prototypePollutionDetector: WafDetector = {
  name: "prototypepollution-detector",

  async run(ctx): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];
    const sources = collectSources(ctx);

    if (!sources.length) return findings;

    for (const pattern of PROTOTYPE_PATTERNS) {
      let matched = false;

      for (const source of sources) {
        if (pattern.regex.test(source)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        findings.push({
          detector: "prototypepollution-detector",
          severity: pattern.severity,
          message: pattern.message,
          meta: { patternId: pattern.id },
        });
      }
    }

    return findings;
  },
};
