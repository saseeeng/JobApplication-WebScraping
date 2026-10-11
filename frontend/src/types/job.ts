export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  category: string;
  description: string;
  skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  source_name: string;
  source_url: string;
  posted_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface JobListResponse {
  items: Job[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface JobFilterOptions {
  locations: string[];
  categories: string[];
  employment_types: string[];
}

export type SortField = "posted_at" | "title" | "company" | "location";
export type SortOrder = "asc" | "desc";

export interface JobQueryParams {
  search?: string;
  location?: string;
  category?: string;
  employment_type?: string;
  sort_by?: SortField;
  sort_order?: SortOrder;
  page?: number;
  page_size?: number;
}
