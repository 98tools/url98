export interface Domain {
  id: string;
  domain_name: string;
  created_at: number;
  updated_at: number;
}

export interface CreateDomainInput {
  domain_name: string;
}

export interface UpdateDomainInput {
  domain_name?: string;
}
