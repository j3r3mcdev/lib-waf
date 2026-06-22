jest.mock("maxmind", () => {
  throw new Error("Module not found");
});

import { MaxMindGeoIpProvider } from "../../../src/providers/geoip/maxmind.provider";

describe("MaxMindGeoIpProvider", () => {
  test("init échoue si la lib n'est pas installée", async () => {
    const p = new MaxMindGeoIpProvider("./db/GeoLite2-City.mmdb");

    await expect(p.init()).rejects.toThrow("maxmind n'est pas installé.");
  });
});
