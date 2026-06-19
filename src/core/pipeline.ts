import { WafProvider, WafDetector, WafRequest, WafDecision } from "./types";
import { ProviderManager } from "./provider-manager";
import { DetectorManager } from "./detector-manager";
import { DecisionEngine } from "./decision-engine";
import { WafContext } from "./context";

export class WafPipeline {
  private providers = new ProviderManager();
  private detectors = new DetectorManager();
  private decision = new DecisionEngine();

  registerProvider(name: string, provider: WafProvider) {
    this.providers.register(name, provider);
  }

  registerDetector(detector: WafDetector) {
    this.detectors.register(detector);
  }

  async init() {
    await this.providers.initAll();
  }

  async run(req: WafRequest): Promise<WafDecision> {
    const ctx = new WafContext(req);

    this.providers.attachToContext(ctx);
    await this.detectors.runAll(ctx);

    return this.decision.decide(ctx);
  }
}
