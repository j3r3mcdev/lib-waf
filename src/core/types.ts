export interface WafRequest {
  ip: string;
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, unknown>;
}

export interface WafResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface WafFinding {
  detector: string;
  severity: number;
  message: string;
}

export interface WafDecision {
  action: "allow" | "block";
  score: number;
  findings: WafFinding[];
}

export interface WafProvider {
  name: string;
  init(): Promise<void>;
}

export interface WafDetector {
  name: string;
  run(ctx: WafContext): Promise<WafFinding[]>;
}

export interface WafContext {
  request: WafRequest;
  response: WafResponse | null;

  findings: WafFinding[];
  metadata: Record<string, unknown>;
  providers: Map<string, WafProvider>;

  addFinding(finding: WafFinding): void;
  addFindings(list: WafFinding[]): void;

  setMetadata(key: string, value: unknown): void;
  getMetadata<T>(key: string): T | undefined;

  addProvider(name: string, provider: WafProvider): void;
  getProvider<T extends WafProvider>(name: string): T | undefined;
}
