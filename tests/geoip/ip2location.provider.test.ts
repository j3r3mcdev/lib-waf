import { IP2LocationGeoIpProvider } from "../../src/providers/geoip/ip2location.provider";

describe("IP2LocationGeoIpProvider", () => {
  test("init échoue si la lib n'est pas installée", async () => {
    const p = new IP2LocationGeoIpProvider("./db/does-not-exist.bin");

    await expect(p.init()).rejects.toThrow(
      "ip2location-nodejs n'est pas installé.",
    );
  });
});
