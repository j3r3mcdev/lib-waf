import { AsnProvider } from "./asn.provider";
import * as fs from "fs";

let IP2Location: any;
try {
  IP2Location = require("ip2location-nodejs");
} catch {
  IP2Location = null;
}

export class IP2LocationAsnProvider implements AsnProvider {
  name = "ip2location-asn";
  private db: any = null;

  constructor(private dbPath: string) {}

  async init(): Promise<void> {
    if (!IP2Location || typeof IP2Location !== "function") {
      throw new Error("ip2location-nodejs n'est pas installé.");
    }

    // 🔥 Vérification manquante (cause du test FAIL)
    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`Base IP2Location ASN introuvable: ${this.dbPath}`);
    }

    this.db = new IP2Location();
    this.db.open(this.dbPath);
  }

  async lookup(ip: string): Promise<number | null> {
    if (!this.db) return null;

    const r = this.db.getAll(ip);
    return r?.asn ?? null;
  }
}
