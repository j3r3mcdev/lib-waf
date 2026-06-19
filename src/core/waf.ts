import { WafPipeline } from "./pipeline";
import { WafProvider, WafDetector, WafRequest, WafDecision } from "./types";

/**
 * API publique du WAF.
 * C’est la façade simple que les utilisateurs de la lib vont manipuler.
 */
export class WAF {
  private pipeline = new WafPipeline();

  /**
   * Enregistre un provider (GeoIP, ASN, DNS, RateLimit…)
   */
  registerProvider(name: string, provider: WafProvider) {
    this.pipeline.registerProvider(name, provider);
  }

  /**
   * Enregistre un détecteur (SQLi, XSS, LFI, UA…)
   */
  registerDetector(detector: WafDetector) {
    this.pipeline.registerDetector(detector);
  }

  /**
   * Initialise les providers (chargement DB, connexions, caches…)
   */
  async init() {
    await this.pipeline.init();
  }

  /**
   * Évalue une requête normalisée et retourne une décision.
   */
  async evaluate(req: WafRequest): Promise<WafDecision> {
    return this.pipeline.run(req);
  }
}
