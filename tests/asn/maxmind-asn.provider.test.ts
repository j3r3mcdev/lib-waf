jest.mock("maxmind", () => {
  throw new Error("Module not found");
});

import { MaxMindAsnProvider } from "../../src/providers/asn/maxmind.provider";

describe("MaxMindAsnProvider", () => {
  it("échoue si la lib n'est pas installée", async () => {
    const p = new MaxMindAsnProvider("./db/GeoLite2-ASN.mmdb");

    await expect(p.init()).rejects.toThrow("maxmind n'est pas installé.");
  });
});
