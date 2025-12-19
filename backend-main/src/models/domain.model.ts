export interface Domain {
  id: string;
  domain_string: string;
  created_at: number;
  updated_at: number;
}

export interface CreateDomainInput {
  id: string;
  domain_string: string;
}

export interface UpdateDomainInput {
  domain_string?: string;
}
