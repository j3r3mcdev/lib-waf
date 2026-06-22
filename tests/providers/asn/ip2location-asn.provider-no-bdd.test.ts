jest.mock("ip2location-nodejs", () => {
  return function Fake() {
    return { open: jest.fn() };
  };
});

import { IP2LocationAsnProvider } from "../../../src/providers/asn/ip2location.provider";

describe("IP2LocationAsnProvider", () => {
  it("échoue si la base ASN est absente", async () => {
    const p = new IP2LocationAsnProvider("./db/IP2LOCATION-LITE-ASN.BIN");

    await expect(p.init()).rejects.toThrow("Base IP2Location ASN introuvable");
  });
});
