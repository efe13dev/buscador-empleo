"use client";

import {
  Building2,
  CalendarDays,
  ExternalLink,
  Heart,
  MapPin,
  Monitor,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalyzedJob, JobStatus } from "@/types/job";

const STATUSES: { value: JobStatus; label: string }[] = [
  { value: "nueva", label: "Nueva" },
  { value: "vista", label: "Revisada" },
  { value: "guardada", label: "Guardada" },
  { value: "aplicada", label: "Aplicada" },
  { value: "descartada", label: "Descartada" },
];

function scoreStyle(score: number): string {
  if (score >= 75) return "border-primary/25 bg-primary/10 text-primary";
  if (score >= 50) return "border-amber-400/25 bg-amber-400/10 text-amber-300";
  return "border-red-400/25 bg-red-400/10 text-red-300";
}

interface Props {
  job: AnalyzedJob;
  favorite: boolean;
  status: JobStatus;
  onToggleFavorite: () => void;
  onStatusChange: (status: JobStatus) => void;
}

export function JobCard({ job, favorite, status, onToggleFavorite, onStatusChange }: Props) {
  return (
    <article className="surface group flex min-h-80 flex-col rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_24px_60px_-38px_oklch(0_0_0/0.9)]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
          <Building2 className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-bold leading-5 tracking-tight text-foreground">{job.title}</h3>
          <p className="mt-1 truncate text-sm font-medium text-muted-foreground">{job.company}</p>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={favorite ? "Quitar de favoritos" : "Marcar como favorita"}
          aria-pressed={favorite}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            favorite
              ? "border-rose-400/20 bg-rose-400/10 text-rose-400"
              : "border-border text-muted-foreground hover:bg-muted hover:text-rose-400"
          )}
        >
          <Heart className={cn("size-4", favorite && "fill-current")} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{job.location}</span>
        <span className="flex items-center gap-1.5"><Monitor className="size-3.5" />{job.remote ? "Remoto" : "Presencial / híbrido"}</span>
        {job.salary && <span className="flex items-center gap-1.5"><WalletCards className="size-3.5" />{job.salary}</span>}
        {job.publishedAt && <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{job.publishedAt.slice(0, 10)}</span>}
      </div>

      <div className="mt-4 flex items-center gap-2 border-y border-border/70 py-3">
        <Badge variant="secondary">{job.source}</Badge>
        {job.ai && (
          <span className={cn("ml-auto rounded-full border px-2.5 py-1 text-xs font-bold", scoreStyle(job.ai.score))}>
            {job.ai.score}% compatible
          </span>
        )}
      </div>

      {job.ai ? (
        <div className="mt-4 flex flex-1 flex-col">
          <p className="line-clamp-3 text-sm leading-6 text-foreground/80">{job.ai.summary}</p>
          {job.ai.missingSkills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Por reforzar</p>
              <div className="flex flex-wrap gap-1.5">
                {job.ai.missingSkills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="border-red-400/15 bg-red-400/5 text-red-300/90">
                    {skill}
                  </Badge>
                ))}
                {job.ai.missingSkills.length > 3 && (
                  <Badge variant="outline" className="text-muted-foreground">+{job.ai.missingSkills.length - 3}</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">Esta oferta todavía no tiene análisis de compatibilidad.</p>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4">
        <label className="sr-only" htmlFor={`status-${job.id}`}>Estado de la candidatura</label>
        <select
          id={`status-${job.id}`}
          value={status}
          onChange={(event) => onStatusChange(event.target.value as JobStatus)}
          className="h-9 min-w-0 rounded-lg border border-border bg-secondary px-2.5 text-xs font-semibold text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
        >
          {STATUSES.map(({ value, label }) => (
            <option key={value} value={value} className="bg-card">{label}</option>
          ))}
        </select>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm", className: "ml-auto" })}
        >
          Ver oferta
          <ExternalLink />
        </a>
      </div>
    </article>
  );
}
