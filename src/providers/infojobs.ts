import { createHash } from "node:crypto";
import type { Job } from "@/types/job";
import type { JobProvider } from "./types";

export interface InfoJobsCreds {
  clientId: string;
  clientSecret: string;
}

// API oficial: https://developer.infojobs.net

interface IJOffer {
  id: string;
  title: string;
  author?: { name?: string };
  city?: string;
  province?: { value?: string };
  teleworking?: { value?: string };
  salaryMin?: { value?: string };
  salaryMax?: { value?: string };
  salaryPeriod?: { value?: string };
  requirementMin?: string;
  link?: string;
  published?: string;
}

function fmtSalary(o: IJOffer): string | undefined {
  const min = o.salaryMin?.value;
  const max = o.salaryMax?.value;
  if (!min && !max) return undefined;
  const range = [min, max].filter((v) => v && v !== "0").join(" – ");
  return range ? `${range} ${o.salaryPeriod?.value ?? ""}`.trim() : undefined;
}


export function infojobsProvider(creds: InfoJobsCreds): JobProvider {
  return {
    name: "InfoJobs",

    async search({ query, location, maxResults = 20 }): Promise<Job[]> {
      const params = new URLSearchParams({
        q: query,
        maxResults: String(maxResults),
        sortBy: "updated-desc",
      });
      if (location.trim()) params.set("province", location.trim().toLowerCase());

      const url = `https://api.infojobs.net/api/9/offer?${params.toString()}`;
      const authorization = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
      const res = await fetch(url, {
        headers: {
          Authorization: `Basic ${authorization}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(
          `InfoJobs respondió HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`
        );
      }

      const data = await res.json();
      const offers: IJOffer[] = data.offers ?? [];

      return offers.map((o) => {
        const loc = [o.city, o.province?.value].filter(Boolean).join(", ");
        const link = o.link ?? `https://www.infojobs.net/offers/${o.id}`;
        return {
          id: "infojobs:" + createHash("md5").update(link).digest("hex").slice(0, 12),
          title: o.title ?? "",
          company: o.author?.name ?? "",
          location: loc,
          remote: /teletrabajo|remoto|100%/i.test(o.teleworking?.value ?? ""),
          salary: fmtSalary(o),
          description: (o.requirementMin ?? "").slice(0, 4000),
          url: link,
          source: "InfoJobs",
          publishedAt: o.published,
        };
      });
    },
  };
}
