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

export async function analyzeJob(cfg: AiConfig, job: Job): Promise<AiAnalysis> {
  const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL || undefined });

  const prompt = [
    `Perfil del candidato:\n${cfg.profile}`,
    `Oferta de empleo:\nTítulo: ${job.title}\nEmpresa: ${job.company}\nUbicación: ${job.location}\nDescripción: ${job.description || "(no disponible)"}`,
    'Evalúa la compatibilidad del candidato con la oferta. Responde SOLO con JSON: {"score": número 0-100, "summary": "2-3 frases", "pros": ["..."], "cons": ["..."], "missingSkills": ["..."]}',
  ].join("\n\n");

  let content: string | null | undefined;
  try {
    const res = await client.chat.completions.create({
      model: cfg.model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    content = res.choices[0]?.message?.content;
  } catch {
    // ponytail: algunos providers no soportan json_object → reintento sin él
    const res = await client.chat.completions.create({
      model: cfg.model,
      messages: [{ role: "user", content: prompt }],
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
