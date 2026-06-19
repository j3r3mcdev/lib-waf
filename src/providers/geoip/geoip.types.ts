export interface GeoIpResult {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface GeoIpProvider {
  lookup(ip: string): Promise<GeoIpResult | null>;
}
