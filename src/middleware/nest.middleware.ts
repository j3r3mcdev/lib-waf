// src/middleware/nest.middleware.ts
import { WAF } from "../core/waf";

// Types minimaux pour éviter toute dépendance à Nest ou Express
type Request = any;
type Response = {
  status(code: number): Response;
  json(body: any): Response;
};
type NextFunction = () => void;

// Pas de décorateur, pas d'interface NestMiddleware → zéro dépendance
export class NestWafMiddleware {
  constructor(private readonly waf: WAF) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ctx = await (this.waf as any).run(req, res);

    const decision = ctx.finalDecision;
    const shadow = ctx.shadowModeEnabled === true;

    if (decision?.action === "block" && !shadow) {
      return res.status(403).json({ error: "Blocked by WAF" });
    }

    next();
  }
}
