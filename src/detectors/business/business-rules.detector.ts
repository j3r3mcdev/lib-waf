// src/detectors/business/business-rules.detector.ts
import { WafContext, WafDetector, WafFinding } from "../../core/types";

export interface BusinessRule {
  name: string;
  check: (ctx: WafContext) => boolean;
  message: string;
  severity?: number;
  meta?: (ctx: WafContext) => any;
}

const rules: BusinessRule[] = [
  {
    name: "login-before-purchase",
    message: "L'utilisateur doit être authentifié avant d'accéder à /purchase.",
    severity: 3,
    check: (ctx) => {
      const path = ctx.request.path || ctx.request.url;
      const logged = ctx.getMetadata<boolean>("auth.logged") === true;
      return path === "/purchase" && !logged;
    },
    meta: (ctx) => ({ path: ctx.request.path }),
  },

  {
    name: "premium-export",
    message: "Seuls les utilisateurs premium peuvent accéder à /export.",
    severity: 2,
    check: (ctx) => {
      const path = ctx.request.path || ctx.request.url;
      const premium = ctx.getMetadata<boolean>("user.premium") === true;
      return path === "/export" && !premium;
    },
    meta: (ctx) => ({ path: ctx.request.path }),
  },

  {
    name: "admin-asn",
    message: "Les administrateurs doivent provenir d'un ASN autorisé.",
    severity: 3,
    check: (ctx) => {
      const isAdmin = ctx.getMetadata<boolean>("user.admin") === true;
      if (!isAdmin) return false;

      const allowedASN = ["AS123", "AS456"];
      return !allowedASN.includes(ctx.request.asn || "");
    },
    meta: (ctx) => ({ asn: ctx.request.asn }),
  },
];

export const businessRulesDetector: WafDetector = {
  name: "business.rules",

  async run(ctx: WafContext): Promise<WafFinding[]> {
    const findings: WafFinding[] = [];

    for (const rule of rules) {
      if (rule.check(ctx)) {
        findings.push({
          detector: "business.rules",
          severity: rule.severity ?? 2,
          message: rule.message,
          meta: rule.meta ? rule.meta(ctx) : {},
        });
      }
    }

    return findings;
  },
};
