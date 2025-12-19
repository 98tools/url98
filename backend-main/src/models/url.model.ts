export interface Url {
  id: string;
  created_at: number;
  updated_at: number;
  user_id: string;
  domain_id: string;
  url: string;
  title: string;
  keyword: string;
  description: string;
  clicks: number;
  ip_address: string | null;
  active: number;
  options: string | null;
}

export interface CreateUrlInput {
  id: string;
  user_id: string;
  domain_id: string;
  url: string;
  title: string;
  keyword: string;
  description: string;
  ip_address?: string | null;
  options?: string | null;
}

export interface UpdateUrlInput {
  user_id?: string;
  domain_id?: string;
  url?: string;
  title?: string;
  keyword?: string;
  description?: string;
  ip_address?: string | null;
  active?: number;
  options?: string | null;
}
