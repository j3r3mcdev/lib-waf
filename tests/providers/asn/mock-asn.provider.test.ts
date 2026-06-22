import { MockAsnProvider } from "../../../src/providers/asn/mock-asn.provider";

describe("MockAsnProvider", () => {
  it("retourne l'ASN configuré", async () => {
    const p = new MockAsnProvider({
      "8.8.8.8": 15169,
      "1.1.1.1": 13335,
    });

    expect(await p.lookup("8.8.8.8")).toBe(15169);
    expect(await p.lookup("1.1.1.1")).toBe(13335);
  });

  it("retourne null si l'IP n'est pas dans la map", async () => {
    const p = new MockAsnProvider({});
    expect(await p.lookup("9.9.9.9")).toBeNull();
  });

  it("retourne null si la valeur est explicitement null", async () => {
    const p = new MockAsnProvider({
      "10.0.0.1": null,
    });

    expect(await p.lookup("10.0.0.1")).toBeNull();
  });
});
