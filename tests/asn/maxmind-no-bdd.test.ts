jest.mock("maxmind", () => ({
  open: jest.fn(),
}));

import { MaxMindAsnProvider } from "../../src/providers/asn/maxmind.provider";

describe("MaxMindAsnProvider", () => {
  it("échoue si la base ASN est absente", async () => {
    const p = new MaxMindAsnProvider("./db/GeoLite2-ASN.mmdb");

    await expect(p.init()).rejects.toThrow("Base MaxMind ASN introuvable");
  });
});
