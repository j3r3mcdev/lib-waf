import { WafProvider } from "../../core/types";
import { GeoIpProvider, GeoIpResult } from "./geoip.types";

export class MockGeoIpProvider implements WafProvider, GeoIpProvider {
  name = "mock-geoip";

  async init(): Promise<void> {
    // rien à faire
  }

  async lookup(ip: string): Promise<GeoIpResult | null> {
    return {
      country: "Local",
      countryCode: "LC",
      city: "TestCity",
      latitude: 0,
      longitude: 0,
    };
  }
}
