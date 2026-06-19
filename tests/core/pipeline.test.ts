import { WafPipeline } from "../../src/core/pipeline";
import { WafDetector, WafProvider } from "../../src/core/types";

class MockProvider implements WafProvider {
  name = "mock";
  init = jest.fn();
}

const mockDetector: WafDetector = {
  name: "mock",
  run: jest
    .fn()
    .mockResolvedValue([{ detector: "mock", severity: 5, message: "ok" }]),
};

describe("WafPipeline", () => {
  test("pipeline complet", async () => {
    const pipeline = new WafPipeline();

    pipeline.registerProvider("mock", new MockProvider());
    pipeline.registerDetector(mockDetector);

    await pipeline.init();

    const decision = await pipeline.run({
      ip: "1.1.1.1",
      method: "GET",
      url: "/",
      headers: {},
    });

    expect(decision.score).toBe(5);
    expect(decision.action).toBe("allow");
  });
});
