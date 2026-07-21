import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import type { Job } from "@/types/job";
import type { JobProvider } from "./types";
import { mapPool } from "@/lib/pool";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// ponytail: endpoints "guest" no documentados de LinkedIn. Si los cierran,
// solo hay que reescribir este adaptador; el resto de la app no se entera.
export const linkedinProvider: JobProvider = {
  name: "LinkedIn",

  async search({ query, location, maxResults = 15 }): Promise<Job[]> {
    const url =
      "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search" +
      `?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&start=0`;

    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`LinkedIn respondió HTTP ${res.status}`);

    const $ = cheerio.load(await res.text());
    const jobs: Job[] = [];

    $("li")
      .slice(0, maxResults)
      .each((_, el) => {
        const card = $(el);
        const link = card.find("a.base-card__full-link").attr("href")?.split("?")[0] ?? "";
        const title = card.find("h3.base-search-card__title").text().trim();
        if (!link || !title) return;

        const loc = card.find("span.job-search-card__location").text().trim();
        jobs.push({
          id: "linkedin:" + createHash("md5").update(link).digest("hex").slice(0, 12),
          title,
          company: card.find("h4.base-search-card__subtitle").text().trim(),
          location: loc,
          remote: /remote|remoto/i.test(loc),
          description: "",
          url: link,
          source: "LinkedIn",
          publishedAt: card.find("time").attr("datetime") || undefined,
        });
      });

    // Descripciones: endpoint guest de detalle, concurrencia 5
    await mapPool(jobs, 5, async (job) => {
      const jobId = job.url.match(/(\d{6,})/)?.[1];
      if (!jobId) return;
      try {
        const r = await fetch(
          `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`,
          { headers: { "User-Agent": UA } }
        );
        if (!r.ok) return;
        const $d = cheerio.load(await r.text());
        job.description = $d("div.show-more-less-html__markup").text().trim().slice(0, 4000);
      } catch {
        // sin descripción: la IA analiza con título + empresa
      }
    });

    return jobs;
  },
};
