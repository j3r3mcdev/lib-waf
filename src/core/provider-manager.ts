import { WafProvider } from "./types";
import { WafContext } from "./context";

export class ProviderManager {
  private providers: Map<string, WafProvider> = new Map();

  register(name: string, provider: WafProvider) {
    this.providers.set(name, provider);
  }

  async initAll() {
    for (const provider of this.providers.values()) {
      if (provider.init) {
        await provider.init();
      }
    }
  }

  get(name: string): WafProvider | undefined {
    return this.providers.get(name);
  }

  attachToContext(ctx: WafContext) {
    for (const [name, provider] of this.providers.entries()) {
      ctx.addProvider(name, provider);
    }
  }
}
