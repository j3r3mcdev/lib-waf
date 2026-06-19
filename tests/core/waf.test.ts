import { WAF } from "../../src/core/waf";
import { WafDetector, WafProvider } from "../../src/core/types";

class MockProvider implements WafProvider {
  name = "mock";
  init = jest.fn();
}

const mockDetector: WafDetector = {
  name: "mock",
  run: jest
    .fn()
    .mockResolvedValue([{ detector: "mock", severity: 7, message: "ok" }]),
};

describe("WAF API", () => {
  test("évaluation complète", async () => {
    const waf = new WAF();

    waf.registerProvider("mock", new MockProvider());
    waf.registerDetector(mockDetector);

    await waf.init();

    const decision = await waf.evaluate({
      ip: "1.1.1.1",
      method: "GET",
      url: "/",
      headers: {},
    });

    expect(decision.score).toBe(7);
    expect(decision.action).toBe("allow");
  });
});
