"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Ofertas", icon: LayoutDashboard },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="AI Job Hunter">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_var(--primary)]">
            <BriefcaseBusiness className="size-4.5" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-bold tracking-tight">AI Job Hunter</span>
            <span className="block truncate text-[11px] text-muted-foreground">Tu búsqueda, mejor enfocada</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 rounded-xl border border-border bg-card/70 p-1" aria-label="Navegación principal">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
                  active
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="hidden min-[400px]:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
