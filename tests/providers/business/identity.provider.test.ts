import { IdentityProvider } from "../../../src/providers/business/identity.provider";

describe("IdentityProvider", () => {
  it("construit et stocke un fingerprint", () => {
    const provider = new IdentityProvider();
    const ctx: any = {
      request: {
        sessionId: "abc", // ← clé stable
        ip: "1.1.1.1",
        headers: { "user-agent": "UA" },
        asn: "AS123",
        country: "FR",
      },
    };

    provider.track(ctx);
    const last = provider.getLast(ctx);

    expect(last?.ip).toBe("1.1.1.1");
    expect(last?.ua).toBe("UA");
    expect(last?.asn).toBe("AS123");
    expect(last?.country).toBe("FR");
  });
});
