"use client";

import { Bot, Check, Info, Search, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultSettings, type Settings } from "@/lib/settings";

export default function SettingsPage() {
  const [settings, setSettings, loaded] = useLocalStorage<Settings>("settings", defaultSettings);

  const set = (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch }));

  if (!loaded) {
    return (
      <main className="mx-auto grid w-full max-w-5xl flex-1 animate-pulse gap-5 px-4 py-8 sm:px-6 sm:py-10">
        <div className="h-24 rounded-2xl bg-card/60" />
        <div className="h-96 rounded-2xl bg-card/60" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4" />
            Personaliza tu experiencia
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Configuración</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Define qué buscas y cómo debe evaluar la IA cada oportunidad para obtener recomendaciones más precisas.
          </p>
        </div>
        <span className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
          <Check className="size-3.5" />
          Guardado automático
        </span>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="flex flex-col gap-5">
          <section className="surface rounded-2xl p-5 sm:p-6" aria-labelledby="ai-title">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                <Bot className="size-5" />
              </span>
              <div>
                <h2 id="ai-title" className="font-bold">Motor de inteligencia artificial</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Conecta cualquier API compatible con OpenAI.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="base-url" className="mb-2">Base URL</Label>
                <Input
                  id="base-url"
                  value={settings.baseURL}
                  onChange={(event) => set({ baseURL: event.target.value })}
                  placeholder="https://api.openai.com/v1"
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Déjalo vacío para usar OpenAI directamente.</p>
              </div>
              <div>
                <Label htmlFor="api-key" className="mb-2">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={settings.apiKey}
                  onChange={(event) => set({ apiKey: event.target.value })}
                  placeholder="sk-…"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="model" className="mb-2">Modelo</Label>
                <Input
                  id="model"
                  value={settings.model}
                  onChange={(event) => set({ model: event.target.value })}
                  placeholder="gemini-2.0-flash"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4 text-xs leading-5 text-muted-foreground">
              <div className="flex gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-sky-300" />
                <p>
                  Para Gemini usa <code className="font-mono text-foreground/80">https://generativelanguage.googleapis.com/v1beta/openai/</code>.
                  Para Ollama local usa <code className="font-mono text-foreground/80">http://localhost:11434/v1</code>.
                </p>
              </div>
            </div>
          </section>

          <section className="surface rounded-2xl p-5 sm:p-6" aria-labelledby="profile-title">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                <UserRound className="size-5" />
              </span>
              <div>
                <h2 id="profile-title" className="font-bold">Perfil profesional</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Este contexto se envía a la IA para calcular la compatibilidad.</p>
              </div>
            </div>
            <Label htmlFor="profile" className="mb-2">Experiencia, stack y preferencias</Label>
            <Textarea
              id="profile"
              value={settings.profile}
              onChange={(event) => set({ profile: event.target.value })}
              rows={9}
              placeholder="Años de experiencia, tecnologías, logros, qué buscas y qué quieres evitar…"
              className="resize-y leading-6"
            />
          </section>

          <section className="surface rounded-2xl p-5 sm:p-6" aria-labelledby="search-title">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search className="size-5" />
              </span>
              <div>
                <h2 id="search-title" className="font-bold">Preferencias de búsqueda</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Estos datos se utilizan al consultar los portales de empleo.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="query" className="mb-2">Qué buscar</Label>
                <Input
                  id="query"
                  value={settings.query}
                  onChange={(event) => set({ query: event.target.value })}
                  placeholder="Desarrollador full stack"
                />
              </div>
              <div>
                <Label htmlFor="location" className="mb-2">Ubicación</Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(event) => set({ location: event.target.value })}
                  placeholder="Madrid, Barcelona, Spain…"
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Evita tildes para obtener mejores resultados.</p>
              </div>
            </div>
          </section>

          <section className="surface rounded-2xl p-5 sm:p-6" aria-labelledby="infojobs-title">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="infojobs-title" className="font-bold">Credenciales de InfoJobs</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Opcional</span>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Sin credenciales, las búsquedas seguirán utilizando LinkedIn.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="infojobs-client-id" className="mb-2">Client ID</Label>
                <Input
                  id="infojobs-client-id"
                  value={settings.infojobsClientId}
                  onChange={(event) => set({ infojobsClientId: event.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="infojobs-secret" className="mb-2">Client Secret</Label>
                <Input
                  id="infojobs-secret"
                  type="password"
                  value={settings.infojobsClientSecret}
                  onChange={(event) => set({ infojobsClientSecret: event.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="surface rounded-2xl p-5 lg:sticky lg:top-21">
          <h2 className="text-sm font-bold">Perfil de búsqueda</h2>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Consulta actual</p>
              <p className="mt-1.5 text-sm font-semibold">{settings.query || "Sin definir"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ubicación</p>
              <p className="mt-1.5 text-sm font-semibold">{settings.location || "Sin definir"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Modelo de IA</p>
              <p className="mt-1.5 break-words text-sm font-semibold">{settings.model || "Sin configurar"}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-muted/70 p-4">
            <p className="text-xs leading-5 text-muted-foreground">
              Cuanto más concreto sea tu perfil, más útiles serán la puntuación y el resumen de cada oferta.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
