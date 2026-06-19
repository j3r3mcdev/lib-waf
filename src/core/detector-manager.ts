import { WafDetector } from "./types";
import { WafContext } from "./context";

export class DetectorManager {
  private detectors: WafDetector[] = [];

  register(detector: WafDetector) {
    this.detectors.push(detector);
  }

  async runAll(ctx: WafContext) {
    for (const detector of this.detectors) {
      const findings = await detector.run(ctx);
      ctx.addFindings(findings);
    }
  }
}
