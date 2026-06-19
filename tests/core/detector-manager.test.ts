import { DetectorManager } from "../../src/core/detector-manager";
import { WafDetector } from "../../src/core/types";
import { WafContext } from "../../src/core/context";

const mockDetector: WafDetector = {
  name: "mock",
  run: jest
    .fn()
    .mockResolvedValue([{ detector: "mock", severity: 3, message: "ok" }]),
};

describe("DetectorManager", () => {
  test("exécution des détecteurs", async () => {
    const dm = new DetectorManager();
    dm.register(mockDetector);

    const ctx = new WafContext({
      ip: "1.1.1.1",
      method: "GET",
      url: "/",
      headers: {},
    });

    await dm.runAll(ctx);

    expect(mockDetector.run).toHaveBeenCalled();
    expect(ctx.findings.length).toBe(1);
  });
});
