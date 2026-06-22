jest.mock("ip2location-nodejs", () => {
  throw new Error("Module not found");
});

import { IP2LocationAsnProvider } from "../../../src/providers/asn/ip2location.provider";

describe("IP2LocationAsnProvider", () => {
  it("échoue si la lib n'est pas installée", async () => {
    const p = new IP2LocationAsnProvider("./db/IP2LOCATION-LITE-ASN.BIN");

    await expect(p.init()).rejects.toThrow(
      "ip2location-nodejs n'est pas installé.",
    );
  });
});
