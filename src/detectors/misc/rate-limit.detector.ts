import { WafDetector } from "../../core/types";

export const rateLimitDetector: WafDetector = {
  name: "rate-limit-detector",

  async run(ctx) {
    const findings = [];
    const url = ctx.request.url;

    // 1. Trop de slashes (ex: ////////)
    const slashCount = (url.match(/\//g) || []).length;
    if (slashCount > 20) {
      findings.push({
        detector: "rate-limit-detector",
        severity: 2,
        message: "URL contenant un nombre anormal de slashes",
        meta: { slashCount },
      });
    }

    // 2. Caractères répétés (ex: aaaaaaaa)
    if (/(.)\1{8,}/.test(url)) {
      findings.push({
        detector: "rate-limit-detector",
        severity: 2,
        message: "Séquence répétée détectée dans l’URL",
        meta: {},
      });
    }

    // 3. Trop de paramètres
    const paramCount = (url.match(/=/g) || []).length;
    if (paramCount > 10) {
      findings.push({
        detector: "rate-limit-detector",
        severity: 2,
        message: "Nombre de paramètres anormalement élevé",
        meta: { paramCount },
      });
    }

    return findings;
  },
};
