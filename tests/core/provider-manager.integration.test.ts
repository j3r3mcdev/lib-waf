import { ProviderManager } from "../../src/core/provider-manager";
import { WafContext } from "../../src/core/context";
import { WafProvider } from "../../src/core/types";

class MockProvider implements WafProvider {
  name = "mock";
  init = jest.fn();
}

describe("ProviderManager integration", () => {
  test("attachToContext ajoute les providers au contexte", async () => {
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
