
export type Partner = {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
  base_rate: number;
  category: string | null;
  color: string | null;
  cashback_by_category?: { [k: string]: number } | null;
  country: string[];
  featured?: boolean;
  awin_advertiser_id?: string | null;
  rakuten_advertiser_id?: string | null;
};
