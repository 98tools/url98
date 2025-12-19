export interface Log {
  id: string;
  url_id: string;
  timestamp: number;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  country_code: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
}

export interface CreateLogInput {
  id: string;
  url_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  country_code?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
}
