import { WafDetector, WafContext } from "../../core/types";

export const portscanDetector: WafDetector = {
  name: "portscan",
  async run(ctx: WafContext) {
    return [];
  },
};
