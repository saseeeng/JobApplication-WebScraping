import type { CountItem, Overview } from "@/types/analytics";
import type { Job, JobFilterOptions, JobListResponse, JobQueryParams } from "@/types/job";

/**
 * Single place for API access.
 * Pages are React Server Components, so requests normally run inside the frontend
 * container: API_INTERNAL_URL (Docker network, e.g. http://backend:8000) is preferred,
 * falling back to NEXT_PUBLIC_API_URL (browser-reachable URL) and finally localhost.
 */
const API_BASE_URL = (
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");

const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | undefined | null;

function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, params: Record<string, QueryValue> = {}): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${path}${buildQuery(params)}`;
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch {
    throw new ApiError("Unable to reach the API. Is the backend running?");
  }
  if (!response.ok) {
    throw new ApiError(`API request failed (${response.status})`, response.status);
  }
  return (await response.json()) as T;
}

export const api = {
  getJobs: (params: JobQueryParams = {}) =>
    request<JobListResponse>("/jobs", { ...params }),
  getJob: (id: number) => request<Job>(`/jobs/${id}`),
  getJobFilters: () => request<JobFilterOptions>("/jobs/filters"),
  getOverview: () => request<Overview>("/analytics/overview"),
  getSkills: (limit = 15) => request<CountItem[]>("/analytics/skills", { limit }),
  getLocations: (limit = 10) => request<CountItem[]>("/analytics/locations", { limit }),
  getCompanies: (limit = 10) => request<CountItem[]>("/analytics/companies", { limit }),
  getCategories: (limit = 10) => request<CountItem[]>("/analytics/categories", { limit }),
};
