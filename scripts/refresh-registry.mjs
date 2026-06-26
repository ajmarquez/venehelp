import fs from "node:fs/promises";
import path from "node:path";
import { collectVenezuelaReporta } from "./registry/sources/venezuela-reporta.mjs";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const outputFile = path.join(rootDir, "data", "registry.json");

const maxPages = Number(process.env.VENEZUELA_REPORTA_MAX_PAGES || 5);
const concurrency = Number(process.env.VENEZUELA_REPORTA_CONCURRENCY || 4);

const venezuelaReporta = await collectVenezuelaReporta({ maxPages, concurrency });

const output = {
  generated_at: new Date().toISOString(),
  schema_version: 1,
  beta: true,
  notes: [
    "This registry is a beta consolidation layer for the VeneHelp directory.",
    "Counts come from the public summary exposed by Venezuela Reporta.",
    "The table is currently a preview built from sampled public search pages while more adapters are added."
  ],
  sources: [venezuelaReporta.source],
  summary: {
    source_name: venezuelaReporta.source.name,
    source_slug: venezuelaReporta.source.slug,
    total_results: venezuelaReporta.summary.total_results,
    total_results_display: venezuelaReporta.summary.total_results_display,
    missing_count: venezuelaReporta.summary.missing_count,
    missing_count_display: venezuelaReporta.summary.missing_count_display,
    found_count: venezuelaReporta.summary.found_count,
    found_count_display: venezuelaReporta.summary.found_count_display,
    sampled_pages: venezuelaReporta.summary.sampled_pages,
    total_pages: venezuelaReporta.summary.total_pages,
    preview_records: venezuelaReporta.summary.preview_records,
    is_partial: venezuelaReporta.summary.is_partial
  },
  records: venezuelaReporta.previewRecords
};

await fs.writeFile(outputFile, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote registry preview to ${outputFile}`);
