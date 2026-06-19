import { ProviderManager } from "../../src/core/provider-manager";
import { WafProvider } from "../../src/core/types";
import { WafContext } from "../../src/core/context";

class MockProvider implements WafProvider {
  name = "mock";
  init = jest.fn();
}

describe("ProviderManager", () => {
  test("enregistrement + init", async () => {
    const pm = new ProviderManager();
    const provider = new MockProvider();

    pm.register("mock", provider);
    await pm.initAll();

    expect(provider.init).toHaveBeenCalled();
  });

  test("attachToContext", () => {
    const pm = new ProviderManager();
    const provider = new MockProvider();
    pm.register("mock", provider);

    const ctx = new WafContext({
      ip: "1.1.1.1",
      method: "GET",
      url: "/",
      headers: {},
    });

    pm.attachToContext(ctx);

    expect(ctx.getProvider("mock")).toBe(provider);
  });
});
