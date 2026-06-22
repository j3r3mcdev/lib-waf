import { WafContext, WafDetector, WafFinding } from "../../core/types";
import { RouteProfilerProvider } from "../../providers/business/route-profiler.provider";
export const routeAnomalyDetector: WafDetector = {
  name: "business.route-anomaly",

  async run(ctx: WafContext): Promise<WafFinding[]> {
    const profiler = ctx.getProvider<RouteProfilerProvider>(
      "business.route-profiler",
    );

    if (!profiler) return [];

    const method = ctx.request.method;
    const path = ctx.request.path || ctx.request.url;

    const profile = profiler.getProfile(method, path);
    const findings: WafFinding[] = [];

    // 1) Route inconnue
    if (!profile && !profiler.isLearning()) {
      findings.push({
        detector: "business.route-anomaly",
        severity: 3,
        message: "Route jamais vue auparavant.",
        meta: { method, path },
      });
    }

    // 2) Méthode inhabituelle
    if (profile && !profile.methods.has(method.toUpperCase())) {
      findings.push({
        detector: "business.route-anomaly",
        severity: 2,
        message: "Méthode HTTP inhabituelle pour cette route.",
        meta: { method, path },
      });
    }

    // 3) Payload anormal
    if (profile) {
      const body = ctx.request.body;
      const bodySize =
        body == null
          ? 0
          : typeof body === "string"
            ? body.length
            : Buffer.isBuffer(body)
              ? body.length
              : JSON.stringify(body).length;

      const ratio =
        profile.avgBodySize === 0
          ? bodySize > 0
            ? Infinity
            : 1
          : bodySize / profile.avgBodySize;

      if (ratio > 10 || ratio < 0.1) {
        findings.push({
          detector: "business.route-anomaly",
          severity: 2,
          message: "Taille de payload anormale pour cette route.",
          meta: { method, path, ratio },
        });
      }
    }

    // 4) On apprend APRÈS la détection
    profiler.track(ctx);

    return findings;
  },
};
