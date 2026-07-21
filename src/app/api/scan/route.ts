import { NextRequest, NextResponse } from "next/server";
import { runAllProviders } from "@/providers";
import { analyzeJob, type AiConfig } from "@/lib/ai";
import { mapPool } from "@/lib/pool";
import type { AnalyzedJob } from "@/types/job";

export const runtime = "nodejs";
export const maxDuration = 300;

interface ScanBody {
  query?: string;
  location?: string;
  knownIds?: string[];
  settings?: {
    baseURL?: string;
    apiKey?: string;
    model?: string;
    profile?: string;
    infojobsClientId?: string;
    infojobsClientSecret?: string;
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ScanBody;
  const { query = "", location = "", knownIds = [], settings = {} } = body;

  if (!query.trim()) {
    return NextResponse.json({ jobs: [], errors: ["Falta la búsqueda (query)"] }, { status: 400 });
  }

  const { jobs, errors } = await runAllProviders(
    { query, location },
    { clientId: settings.infojobsClientId ?? "", clientSecret: settings.infojobsClientSecret ?? "" }
  );

  const known = new Set(knownIds);
  const fresh = jobs.filter((j) => !known.has(j.id));

  // Sin API key configurada: devuelve ofertas crudas, la IA es opcional
  let analyzed: AnalyzedJob[] = fresh;
  if (settings.apiKey && settings.model) {
    const cfg: AiConfig = {
      baseURL: settings.baseURL,
      apiKey: settings.apiKey,
      model: settings.model,
      profile: settings.profile ?? "",
    };
    analyzed = await mapPool(fresh, 5, async (job) => {
      try {
        return { ...job, ai: await analyzeJob(cfg, job) };
      } catch (e) {
        errors.push(`IA en "${job.title}": ${e instanceof Error ? e.message : String(e)}`);
        return job;
      }
    });
  }

  analyzed.sort((a, b) => (b.ai?.score ?? -1) - (a.ai?.score ?? -1));

  return NextResponse.json({ jobs: analyzed, errors });
}
