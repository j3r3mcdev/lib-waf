import { WAF } from "../../src/core/waf";
import { WafDetector, WafProvider } from "../../src/core/types";

class MockGeoProvider implements WafProvider {
  name = "geo";
  init = jest.fn();
  lookup = jest.fn().mockResolvedValue({
    country: "France",
    countryCode: "FR",
  });
}

const geoDetector: WafDetector = {
  name: "geo-detector",
  run: async (ctx) => {
    const geo = ctx.getProvider<MockGeoProvider>("geo");
    const info = await geo?.lookup("1.1.1.1");

    if (info?.countryCode === "FR") {
      return [
        {
          detector: "geo-detector",
          severity: 2,
          message: "IP française",
        },
      ];
    }

    return [];
  },
};

describe("WAF + Providers integration", () => {
  test("un détecteur peut utiliser un provider", async () => {
    const waf = new WAF();

    waf.registerProvider("geo", new MockGeoProvider());
    waf.registerDetector(geoDetector);

    await waf.init();

    const decision = await waf.evaluate({
      ip: "1.1.1.1",
      method: "GET",
      url: "/",
      headers: {},
    });

    expect(decision.score).toBe(2);
    expect(decision.findings.length).toBe(1);
  });
});
