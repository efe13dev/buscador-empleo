import OpenAI from "openai";
import type { AiAnalysis, Job } from "@/types/job";

export interface AiConfig {
  baseURL?: string;
  apiKey: string;
  model: string;
  profile: string;
}

const FALLBACK: AiAnalysis = {
  score: 0,
  summary: "No se pudo analizar esta oferta.",
  pros: [],
  cons: [],
  missingSkills: [],
};

// El SDK reintenta 429/503 con backoff exponencial respetando Retry-After.
const MAX_RETRIES = 5;

export async function analyzeJob(cfg: AiConfig, job: Job): Promise<AiAnalysis> {
  const client = new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL || undefined,
    maxRetries: MAX_RETRIES,
  });

  const prompt = [
    `Perfil del candidato:\n${cfg.profile}`,
    `Oferta de empleo:\nTítulo: ${job.title}\nEmpresa: ${job.company}\nUbicación: ${job.location}\nDescripción: ${job.description || "(no disponible)"}`,
    'Evalúa la compatibilidad del candidato con la oferta. Responde SOLO con JSON: {"score": número 0-100, "summary": "2-3 frases", "pros": ["..."], "cons": ["..."], "missingSkills": ["..."]}',
  ].join("\n\n");

  const messages = [{ role: "user" as const, content: prompt }];

  let content: string | null | undefined;
  try {
    const res = await client.chat.completions.create({
      model: cfg.model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    content = res.choices[0]?.message?.content;
  } catch (e) {
    // Solo reintentamos sin json_object si el provider rechaza ese formato (400).
    // Errores de cuota/servidor (429/503) ya los reintenta el SDK; se propagan.
    if (!(e instanceof OpenAI.APIError) || e.status !== 400) throw e;
    const res = await client.chat.completions.create({
      model: cfg.model,
      messages,
      temperature: 0.2,
    });
    content = res.choices[0]?.message?.content;
  }

  return parseAnalysis(content ?? "");
}

const asStrings = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

function parseAnalysis(raw: string): AiAnalysis {
  try {
    const json = raw.trim().match(/\{[\s\S]*\}/)?.[0] ?? raw;
    const j = JSON.parse(json);
    return {
      score: Math.max(0, Math.min(100, Number(j.score) || 0)),
      summary: String(j.summary ?? ""),
      pros: asStrings(j.pros),
      cons: asStrings(j.cons),
      missingSkills: asStrings(j.missingSkills),
    };
  } catch {
    return FALLBACK;
  }
}
