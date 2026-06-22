import { ProviderManager } from "../../../src/core/provider-manager";
import { MockAsnProvider } from "../../../src/providers/asn/mock-asn.provider";
import { AsnProvider } from "../../../src/providers/asn/asn.provider";

describe("ProviderManager + ASN", () => {
  it("charge un provider ASN et effectue une lookup", async () => {
    const pm = new ProviderManager();

    pm.register(
      "asn",
      new MockAsnProvider({
        "8.8.8.8": 15169,
      }),
    );

    // Récupération + cast explicite
    const p = pm.get("asn") as AsnProvider;

    expect(p).toBeDefined();
    expect(await p.lookup("8.8.8.8")).toBe(15169);
  });
});
