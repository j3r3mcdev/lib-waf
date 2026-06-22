// src/middleware/express.middleware.ts
import { WAF } from "../core/waf";

// Types minimaux pour éviter la dépendance à @types/express
type Request = any;
type Response = {
  status(code: number): Response;
  json(body: any): Response;
};
type NextFunction = () => void;

export function expressWafMiddleware(waf: WAF) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // On cast en any pour éviter les contraintes d'interface
    const ctx = await (waf as any).run(req, res);

    // Décision finale du WAF
    const decision = ctx.finalDecision;
    const shadow = ctx.shadowModeEnabled === true;

    // Si block + pas en shadow mode → on bloque
    if (decision?.action === "block" && !shadow) {
      return res.status(403).json({ error: "Blocked by WAF" });
    }

    // Sinon on laisse passer
    next();
  };
}
