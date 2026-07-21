import type { Job } from "@/types/job";
import { linkedinProvider } from "./linkedin";
import { infojobsProvider, type InfoJobsCreds } from "./infojobs";
import type { JobProvider, SearchParams } from "./types";

export async function runAllProviders(
  params: SearchParams,
  infojobsCreds?: InfoJobsCreds
): Promise<{ jobs: Job[]; errors: string[] }> {
  const providers: JobProvider[] = [linkedinProvider];
  if (infojobsCreds?.clientId && infojobsCreds?.clientSecret) {
    providers.push(infojobsProvider(infojobsCreds));
  }

  const results = await Promise.allSettled(providers.map((p) => p.search(params)));

  const jobs: Job[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      errors.push(`${providers[i].name}: ${r.reason?.message ?? String(r.reason)}`);
      return;
    }
    for (const job of r.value) {
      if (!seen.has(job.id)) {
        seen.add(job.id);
        jobs.push(job);
      }
    }
  });

  return { jobs, errors };
}
