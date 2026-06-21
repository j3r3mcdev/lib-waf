import { AsnProvider } from "./asn.provider";

export class MockAsnProvider implements AsnProvider {
  name = "mock-asn";

  constructor(private map: Record<string, number | null> = {}) {}

  async init(): Promise<void> {
    // rien à faire
  }

  async lookup(ip: string): Promise<number | null> {
    return this.map[ip] ?? null;
  }
}
