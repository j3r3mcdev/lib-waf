import { BehaviorRateProvider } from "../../../src/providers/business/behavior-rate.provider";

describe("BehaviorRateProvider", () => {
  it("compte les requêtes dans une fenêtre temporelle", () => {
    const provider = new BehaviorRateProvider({ windowMs: 1000 });
    const ctx: any = { request: { ip: "1.1.1.1" } };

    provider.track(ctx);
    provider.track(ctx);

    expect(provider.getRate(ctx)).toBe(2);
  });
});
