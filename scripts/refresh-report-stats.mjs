// Refresh self-reported case counts for people-platforms.
//
// Safety model (important for unattended auto-commit):
//   - Each adapter returns plain integers parsed from the platform's own
//     public page/API, or null when it cannot find a confident value.
//   - isPlausible() rejects values that are non-integers, out of range, or
//     a suspicious jump/drop versus the last good value (a likely parse error).
//   - On any fetch/parse failure or rejection, the PREVIOUS value is kept.
//     The worst case is "did not update", never "shipped a wrong number".
//
// Run `node scripts/refresh-report-stats.mjs --dry-run` to test without writing.

import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const sourceFile = path.join(rootDir, "data", "sources.json");
const today = new Date().toISOString().slice(0, 10);
const dryRun = process.argv.includes("--dry-run");
const UA = "VeneHelpStatsBot/1.0 (+https://directorioterremotovenezuela.org)";
const TIMEOUT_MS = 15000;

const fetchWithTimeout = async (url, accept) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept },
      redirect: "follow",
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
};

const fetchText = async (url) => (await fetchWithTimeout(url, "text/html")).text();
const fetchJson = async (url) => (await fetchWithTimeout(url, "application/json")).json();

// Find the first integer that sits near any of the given keywords in HTML.
const numberNear = (html, keywords) => {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ");
  for (const kw of keywords) {
    const re = new RegExp(
      `([\\d][\\d.,]{0,12})\\s*[^\\d]{0,40}?${kw}|${kw}[^\\d]{0,40}?([\\d][\\d.,]{0,12})`,
      "i"
    );
    const m = plain.match(re);
    if (m) {
      // Drop thousands separators (1.234 / 1,234) then keep digits only.
      const raw = (m[1] || m[2] || "").replace(/[.,](?=\d{3}\b)/g, "").replace(/[^\d]/g, "");
      if (raw) return parseInt(raw, 10);
    }
  }
  return null;
};

const firstNumber = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

// Per-platform adapters. Add a slug here to start tracking its self-count.
const adapters = {
  "venezuela-reporta": async () => {
    const html = await fetchText("https://venezuelareporta.org/");
    return {
      reported: numberNear(html, ["desaparecid", "se busca", "reportad", "missing"]),
      found: numberNear(html, ["encontrad", "localizad", "found"])
    };
  },
  // NOTE: desaparecidos-terremoto-venezuela loads its counters client-side from
  // https://desaparecidos-terremoto-api.theempire.tech/api/personas/*, which is
  // reCAPTCHA-gated (every data request returns 403 "Verificación reCAPTCHA
  // requerida"). We deliberately do not try to bypass that anti-abuse control,
  // so its report_stats are maintained manually in data/sources.json and only
  // the as_of date tells you how fresh they are.
  "localizados-venezuela": async () => {
    // Public read API (CORS-enabled). meta.total is the located-people count.
    const data = await fetchJson("https://localizadosvenezuela.com/api/v1/localizados?limit=1");
    return { located: firstNumber(data?.meta?.total) };
  }
};

const isPlausible = (n, prev) => {
  if (!Number.isInteger(n) || n <= 0 || n > 100_000_000) return false;
  if (Number.isInteger(prev)) {
    if (n < prev * 0.2) return false; // unexpected collapse -> likely parse error
    if (n > prev * 50) return false; // absurd jump -> likely grabbed the wrong number
  }
  return true;
};

const sources = JSON.parse(await fs.readFile(sourceFile, "utf8"));
let changed = false;

for (const source of sources) {
  const adapter = adapters[source.slug];
  if (!adapter) continue;

  let parsed;
  try {
    parsed = await adapter();
  } catch (error) {
    console.warn(`[skip]    ${source.slug}: ${error.message} (keeping previous)`);
    continue;
  }

  const prev = source.report_stats || {};
  const next = { ...prev };
  let updatedAny = false;

  for (const key of ["reported", "found", "located"]) {
    const value = parsed[key];
    if (value == null) continue;
    if (isPlausible(value, prev[key])) {
      if (next[key] !== value) {
        next[key] = value;
        updatedAny = true;
      }
    } else {
      console.warn(`[reject]  ${source.slug}.${key}=${value} (prev=${prev[key]})`);
    }
  }

  if (updatedAny) {
    next.as_of = today;
    next.source = "self-reported";
    source.report_stats = next;
    changed = true;
    console.log(`[update]  ${source.slug}: ${JSON.stringify(next)}`);
  } else {
    console.log(`[nochange] ${source.slug}`);
  }
}

if (!changed) {
  console.log("No stat changes.");
} else if (dryRun) {
  console.log("Dry run: changes detected but not written.");
} else {
  await fs.writeFile(sourceFile, JSON.stringify(sources, null, 2) + "\n");
  console.log("Wrote updated stats to data/sources.json.");
}
