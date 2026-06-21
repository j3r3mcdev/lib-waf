// src/core/types.ts

export interface WafUploadedFile {
  originalname: string;
  size: number;
  mimetype?: string;
  buffer?: Buffer;
}

export interface WafRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[]>;
  ip?: string;
  files?: WafUploadedFile[];
}

export interface WafResponse {
  statusCode: number;
  headers: Record<string, string>;
  body?: unknown;
}

export interface WafFinding {
  detector: string;
  severity: number;
  message: string;
  meta?: Record<string, unknown>;
}

export interface WafDecision {
  allow: boolean;
  findings: WafFinding[];
  response?: WafResponse;
}

export interface WafProvider {
  init?(): Promise<void>;
}

export interface WafDetector {
  name: string;
  run(ctx: any): Promise<WafFinding[]>;
}

export interface WafContext {
  request: WafRequest;
  response: WafResponse | null;

  findings: WafFinding[];
  metadata: Record<string, unknown>;

  addFinding(finding: WafFinding): void;
  addFindings(list: WafFinding[]): void;

  setMetadata(key: string, value: unknown): void;
  getMetadata<T>(key: string): T | undefined;

  addProvider(name: string, provider: WafProvider): void;
  getProvider<T extends WafProvider>(name: string): T | undefined;
}
