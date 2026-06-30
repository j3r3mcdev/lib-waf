import { WafDetector, WafContext } from "../../core/types";
export const ipDetector: WafDetector = {
  name: "ip",
  async run(ctx) {
    // Pas d'analyse pour l'instant
    return [];
  },
};
