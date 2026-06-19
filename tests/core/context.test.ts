import { WafContext } from "../../src/core/context";
import { WafRequest } from "../../src/core/types";

describe("WafContext", () => {
  const req: WafRequest = {
    ip: "1.1.1.1",
    method: "GET",
    url: "/",
    headers: {},
  };

  test("initialisation correcte", () => {
    const ctx = new WafContext(req);

    expect(ctx.request.ip).toBe("1.1.1.1");
    expect(ctx.findings).toEqual([]);
    expect(ctx.metadata).toEqual({});
    expect(ctx.providers.size).toBe(0);
  });

  test("ajout de findings", () => {
    const ctx = new WafContext(req);

    ctx.addFinding({ detector: "test", severity: 5, message: "ok" });
    expect(ctx.findings.length).toBe(1);
  });

  test("metadata", () => {
    const ctx = new WafContext(req);

    ctx.setMetadata("risk", 42);
    expect(ctx.getMetadata<number>("risk")).toBe(42);
  });
});
