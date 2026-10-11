export interface CountItem {
  name: string;
  count: number;
}

export interface Overview {
  total_jobs: number;
  total_companies: number;
  total_locations: number;
  total_categories: number;
  latest_posted_at: string | null;
}
