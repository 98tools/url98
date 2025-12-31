export interface Url {
  id: string;
  created_at: number;
  updated_at: number;
  user_id: string;
  domain_name: string;
  url: string;
  title: string;
  keyword: string;
  description: string;
  clicks: number;
  ip_address: string | null;
  active: number;
  options: string | null;
}