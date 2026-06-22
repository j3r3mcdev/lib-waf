// src/middleware/node.middleware.ts
import { WAF } from "../core/waf";
import { IncomingMessage, ServerResponse } from "http";

// Types minimaux pour éviter toute dépendance externe
type Req = IncomingMessage & { url?: string };
type Res = ServerResponse & {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: any): void;
};

export function nodeWafMiddleware(waf: WAF) {
  return async (req: Req, res: Res, next: () => void) => {
    // On cast en any pour éviter les contraintes d'interface
    const ctx = await (waf as any).run(req, res);

    const decision = ctx.finalDecision;
    const shadow = ctx.shadowModeEnabled === true;

    // Si block + pas en shadow mode → on bloque
    if (decision?.action === "block" && !shadow) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Blocked by WAF" }));
      return;
    }

    // Sinon on laisse passer
    next();
  };
}
