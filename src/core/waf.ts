import { WafPipeline } from "./pipeline";
import { WafProvider, WafDetector, WafRequest, WafDecision } from "./types";

/**
 * API publique du WAF.
 * C’est la façade simple que les utilisateurs de la lib vont manipuler.
 */
export class WAF {
  private pipeline = new WafPipeline();
  private initialized = false;

  /**
   * Enregistre un provider (GeoIP, ASN, DNS, RateLimit…)
   */
  registerProvider(name: string, provider: WafProvider): this {
    if (this.initialized) {
      throw new Error("Impossible d'ajouter un provider après init().");
    }
    this.pipeline.registerProvider(name, provider);
    return this;
  }

  /**
   * Enregistre un détecteur (SQLi, XSS, LFI, UA…)
   */
  registerDetector(detector: WafDetector): this {
    if (this.initialized) {
      throw new Error("Impossible d'ajouter un détecteur après init().");
    }
    this.pipeline.registerDetector(detector);
    return this;
  }

  /**
   * Initialise les providers (chargement DB, connexions, caches…)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    await this.pipeline.init();
    this.initialized = true;
  }

  /**
   * Évalue une requête normalisée et retourne une décision.
   */
  async evaluate(req: WafRequest): Promise<WafDecision> {
    if (!this.initialized) {
      throw new Error(
        "WAF non initialisé : appelez await waf.init() avant evaluate().",
      );
    }
    return this.pipeline.run(req);
  }
}
