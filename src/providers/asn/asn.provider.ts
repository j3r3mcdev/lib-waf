import { WafProvider } from "../../core/types";

export interface AsnProvider extends WafProvider {
  lookup(ip: string): Promise<number | null>;
}
