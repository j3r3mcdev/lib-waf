import { AsnProvider } from "./asn.provider";
import * as fs from "fs";

let maxmind: any;
try {
  maxmind = require("maxmind");
} catch {
  maxmind = null;
}

export class MaxMindAsnProvider implements AsnProvider {
  name = "maxmind-asn";
  private reader: any = null;

  constructor(private dbPath: string) {}

  async init(): Promise<void> {
    if (!maxmind || typeof maxmind.open !== "function") {
      throw new Error("maxmind n'est pas installé.");
    }

    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`Base MaxMind ASN introuvable: ${this.dbPath}`);
    }

    this.reader = await maxmind.open(this.dbPath);
  }

  async lookup(ip: string): Promise<number | null> {
    if (!this.reader) return null;

    const r = this.reader.get(ip);
    return r?.autonomous_system_number ?? null;
  }
}
