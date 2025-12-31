
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

export interface CreateUrlInput {
  user_id: string;
  domain_name: string;
  url: string;
  title: string;
  keyword: string;
  description: string;
  ip_address?: string | null;
  options?: string | null;
}

// Sample input for creating a URL record
/*
{
  "user_id":"asasasa",
  "domain_name":"url-ms.********.workers.dev",
  "url":"https://98tools.com",
  "title":"demo title 1",
  "keyword":"demo12",
  "description":"demo desc 1",
  "options":{
    "logFields":["ip_address","user_agent","country","referrer","country_code"]
  }
}
*/


export interface UpdateUrlInput {
  user_id?: string;
  domain_name?: string;
  url?: string;
  title?: string;
  keyword?: string;
  description?: string;
  ip_address?: string | null;
  active?: number;
  options?: string | null;
}
