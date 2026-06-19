import { WafProvider } from "../../core/types";
import { GeoIpProvider, GeoIpResult } from "./geoip.types";
import * as fs from "fs";

let maxmind: any;

try {
  maxmind = require("maxmind");
} catch {
  maxmind = null;
}

export class MaxMindGeoIpProvider implements WafProvider, GeoIpProvider {
  name = "maxmind-geoip";
  private reader: any = null;

  constructor(private dbPath: string) {}

  async init(): Promise<void> {
    // 1) Lib absente → erreur PRO
    if (!maxmind || typeof maxmind.open !== "function") {
      throw new Error("maxmind n'est pas installé.");
    }

    // 2) Fichier DB absent → erreur PRO
    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`Base MaxMind introuvable: ${this.dbPath}`);
    }

    // 3) Lib OK + fichier OK → on ouvre
    this.reader = await maxmind.open(this.dbPath);
  }

  async lookup(ip: string): Promise<GeoIpResult | null> {
    if (!this.reader) return null;

    const r = this.reader.get(ip);
    if (!r) return null;

    return {
      country: r.country?.names?.en,
      countryCode: r.country?.iso_code,
      city: r.city?.names?.en,
      latitude: r.location?.latitude,
      longitude: r.location?.longitude,
    };
  }
}
