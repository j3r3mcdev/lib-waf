import {
  WafContext as IWafContext,
  WafRequest,
  WafResponse,
  WafFinding,
  WafProvider,
} from "./types";

/**
 * Contexte partagé entre toutes les étapes du WAF.
 * C’est la mémoire centrale du pipeline.
 */
export class WafContext implements IWafContext {
  request: WafRequest;
  response: WafResponse | null = null;

  findings: WafFinding[] = [];
  metadata: Record<string, unknown> = {};

  providers: Map<string, WafProvider> = new Map();

  constructor(req: WafRequest) {
    this.request = req;
  }

  addFinding(finding: WafFinding) {
    this.findings.push(finding);
  }

  addFindings(list: WafFinding[]) {
    this.findings.push(...list);
  }

  setMetadata(key: string, value: unknown) {
    this.metadata[key] = value;
  }

  getMetadata<T>(key: string): T | undefined {
    return this.metadata[key] as T;
  }

  addProvider(name: string, provider: WafProvider) {
    this.providers.set(name, provider);
  }

  getProvider<T extends WafProvider>(name: string): T | undefined {
    return this.providers.get(name) as T;
  }
}
