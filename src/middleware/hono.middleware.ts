// src/middleware/hono.middleware.ts
import { WAF } from "../core/waf";

// Types minimaux pour éviter la dépendance à @types/hono
type HonoContext = {
  req: { raw: any };
  res: any;
  json: (body: any, status?: number) => Response;
};
type Next = () => Promise<void>;

export function honoWafMiddleware(waf: WAF) {
  return async (c: HonoContext, next: Next) => {
    // On cast en any pour éviter les contraintes d'interface
    const ctx = await (waf as any).run(c.req.raw, c.res);

    const decision = ctx.finalDecision;
    const shadow = ctx.shadowModeEnabled === true;

    // Si block + pas en shadow mode → on bloque
    if (decision?.action === "block" && !shadow) {
      return c.json({ error: "Blocked by WAF" }, 403);
    }

    // Sinon on laisse passer
    await next();
  };
}
