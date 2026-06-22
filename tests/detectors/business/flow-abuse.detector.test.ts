import { FlowTrackerProvider } from "../../../src/providers/business/flow-tracker.provider";

describe("FlowTrackerProvider", () => {
  it("enregistre les événements de navigation", () => {
    const tracker = new FlowTrackerProvider();
    const ctx: any = {
      request: { method: "GET", url: "/home", ip: "1.1.1.1" },
    };

    tracker.track(ctx);
    const history = tracker.getHistory(ctx);

    expect(history.length).toBe(1);
    expect(history[0].path).toBe("/home");
  });
});
