"use client";

import { Filter, RotateCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ponytail: barra de búsqueda y filtros fusionados en un solo componente
export interface Filters {
  text: string;
  tech: string;
  minScore: number;
  remoteOnly: boolean;
  favoritesOnly: boolean;
}

export const emptyFilters: Filters = {
  text: "",
  tech: "",
  minScore: 0,
  remoteOnly: false,
  favoritesOnly: false,
};

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const activeFilters = [
    Boolean(filters.text),
    Boolean(filters.tech),
    filters.minScore > 0,
    filters.remoteOnly,
    filters.favoritesOnly,
  ].filter(Boolean).length;

  return (
    <section className="surface rounded-2xl p-4 sm:p-5" aria-labelledby="filters-title">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Filter className="size-4" />
        </span>
        <div>
          <h2 id="filters-title" className="text-sm font-bold">Filtra tus oportunidades</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Afina los resultados sin perder de vista lo importante.</p>
        </div>
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onChange(emptyFilters)}>
            <RotateCcw />
            <span className="hidden sm:inline">Restablecer</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_220px]">
        <div>
          <Label htmlFor="job-search" className="mb-2 text-xs text-muted-foreground">Puesto, empresa o ubicación</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="job-search"
              value={filters.text}
              onChange={(event) => set({ text: event.target.value })}
              placeholder="Frontend, Indra, Murcia…"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="tech-search" className="mb-2 text-xs text-muted-foreground">Tecnología</Label>
          <div className="relative">
            <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="tech-search"
              value={filters.tech}
              onChange={(event) => set({ tech: event.target.value })}
              placeholder="React, Python, Node.js…"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <Label htmlFor="score-filter" className="text-xs text-muted-foreground">Compatibilidad mínima</Label>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{filters.minScore}%</span>
          </div>
          <input
            id="score-filter"
            type="range"
            min={0}
            max={100}
            step={5}
            value={filters.minScore}
            onChange={(event) => set({ minScore: Number(event.target.value) })}
            className="h-2 w-full cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
        <span className="mr-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          Filtros rápidos
        </span>
        <label className={cn(
          "cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
          filters.remoteOnly ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        )}>
          <input
            type="checkbox"
            checked={filters.remoteOnly}
            onChange={(event) => set({ remoteOnly: event.target.checked })}
            className="sr-only"
          />
          Solo remoto
        </label>
        <label className={cn(
          "cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
          filters.favoritesOnly ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        )}>
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(event) => set({ favoritesOnly: event.target.checked })}
            className="sr-only"
          />
          Solo favoritas
        </label>
      </div>
    </section>
  );
}
