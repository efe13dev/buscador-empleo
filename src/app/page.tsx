"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Heart,
  Radar,
  SearchX,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { FilterBar, emptyFilters, type Filters } from "@/components/FilterBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultSettings, type Settings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import type { AnalyzedJob, JobStatus } from "@/types/job";

export default function Dashboard() {
  const [jobs, setJobs, jobsLoaded] = useLocalStorage<AnalyzedJob[]>("jobs", []);
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);
  const [statuses, setStatuses] = useLocalStorage<Record<string, JobStatus>>("jobStatus", {});
  const [settings] = useLocalStorage<Settings>("settings", defaultSettings);

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");

  async function scan() {
    setScanning(true);
    setScanMsg("Buscando y analizando ofertas…");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: settings.query,
          location: settings.location,
          knownIds: jobs.map((j) => j.id),
          settings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.join(", ") || `HTTP ${res.status}`);

      const fresh: AnalyzedJob[] = data.jobs;
      setJobs((prev) => {
        const ids = new Set(prev.map((j) => j.id));
        return [...prev, ...fresh.filter((j) => !ids.has(j.id))];
      });
      setScanMsg(
        `${fresh.length} ofertas nuevas` +
          (data.errors?.length ? ` · ⚠ ${data.errors.join(" · ")}` : "")
      );
    } catch (e) {
      setScanMsg(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setScanning(false);
    }
  }

  const visible = useMemo(() => {
    const text = filters.text.toLowerCase();
    const tech = filters.tech.toLowerCase();
    return jobs
      .filter((j) => {
        if (filters.favoritesOnly && !favorites.includes(j.id)) return false;
        if (filters.remoteOnly && !j.remote) return false;
        if (filters.minScore > 0 && (j.ai?.score ?? 0) < filters.minScore) return false;
        if (text && !`${j.title} ${j.company} ${j.location}`.toLowerCase().includes(text)) return false;
        if (tech && !`${j.description} ${j.ai?.summary ?? ""} ${j.ai?.missingSkills.join(" ") ?? ""}`.toLowerCase().includes(tech))
          return false;
        return true;
      })
      .sort((a, b) => (b.ai?.score ?? -1) - (a.ai?.score ?? -1));
  }, [jobs, filters, favorites]);

  const stats = [
    { label: "Guardadas", value: jobs.length, icon: BriefcaseBusiness, color: "text-sky-400" },
    { label: "Favoritas", value: favorites.filter((id) => jobs.some((job) => job.id === id)).length, icon: Heart, color: "text-rose-400" },
    { label: "Aplicadas", value: Object.values(statuses).filter((status) => status === "aplicada").length, icon: CheckCircle2, color: "text-primary" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-7 px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4" />
            Búsqueda inteligente de empleo
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Encuentra la oferta que encaja contigo.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Centraliza tus oportunidades, compáralas con tu perfil y enfócate en las candidaturas con más potencial.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {jobs.length > 0 && (
            <Button
              onClick={() => {
                setJobs([]);
                setScanMsg("Lista vaciada.");
              }}
              disabled={scanning}
              variant="ghost"
            >
              <Trash2 />
              Limpiar
            </Button>
          )}
          <Button onClick={scan} disabled={scanning} size="lg" className="min-w-44">
            <Radar className={cn(scanning && "animate-spin")} />
            {scanning ? "Escaneando…" : "Escanear ofertas"}
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen de candidaturas">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="surface flex items-center gap-4 rounded-2xl p-4 sm:p-5">
            <span className={cn("flex size-10 items-center justify-center rounded-xl bg-muted", color)}>
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {scanMsg && (
        <div
          role="status"
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            scanMsg.startsWith("Error:")
              ? "border-destructive/30 bg-destructive/10 text-red-300"
              : "border-primary/20 bg-primary/8 text-primary"
          )}
        >
          {scanMsg}
        </div>
      )}

      <FilterBar filters={filters} onChange={setFilters} />

      {!jobsLoaded ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Cargando ofertas">
          {[0, 1, 2].map((item) => (
            <div key={item} className="surface h-72 animate-pulse rounded-2xl bg-card/60" />
          ))}
        </section>
      ) : visible.length === 0 ? (
        <section className="surface flex min-h-72 flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
          <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="size-6" />
          </span>
          <h2 className="text-lg font-bold">
            {jobs.length === 0 ? "Tu búsqueda empieza aquí" : "No hay coincidencias"}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {jobs.length === 0
              ? "Configura tu perfil para que la IA pueda valorar cada oportunidad y después inicia tu primer escaneo."
              : "Prueba a reducir la compatibilidad mínima o elimina alguno de los filtros activos."}
          </p>
          {jobs.length === 0 && (
            <Link href="/settings" className={buttonVariants({ variant: "secondary", className: "mt-6" })}>
              Configurar perfil
              <ArrowRight />
            </Link>
          )}
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">Oportunidades recomendadas</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {visible.length} {visible.length === 1 ? "resultado ordenado" : "resultados ordenados"} por compatibilidad
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                favorite={favorites.includes(job.id)}
                status={statuses[job.id] ?? "nueva"}
                onToggleFavorite={() =>
                  setFavorites((prev) =>
                    prev.includes(job.id) ? prev.filter((favorite) => favorite !== job.id) : [...prev, job.id]
                  )
                }
                onStatusChange={(status) => setStatuses((prev) => ({ ...prev, [job.id]: status }))}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
