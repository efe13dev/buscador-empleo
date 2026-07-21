import type { Job } from "@/types/job";

export interface SearchParams {
  query: string;
  location: string;
  maxResults?: number;
}

export interface JobProvider {
  name: string;
  search(params: SearchParams): Promise<Job[]>;
}
