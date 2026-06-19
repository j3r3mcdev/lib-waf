import { WafProvider } from "../../core/types";
import { GeoIpProvider, GeoIpResult } from "./geoip.types";

let IP2Location: any;

try {
  IP2Location = require("ip2location-nodejs");
} catch {
  IP2Location = null;
}

export class IP2LocationGeoIpProvider implements WafProvider, GeoIpProvider {
  name = "ip2location-geoip";
  private db: any;

  constructor(private dbPath: string) {}

  async init(): Promise<void> {
    // Lib absente → erreur PRO
    if (!IP2Location || typeof IP2Location !== "function") {
      throw new Error("ip2location-nodejs n'est pas installé.");
    }

    // Lib présente → on peut instancier
    this.db = new IP2Location();
    this.db.open(this.dbPath);
  }

  async lookup(ip: string): Promise<GeoIpResult | null> {
    if (!this.db) return null;

    const r = this.db.getAll(ip);
    if (!r) return null;

    return {
      country: r.countryLong,
      countryCode: r.countryShort,
      region: r.region,
      city: r.city,
      latitude: r.latitude,
      longitude: r.longitude,
    };
  }
}
