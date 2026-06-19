import { DecisionEngine } from "../../src/core/decision-engine";
import { WafContext } from "../../src/core/context";

describe("DecisionEngine", () => {
  test("allow si score < threshold", () => {
    const ctx = new WafContext({
      ip: "1.1.1.1",
      method: "GET",
      url: "/",
      headers: {},
    });

    ctx.addFinding({ detector: "x", severity: 3, message: "ok" });

    const engine = new DecisionEngine();
    const decision = engine.decide(ctx);

    expect(decision.action).toBe("allow");
  });

  test("block si score >= threshold", () => {
    const ctx = new WafContext({
      ip: "1.1.1.1",
      method: "GET",
      url: "/",
      headers: {},
    });

    ctx.addFinding({ detector: "x", severity: 10, message: "bad" });

    const engine = new DecisionEngine();
    const decision = engine.decide(ctx);

    expect(decision.action).toBe("block");
  });
});
