export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary?: string;
  description: string;
  url: string;
  source: string;
  publishedAt?: string;
}

export interface AiAnalysis {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  missingSkills: string[];
}

export type JobStatus = "nueva" | "vista" | "guardada" | "aplicada" | "descartada";

export interface AnalyzedJob extends Job {
  ai?: AiAnalysis;
}
