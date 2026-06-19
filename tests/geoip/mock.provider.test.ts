import { MockGeoIpProvider } from "../../src/providers/geoip/mock.provider";

describe("MockGeoIpProvider", () => {
  test("init ne plante pas", async () => {
    const p = new MockGeoIpProvider();
    await expect(p.init()).resolves.not.toThrow();
  });

  test("lookup retourne des données mockées", async () => {
    const p = new MockGeoIpProvider();
    await p.init();

    const result = await p.lookup("1.1.1.1");

    expect(result).not.toBeNull();
    expect(result?.country).toBe("Local");
    expect(result?.city).toBe("TestCity");
  });
});
