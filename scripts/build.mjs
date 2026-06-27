import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const docsDir = path.join(rootDir, "docs");
const sourceFile = path.join(rootDir, "data", "sources.json");
const defaultCloudflareAnalyticsToken = "4a80fe27b95e4d6b990cb960bf94699d";
const defaultGoogleAnalyticsMeasurementId = "G-6SX9JMJTS2";

const customDomain = (process.env.SITE_DOMAIN || "directorioterremotovenezuela.org").replace(/^https?:\/\//, "").replace(/\/+$/, "");
const siteUrl = (process.env.SITE_URL || `https://${customDomain}`).replace(/\/+$/, "");
const sitePath = (process.env.SITE_PATH || "").replace(/\/+$/, "");
const cloudflareAnalyticsToken = (process.env.CLOUDFLARE_ANALYTICS_TOKEN ?? defaultCloudflareAnalyticsToken).trim();
const googleAnalyticsMeasurementId = (process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID ?? defaultGoogleAnalyticsMeasurementId).trim();
const showRegistry = false;
const generatedAt = new Date().toISOString();
const assetVersion = generatedAt.replace(/[^0-9]/g, "");
const rawSources = JSON.parse(await fs.readFile(sourceFile, "utf8"));
const supportedLocales = ["es", "en"];
const rawRegistry = {
  generated_at: generatedAt,
  schema_version: 1,
  beta: false,
  notes: ["Registry publishing is disabled in this build."],
  sources: [],
  summary: {
    source_name: null,
    source_slug: null,
    total_results: null,
    total_results_display: null,
    missing_count: null,
    missing_count_display: null,
    found_count: null,
    found_count_display: null,
    sampled_pages: 0,
    total_pages: 0,
    preview_records: 0,
    is_partial: true
  },
  records: []
};

const withSitePath = (pathname) => `${sitePath}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
const absoluteUrl = (pathname) => `${siteUrl}${withSitePath(pathname)}`;
const localeBasePath = (locale) => withSitePath(`/${locale}`);
const localePath = (locale, pathname = "/") =>
  withSitePath(`/${locale}${pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`}`);
const absoluteLocaleUrl = (locale, pathname = "/") => `${siteUrl}${localePath(locale, pathname)}`;
const registryPath = (locale) => localePath(locale, "/registro/");
const absoluteRegistryUrl = (locale) => `${siteUrl}${registryPath(locale)}`;
const labsPath = (locale) => localePath(locale, "/labs/");
const absoluteLabsUrl = (locale) => `${siteUrl}${labsPath(locale)}`;

const styles = `
:root {
  --bg: #ffffff;
  --surface: #ffffff;
  --surface-muted: #f7f8fb;
  --ink: #15171d;
  --muted: #5d6675;
  --line: #d9dee8;
  --blue: #1f4ea8;
  --red: #d21f26;
  --yellow: #f6c600;
  --success: #20744a;
  --warn: #8a5a00;
  --radius: 8px;
  --max: 1080px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
  color: var(--ink);
  background: var(--bg);
  line-height: 1.55;
}

a {
  color: var(--blue);
}

main {
  display: block;
}

.shell {
  width: min(calc(100% - 2rem), var(--max));
  margin: 0 auto;
}

.flag-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  height: 6px;
}

.flag-bar span:nth-child(1) {
  background: var(--yellow);
}

.flag-bar span:nth-child(2) {
  background: var(--blue);
}

.flag-bar span:nth-child(3) {
  background: var(--red);
}

.hero,
.page {
  padding: 1.5rem 0 2rem;
}

.eyebrow,
.brand-link {
  display: inline-block;
  margin: 0;
  padding: 0.25rem 0;
  border-radius: 999px;
  color: var(--blue);
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
}

h1, h2, h3 {
  line-height: 1.15;
  margin: 0;
}

h1 {
  max-width: 20ch;
  font-size: 3rem;
  letter-spacing: 0;
}

h2 {
  font-size: 1.35rem;
}

.hero-grid {
  max-width: 760px;
}

.lede {
  margin: 0.75rem 0 0;
  max-width: 68ch;
  color: var(--muted);
  font-size: 1.2rem;
}

.section {
  padding: 0 0 2rem;
}

.panel,
.page-card {
  border-top: 1px solid var(--line);
  padding-top: 1.25rem;
}

.page-intro {
  color: var(--muted);
  max-width: 68ch;
}

.controls {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(16rem, 1fr);
  margin-top: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--muted);
}

.field .small {
  margin: 0;
  padding: 0.75rem 0 0;
}

input,
select {
  width: 100%;
  min-height: 2.8rem;
  padding: 0.75rem 0.85rem;
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

input:focus,
select:focus {
  outline: 3px solid rgba(31, 78, 168, 0.18);
  border-color: var(--blue);
}

a:focus-visible,
button:focus-visible,
summary:focus-visible,
.route-card:focus-visible,
.source-card h3 a:focus-visible {
  outline: 3px solid rgba(31, 78, 168, 0.5);
  outline-offset: 2px;
  border-radius: 4px;
}

.directory-note {
  margin: 1rem 0 0;
  padding-left: 0.85rem;
  border-left: 4px solid var(--yellow);
  color: var(--muted);
  max-width: 76ch;
}

.hero-promise {
  margin: 0.85rem 0 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
}

.triage {
  margin-top: 1.75rem;
}

.triage-title {
  font-size: 1.05rem;
  color: var(--muted);
}

.route-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 0.85rem;
}

.route-card {
  display: block;
  border: 1px solid var(--line);
  border-left: 4px solid var(--blue);
  border-radius: var(--radius);
  padding: 1rem;
  background: var(--surface-muted);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.route-card:hover,
.route-card:focus-visible {
  border-color: var(--blue);
  background: #eef2fb;
}

.route-q {
  margin: 0;
  font-weight: 700;
  color: var(--ink);
}

.route-a {
  margin: 0.5rem 0 0;
  color: var(--blue);
  font-weight: 700;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  min-height: 1.65rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid var(--line);
}

.pill {
  background: var(--surface-muted);
  color: #404856;
}

.source-list {
  display: grid;
  gap: 0;
  margin-top: 1.25rem;
  border-top: 1px solid var(--line);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.filters-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--muted);
}

.filter-btn {
  min-height: 2.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
}

.filter-btn:hover {
  border-color: var(--blue);
}

.filter-btn--active {
  background: var(--blue);
  color: #fff;
  border-color: var(--blue);
}

.results-count {
  margin-top: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.directory-sections {
  display: grid;
  gap: 1.75rem;
  margin-top: 1.5rem;
}

.directory-developers {
  margin-top: 1.5rem;
  padding: 1.5rem 1.6rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-muted);
}

.developer-eyebrow {
  color: var(--muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.directory-developers .source-card {
  border-bottom-color: #e3e7ef;
}

.directory-developers .source-card:last-child {
  border-bottom: 0;
}

.directory-block {
  border: 1px solid var(--line);
  border-top: 5px solid var(--blue);
  border-radius: 12px;
  padding: 1.25rem 1.4rem 0.5rem;
  background: var(--surface);
}

#section-missing {
  border-top-color: var(--red);
}

#section-located {
  border-top-color: var(--yellow);
}

#section-aid {
  border-top-color: var(--success);
}

.directory-block h3 {
  margin: 0;
  font-size: 1.2rem;
}

.directory-block .small {
  margin: 0.5rem 0 0;
}

.section-note {
  margin: 0.75rem 0 0;
  padding: 0.65rem 0.85rem;
  border-left: 4px solid var(--yellow);
  background: var(--surface-muted);
  border-radius: 0 var(--radius) var(--radius) 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.directory-block .source-list {
  margin-top: 1rem;
}

.directory-block .source-card:last-child {
  border-bottom: 0;
}

.registry-stats {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1rem;
}

.registry-stat {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem;
  background: var(--surface-muted);
}

.registry-stat strong {
  display: block;
  font-size: 1.65rem;
  line-height: 1;
}

.registry-stat span {
  display: block;
  margin-top: 0.45rem;
  color: var(--muted);
  font-size: 0.92rem;
}

.registry-stat--missing strong {
  color: var(--warn);
}

.registry-stat--found strong {
  color: var(--success);
}

.registry-stat--preview strong {
  color: var(--blue);
}

.table-scroll {
  overflow: auto;
  margin-top: 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.registry-table {
  width: 100%;
  min-width: 42rem;
  border-collapse: collapse;
}

.registry-table th,
.registry-table td {
  padding: 0.8rem 0.85rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--line);
}

.registry-table th {
  background: var(--surface-muted);
  color: var(--muted);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.registry-table tbody tr:last-child td {
  border-bottom: 0;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.6rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-chip--missing {
  background: #fff1d8;
  color: var(--warn);
}

.status-chip--safe,
.status-chip--found {
  background: #e5f3eb;
  color: var(--success);
}

.source-card {
  display: grid;
  gap: 0.8rem;
  padding: 1.15rem 0;
  border-bottom: 1px solid var(--line);
}

.source-card h3 {
  font-size: 1.25rem;
}

.source-card h3 a {
  color: var(--ink);
  text-decoration-color: rgba(31, 78, 168, 0.28);
  text-underline-offset: 0.18em;
}

.source-card p {
  margin: 0;
  color: var(--muted);
  max-width: 76ch;
}

.source-facts {
  font-size: 0.92rem;
}

.source-usewhen {
  margin: 0;
  font-weight: 700;
  color: var(--ink);
}

.cap-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.cap {
  display: inline-flex;
  align-items: center;
  min-height: 1.65rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.cap--on {
  background: #e5f3eb;
  color: var(--success);
  border-color: #bfe2cd;
}

.cap--off {
  background: var(--surface-muted);
  color: var(--muted);
  border-color: var(--line);
}

.source-trust {
  margin: 0;
}

.source-stats {
  margin: 0;
  font-size: 0.98rem;
  color: var(--ink);
}

.source-stats strong {
  color: var(--blue);
}

.source-stats-note {
  color: var(--muted);
  font-size: 0.86rem;
  font-weight: 400;
}

.source-warning {
  margin: 0;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius);
  background: #fff1d8;
  color: var(--warn);
  font-weight: 700;
  border: 1px solid #f0d9a6;
}

.source-card footer,
.page-links,
.topbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
}

.topbar {
  justify-content: space-between;
  margin-bottom: 1.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--line);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.55rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 700;
  background: var(--blue);
  color: #fff;
}

.button.secondary {
  background: transparent;
  color: var(--blue);
  border: 1px solid var(--line);
}

.small {
  color: var(--muted);
  font-size: 0.94rem;
}

.detail-link {
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}

.detail-link:hover,
.detail-link:focus-visible {
  color: var(--blue);
  text-decoration: underline;
}

.language-switcher {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.2rem;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--line);
}

.language-switcher a {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  text-decoration: none;
  color: var(--muted);
  font-weight: 700;
}

.language-switcher a[aria-current="page"] {
  background: var(--blue);
  color: #fff;
}

ul {
  padding-left: 1.2rem;
}

.footer {
  padding: 0 0 2rem;
  color: var(--muted);
}

.page-card {
  padding-bottom: 1.25rem;
}

.labs-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 1rem;
}

.labs-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1rem;
  background: var(--surface-muted);
}

.labs-card h3 {
  margin: 0;
}

.labs-card p,
.labs-card li {
  color: var(--muted);
}

.labs-card ul,
.labs-card ol {
  margin: 0.75rem 0 0;
}

.labs-kicker {
  margin: 0;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.labs-note {
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-left: 4px solid var(--yellow);
  background: var(--surface-muted);
  color: var(--muted);
  border-radius: 0 var(--radius) var(--radius) 0;
}

.labs-review-toolbar {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 1rem;
}

.labs-summary-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin-top: 1rem;
}

.labs-method-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 1rem;
}

.labs-method-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1rem;
  background: var(--surface-muted);
}

.labs-method-card h3 {
  margin: 0;
  font-size: 1rem;
}

.labs-method-card p {
  margin: 0.55rem 0 0;
  color: var(--muted);
}

.labs-method-ranges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.labs-method-range {
  display: inline-flex;
  align-items: center;
  min-height: 1.8rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  font-size: 0.86rem;
  font-weight: 700;
}

.labs-method-range[data-confidence="high"] {
  border-color: #bfe2cd;
  background: #e5f3eb;
  color: var(--success);
}

.labs-method-range[data-confidence="medium"] {
  border-color: #f0d9a6;
  background: #fff1d8;
  color: var(--warn);
}

.labs-method-range[data-confidence="low"] {
  border-color: #ebd6db;
  background: #fbf0f2;
  color: #9b3347;
}

.labs-summary-stat {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1rem;
  background: var(--surface-muted);
}

.labs-summary-stat strong {
  display: block;
  font-size: 1.65rem;
  line-height: 1;
  color: var(--blue);
}

.labs-summary-stat span {
  display: block;
  margin-top: 0.45rem;
  color: var(--muted);
  font-size: 0.92rem;
}

.labs-match-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.labs-table-wrap {
  margin-top: 1rem;
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
}

.labs-match-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.labs-match-table th,
.labs-match-table td {
  padding: 0.9rem 1rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--line);
}

.labs-match-table th {
  background: var(--surface-muted);
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.labs-match-table tr:last-child td {
  border-bottom: none;
}

.labs-match-table td strong {
  display: block;
}

.labs-table-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.labs-table-link {
  white-space: nowrap;
}

.labs-match-card {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 1rem;
  background: var(--surface);
}

.labs-match-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.labs-score {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface-muted);
  font-weight: 700;
}

.labs-score[data-confidence="high"] {
  border-color: #bfe2cd;
  background: #e5f3eb;
  color: var(--success);
}

.labs-score[data-confidence="medium"] {
  border-color: #f0d9a6;
  background: #fff1d8;
  color: var(--warn);
}

.labs-score[data-confidence="low"] {
  border-color: #ebd6db;
  background: #fbf0f2;
  color: #9b3347;
}

.labs-score-value {
  font-size: 1.15rem;
}

.labs-score-label {
  color: var(--muted);
  font-size: 0.85rem;
}

.labs-review-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 1rem;
}

.labs-review-panel {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1rem;
  background: var(--surface-muted);
}

.labs-review-panel h3 {
  margin: 0;
}

.labs-review-panel p {
  margin: 0.55rem 0 0;
}

.labs-review-panel dl {
  display: grid;
  gap: 0.55rem;
  margin: 0.85rem 0 0;
}

.labs-review-panel dt {
  font-size: 0.8rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.labs-review-panel dd {
  margin: 0.15rem 0 0;
}

.labs-evidence-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.85rem;
}

.labs-evidence-pill {
  display: inline-flex;
  align-items: center;
  min-height: 1.7rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: #eef2fb;
  color: var(--blue);
  font-size: 0.82rem;
  font-weight: 700;
}

.labs-candidate-list {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.labs-candidate-item {
  border-top: 1px solid var(--line);
  padding-top: 0.75rem;
}

.labs-source-note {
  margin: 0.3rem 0 0;
}

.labs-empty {
  margin-top: 1rem;
  color: var(--muted);
}

.page-card + .page-card {
  margin-top: 0;
}

.detail-usewhen {
  margin-top: 0.75rem;
  font-size: 1.2rem;
}

.tech-details summary {
  cursor: pointer;
  font-weight: 700;
  color: var(--blue);
}

.tech-details[open] summary {
  margin-bottom: 0.5rem;
}

.definition-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--line);
}

.definition-list div {
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--line);
}

.definition-list dt {
  font-size: 0.88rem;
  color: var(--muted);
}

.definition-list dd {
  margin: 0.35rem 0 0;
}

code {
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
}

@media (max-width: 860px) {
  .controls,
  .definition-list,
  .registry-stats {
    grid-template-columns: 1fr;
  }

  .route-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 2.25rem;
  }

  .topbar {
    align-items: flex-start;
  }
}
`.trimStart();

const categoryLabels = {
  website: { es: "Sitio web", en: "Website" },
  map: { es: "Mapa", en: "Map" },
  form: { es: "Formulario", en: "Form" },
  media: { es: "Medio", en: "Media" },
  campaign: { es: "Campaña", en: "Campaign" },
  app: { es: "Aplicación", en: "App" }
};

const purposeLabels = {
  "report-and-search": { es: "Reportar y buscar", en: "Report and search" },
  reporting: { es: "Reporte", en: "Reporting" },
  "located-people": { es: "Personas localizadas", en: "Located people" },
  "context-and-location": { es: "Contexto y ubicación", en: "Context and location" },
  "family-tracing": { es: "Restablecimiento de contacto", en: "Family tracing" },
  "aid-and-updates": { es: "Ayuda y actualizaciones", en: "Aid and updates" },
  "official-reporting": { es: "Reporte oficial", en: "Official reporting" },
  lead: { es: "Pista", en: "Lead" }
};

const coverageLabels = {
  national: { es: "Nacional", en: "National" }
};

const ownerLabels = {
  "Volunteer initiative": { es: "Iniciativa voluntaria", en: "Volunteer initiative" },
  "Citizen platform": { es: "Plataforma ciudadana", en: "Citizen platform" },
  "Company platform": { es: "Plataforma empresarial", en: "Company platform" },
  "Community responders": { es: "Respondedores comunitarios", en: "Community responders" },
  "Media outlet": { es: "Medio de comunicación", en: "Media outlet" },
  "Campaign network": { es: "Red de campaña", en: "Campaign network" },
  "International Committee of the Red Cross": {
    es: "Comité Internacional de la Cruz Roja",
    en: "International Committee of the Red Cross"
  },
  "International Federation of Red Cross and Red Crescent Societies": {
    es: "Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja",
    en: "International Federation of Red Cross and Red Crescent Societies"
  },
  Government: { es: "Gobierno", en: "Government" },
  Unknown: { es: "Desconocido", en: "Unknown" }
};

const operatorTypeLabels = {
  volunteer: { es: "Voluntario", en: "Volunteer" },
  citizen: { es: "Ciudadano", en: "Citizen-led" },
  community: { es: "Comunitario", en: "Community" },
  company: { es: "Empresa", en: "Company" },
  humanitarian: { es: "Humanitario", en: "Humanitarian" },
  official: { es: "Oficial", en: "Official" },
  unknown: { es: "No verificado", en: "Unverified" }
};

const statusLabels = {
  active: { es: "Activa", en: "Active" },
  monitor: { es: "Verificar manualmente", en: "Manual verification" },
  down: { es: "Caída", en: "Down" },
  unknown: { es: "Estado desconocido", en: "Unknown status" }
};

const serviceLabels = {
  "missing-report": { es: "Reportar desaparecidos", en: "Report missing people" },
  "missing-search": { es: "Buscar personas", en: "Search people" },
  "found-report": { es: "Reportar encontrado / a salvo", en: "Mark found / safe" },
  "located-search": { es: "Buscar personas localizadas", en: "Search located people" },
  "located-report": { es: "Aportar personas localizadas", en: "Contribute located people" },
  "safe-checkin": { es: "Avisar que alguien está a salvo", en: "Safe check-in" },
  "family-tracing": { es: "Restablecer contacto familiar", en: "Restore family contact" },
  shelters: { es: "Refugios", en: "Shelters" },
  hospitals: { es: "Hospitales", en: "Hospitals" },
  "aid-resources": { es: "Recursos de ayuda", en: "Aid resources" },
  donations: { es: "Donaciones", en: "Donations" },
  "damage-reports": { es: "Reportes de daños", en: "Damage reports" },
  "situation-updates": { es: "Actualizaciones de situación", en: "Situation updates" }
};

const tagLabels = {
  earthquake: { es: "terremoto", en: "earthquake" },
  "missing-persons": { es: "personas-desaparecidas", en: "missing-persons" },
  "public-registry": { es: "registro-publico", en: "public-registry" },
  "volunteer-run": { es: "gestion-voluntaria", en: "volunteer-run" },
  search: { es: "busqueda", en: "search" },
  registry: { es: "registro", en: "registry" },
  emergency: { es: "emergencia", en: "emergency" },
  "citizen-platform": { es: "plataforma-ciudadana", en: "citizen-platform" },
  map: { es: "mapa", en: "map" },
  damage: { es: "danos", en: "damage" },
  context: { es: "contexto", en: "context" },
  form: { es: "formulario", en: "form" },
  reporting: { es: "reporte", en: "reporting" },
  community: { es: "comunidad", en: "community" },
  lead: { es: "pista", en: "lead" },
  media: { es: "medio", en: "media" },
  campaign: { es: "campana", en: "campaign" },
  official: { es: "oficial", en: "official" },
  app: { es: "aplicacion", en: "app" },
  humanitarian: { es: "humanitario", en: "humanitarian" },
  donations: { es: "donaciones", en: "donations" },
  updates: { es: "actualizaciones", en: "updates" },
  "open-source": { es: "codigo-abierto", en: "open-source" },
  api: { es: "api", en: "api" },
  hospitals: { es: "hospitales", en: "hospitals" },
  aid: { es: "ayuda", en: "aid" },
  shelter: { es: "refugio", en: "shelter" },
  rescue: { es: "rescate", en: "rescue" }
};

const spanishSourceCopy = {
  "desaparecidos-terremoto-venezuela": {
    summary:
      "Registro ciudadano para reportar y buscar personas desaparecidas tras el terremoto. Se ha citado como una de las plataformas públicas más referenciadas.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Está orientado a reportar personas desaparecidas, buscar registros y marcar a alguien como encontrado."
    ]
  },
  "venezuela-te-busca": {
    summary:
      "Registro colaborativo de personas desaparecidas con flujos de búsqueda y reporte.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Se reporta que permite buscar por nombre, cédula o ubicación."
    ]
  },
  "venezuela-reporta": {
    summary:
      "Plataforma ciudadana para reportar, buscar y marcar personas desaparecidas como encontradas tras el terremoto.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "La navegación pública visible muestra flujos de búsqueda, reporte y marcado de encontrado."
    ]
  },
  "red-ayuda-venezuela": {
    summary:
      "Plataforma ciudadana de emergencia para avisar que una persona está a salvo, buscar personas y coordinar ayuda tras el terremoto.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "El sitio se describe como una red ciudadana de emergencia para reportes de estado, búsqueda de personas y coordinación de ayuda."
    ]
  },
  "terremoto-venezuela-mapa": {
    summary:
      "Sitio de mapeo de incidentes y daños que puede ayudar a contextualizar ubicaciones vinculadas con reportes de personas desaparecidas.",
    notes: [
      "Sirve como contexto complementario, no como registro principal de personas desaparecidas.",
      "La URL redirige a HTTPS y cargó correctamente durante la revisión de enlaces del 26 de junio de 2026."
    ]
  },
  "yummy-sos": {
    summary:
      "Sitio de emergencia operado por Yummy para reportar daños estructurales, ver reportes públicos y encontrar refugios tras el terremoto.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Los metadatos de la página y la navegación visible muestran flujos públicos para reportar daños, ver reportes, refugios y recursos."
    ]
  },
  "localizados-venezuela": {
    summary:
      "Plataforma pública y de código abierto que consolida listados de pacientes en hospitales para ayudar a ubicar a personas ya localizadas tras el terremoto. Incluye API pública de solo lectura.",
    notes: [
      "La documentación de la API pública está disponible en /api y los endpoints GET de la v1 responden JSON con CORS habilitado para lectura.",
      "El proyecto aclara que es solo para personas localizadas y redirige los casos de desaparecidos a desaparecidosterremotovenezuela.com."
    ]
  },
  "venezuela-resiste-terremotove": {
    summary:
      "Mapa colaborativo de Acceso Libre para reportar edificios colapsados y personas desaparecidas, sobre todo en Yaracuy, y coordinar búsqueda y rescate.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Mapa ciudadano abierto; los reportes no están verificados de forma independiente y se invitan correcciones públicas."
    ]
  },
  "enlaza-venezuela": {
    summary:
      "Plataforma comunitaria que conecta a quienes necesitan rescate, refugio, comida o transporte con voluntarios a través de WhatsApp, con estados de \"voy en camino\" y \"rescatados\".",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Coordina solicitudes y ofertas de ayuda; no es una herramienta de búsqueda de personas ni de restablecimiento de contacto."
    ]
  },
  "ayuda-venezuela-2026": {
    summary:
      "Plataforma de ayuda relacionada con el terremoto de Venezuela de 2026. Sus capacidades aún no están verificadas.",
    notes: [
      "La revisión automática de enlaces devolvió HTTP 403 el 26 de junio de 2026, así que la disponibilidad y las capacidades deben verificarse manualmente.",
      "Se incluye de forma provisional como recurso de ayuda, pendiente de revisión manual."
    ]
  },
  "copernicus-ems-emsr884": {
    summary:
      "Activación oficial de cartografía rápida por satélite de Copernicus EMS para el terremoto de Venezuela de 2026: mapas de evaluación de daños y datos geoespaciales para equipos de respuesta, periodistas y analistas.",
    notes: [
      "Activación EMSR884 del servicio de cartografía rápida de Copernicus EMS, solicitada para el terremoto del 24 de junio de 2026.",
      "Ofrece productos de delineación y gradación de daños como mapas PDF y datos SIG; no tiene búsqueda de personas ni restablecimiento de contacto."
    ]
  },
  "ocr-data-terremoto-venezuela-24062026": {
    summary:
      "Repositorio open source de OCR y transcripción de listas hospitalarias de pacientes del terremoto de Venezuela del 24 de junio de 2026, con exportaciones consolidadas en CSV, XLSX y SQLite, además de una app local de búsqueda semántica.",
    notes: [
      "El README del repositorio indica que transcribe listas manuscritas de pacientes y advierte que algunas cédulas o campos pueden contener errores de lectura por caligrafía u OCR.",
      "Publica salidas consolidadas en Markdown, CSV, XLSX y SQLite, además de una app con sqlite-vec para análisis técnico y búsqueda local."
    ]
  }
};

const localeCopy = {
  es: {
    lang: "es",
    localeLabel: "Español",
    alternateLocaleLabel: "English",
    htmlTitle: "VeneHelp",
    siteDescription:
      "Directorio público de plataformas para buscar y reportar personas, ver localizados y encontrar ayuda de emergencia tras el terremoto en Venezuela.",
    eyebrow: "Directorio del terremoto en Venezuela",
    heroTitle: "Dónde buscar personas y encontrar ayuda",
    heroPromise: "No recibimos reportes aquí; te ayudamos a elegir el sitio correcto.",
    triageTitle: "¿Por dónde empiezo?",
    triageMissingQ: "¿Buscas o reportas a una persona desaparecida?",
    triageMissingA: "Empieza por Personas desaparecidas",
    triageLocatedQ: "¿Podría estar hospitalizada o ya localizada?",
    triageLocatedA: "Revisa Personas localizadas",
    triageAidQ: "¿Necesitas rescate, refugio o ayuda?",
    triageAidA: "Revisa Ayuda y emergencia",
    labsHomePrompt: "¿Quieres revisar posibles coincidencias entre reportes y listados de hospitales?",
    labsHomeCta: "Abrir Labs de matching",
    registryTitle: "Registro consolidado (beta)",
    registryIntro:
      "Mostramos un contador principal y una tabla de trazabilidad a partir de un registro público consolidado. Esta vista es beta y hoy usa una recolección parcial de páginas públicas mientras se agregan más adaptadores.",
    registryLoading: "Cargando registro beta",
    registryLoadFailed: "No se pudo cargar el registro beta.",
    registryEmpty: "Todavía no hay filas en el registro beta.",
    registryMissingLabel: "Se busca",
    registryFoundLabel: "Encontradas / a salvo",
    registryPreviewLabel: "Filas en vista previa",
    registryPartialNote:
      "Vista previa tomada de {sampledPages} de {totalPages} páginas públicas de {sourceName}.",
    registryFullNote:
      "Vista completa tomada de {sourceName}.",
    registryNameColumn: "Nombre",
    registryStatusColumn: "Estado",
    registryLocationColumn: "Ubicación",
    registryReportedOnColumn: "Reportado en",
    registryResultsLabel: "Filas visibles",
    registryResultsShown: "{count} filas visibles",
    registrySearchLabel: "Buscar en el registro",
    registrySearchPlaceholder: "Nombre, ubicación o fuente",
    registryFilterLabel: "Estado",
    registryAllStatuses: "Todos los estados",
    registryStatusMissing: "Se busca",
    registryStatusSafe: "A salvo",
    registryStatusFound: "Encontrado",
    registryLinkLabel: "Abrir registro beta",
    registryPageTitle: "Registro beta | VeneHelp",
    registryPageEyebrow: "Registro beta",
    registryPageIntro:
      "Tabla beta de trazabilidad con búsqueda y filtros por estado. Los datos siguen siendo parciales y dependen de adaptadores públicos por sitio.",
    findSourceTitle: "Directorio",
    searchLabel: "Buscar",
    searchPlaceholder: "Busca por nombre, servicio o etiqueta",
    missingSectionTitle: "Personas desaparecidas",
    missingSectionIntro: "Plataformas para buscar y reportar personas desaparecidas tras el terremoto.",
    missingSectionNote: "Los contadores los publica cada plataforma y pueden incluir duplicados, registros sin verificar o entradas obsoletas, así que no equivalen al número real de personas desaparecidas.",
    locatedSectionTitle: "Personas localizadas",
    locatedSectionIntro: "Listados de personas ya localizadas, como pacientes en hospitales. No son para reportar desaparecidos.",
    aidSectionTitle: "Ayuda y emergencia",
    aidSectionIntro: "Plataformas para coordinar rescate, refugio, daños y otros recursos de emergencia. No son para buscar o reportar personas desaparecidas.",
    developerEyebrow: "Sección técnica",
    developerSectionTitle: "Desarrolladores",
    developerSectionIntro:
      "APIs, datasets, mapas oficiales de daños y proyectos open source útiles para integraciones, agentes y análisis técnico.",
    developerEmpty: "Todavía no hay recursos técnicos publicados en esta versión.",
    capSearch: "Búsqueda pública",
    capReport: "Acepta reportes",
    capFound: "Marca encontrado / a salvo",
    checkedShort: "Revisado",
    statReported: "reportadas",
    statFound: "encontradas",
    statLocated: "localizadas",
    statBySite: "según el sitio",
    localTimeNote: "hora local",
    venezuelaTimeNote: "hora de Venezuela",
    filterLabel: "Mostrar solo",
    venehelpDatasetTitle: "Dataset público de VeneHelp",
    venehelpDatasetSummary:
      "Exportación JSON del directorio de VeneHelp para LLMs, buscadores e integraciones simples.",
    openDataset: "Abrir dataset",
    openApi: "Abrir API",
    openSourceCode: "Abrir código fuente",
    loadingSources: "Cargando recursos",
    resultsShown: "Mostrando {count} de {total} plataformas",
    noResults: "Ningún recurso coincide con los filtros actuales.",
    loadFailed: "No se pudieron cargar las fuentes",
    loadFailedHelp: "Verifica que exista el archivo JSON generado y que el sitio se esté sirviendo desde la carpeta docs.",
    openSource: "Abrir recurso",
    details: "Detalles",
    directLinkPending: "Enlace directo pendiente",
    footer:
      "VeneHelp es un directorio público de plataformas para buscar y reportar personas y encontrar ayuda tras el terremoto en Venezuela. Última generación: {generatedAt}.",
    allSourcesEyebrow: "Todos los recursos",
    allSourcesTitle: "Directorio de recursos",
    allSourcesIntro: "Cada recurso tiene una página estable de detalle y una exportación JSON canónica por idioma.",
    breadcrumbsSources: "Recursos",
    metadataTitle: "Metadatos",
    statusLabelDetail: "Estado",
    operatorTypeLabelDetail: "Tipo de operador",
    coverageLabelDetail: "Cobertura",
    languageLabelDetail: "Idioma",
    requiresLoginLabel: "Requiere inicio de sesión",
    acceptsReportsLabelDetail: "Acepta nuevos reportes",
    publicSearchLabelDetail: "Tiene búsqueda pública",
    reportFoundLabelDetail: "Permite marcar encontrado / a salvo",
    servicesLabelDetail: "Qué ofrece",
    publicContactLabelDetail: "Contacto público",
    publicApiLabelDetail: "API pública",
    sourceCodeLabelDetail: "Código fuente",
    ownerLabelDetail: "Responsable",
    crawlerPriorityLabel: "Prioridad para rastreo",
    lastCheckedLabel: "Última revisión de enlace",
    notYetChecked: "No revisado",
    notesTitle: "Notas",
    tagsTitle: "Etiquetas",
    techDetailsTitle: "Detalles técnicos",
    viewJson: "Ver JSON",
    languageNavLabel: "Idioma",
    sourceListTitle: "Todos los recursos | VeneHelp",
    labsReviewTitle: "Revisión visual de posibles coincidencias",
    labsReviewIntro: "Aquí mostramos posibles matches para revisión humana. El porcentaje es heurístico: una coincidencia exacta por cédula pesa mucho más que una similitud por nombre.",
    labsMethodTitle: "Cómo calculamos el puntaje",
    labsMethodIntro: "La fórmula actual no usa aprendizaje automático. Es una heurística de revisión: combina señales fuertes y señales débiles para sugerir prioridad humana.",
    labsMethodIdentityTitle: "1. Cédula primero",
    labsMethodIdentityText: "Si la cédula coincide exactamente, el caso sube casi al máximo. Si la cédula entra en conflicto, el puntaje baja aunque el nombre se parezca.",
    labsMethodNameTitle: "2. Luego el nombre",
    labsMethodNameText: "Sin cédula, el peso principal viene de la similitud del nombre normalizado: exacto, muy parecido, parecido o moderado.",
    labsMethodContextTitle: "3. Edad y ubicación ajustan",
    labsMethodContextText: "La edad y la ubicación solo corrigen el resultado. Una edad igual o cercana suma un poco; una diferencia grande resta. La ubicación suma poco y nunca reemplaza la identidad.",
    labsMethodRangesTitle: "Cómo leer los porcentajes",
    labsMethodRangeHigh: "93–99%: prioridad alta de revisión",
    labsMethodRangeMedium: "80–92%: posible coincidencia",
    labsMethodRangeLow: "0–79%: señal débil o ambigua",
    labsMethodReviewNote: "El porcentaje no confirma identidad por sí solo. Siempre hay que revisar la evidencia mostrada en la tarjeta y, si existe, validar la cédula, edad, hospital y fuente original.",
    labsSummaryLoading: "Cargando resumen del laboratorio",
    labsMatchesLoading: "Cargando coincidencias candidatas",
    labsMatchesFailed: "No se pudieron cargar los datasets del laboratorio.",
    labsTableTitle: "Tabla rápida de revisión",
    labsTableNameHeader: "Persona desaparecida",
    labsTableSourcesHeader: "Fuentes con match",
    labsTableScoreHeader: "Match sugerido",
    labsTableReviewHeader: "Revisar",
    labsTableOpenDetail: "Ver detalle",
    labsMinScoreLabel: "Puntaje mínimo",
    labsAllScores: "Todos",
    labsHighOnly: "Solo altas",
    labsMediumUp: "Medias o altas",
    labsResultsLabel: "Coincidencias visibles",
    labsResultsShown: "{count} coincidencias visibles",
    labsNoMatches: "No hay coincidencias candidatas con los filtros actuales.",
    labsSummaryMissing: "Desaparecidos parseados",
    labsSummaryMatchable: "Desaparecidos comparables",
    labsSummaryLocated: "Localizados deduplicados",
    labsSummaryCandidates: "Coincidencias candidatas",
    labsSummaryHigh: "Coincidencias altas",
    labsSummaryMedium: "Coincidencias medias",
    labsScoreLabel: "Probabilidad sugerida",
    labsIdentityExact: "Cédula exacta",
    labsIdentityConflict: "Cédula en conflicto",
    labsIdentityMissing: "Sin cédula comparable",
    labsNameScore: "Similitud de nombre",
    labsAgeLabel: "Edad",
    labsLocationLabel: "Ubicación",
    labsHospitalLabel: "Hospital / recinto",
    labsConditionLabel: "Condición",
    labsSourceFileLabel: "Archivo fuente",
    labsContactsLabel: "Contactos",
    labsSourceLabel: "Fuente",
    labsSupportingSourcesTitle: "Fuentes donde también aparece",
    labsTopCandidateTitle: "Mejor candidato",
    labsOtherCandidatesTitle: "Otros candidatos",
    labsMissingPanelTitle: "Reporte de desaparecido",
    labsLocatedPanelTitle: "Registro de localizado",
    labsLocatedSourceLabel: "Ficha en Localizados",
    labsReasonsTitle: "Señales del score",
    labsOpenSourceLink: "Abrir fuente",
    labsNoValue: "No disponible"
  },
  en: {
    lang: "en",
    localeLabel: "English",
    alternateLocaleLabel: "Español",
    htmlTitle: "VeneHelp",
    siteDescription:
      "Public directory of platforms to search for and report people, see who's been located, and find emergency aid after the earthquake in Venezuela.",
    eyebrow: "Venezuela earthquake directory",
    heroTitle: "Where to find people and get help",
    heroPromise: "We don't take reports here; we help you choose the right site.",
    triageTitle: "Where do I start?",
    triageMissingQ: "Searching for or reporting a missing person?",
    triageMissingA: "Start with Missing people",
    triageLocatedQ: "Could they be in a hospital or already located?",
    triageLocatedA: "Check Located people",
    triageAidQ: "Need rescue, shelter, or aid?",
    triageAidA: "Check Aid & emergency",
    labsHomePrompt: "Want to review possible matches between missing-person reports and hospital lists?",
    labsHomeCta: "Open matching Labs",
    registryTitle: "Unified registry (beta)",
    registryIntro:
      "We show a primary counter and a provenance table from a consolidated public registry. This view is beta and currently uses a partial crawl of public pages while more adapters are added.",
    registryLoading: "Loading beta registry",
    registryLoadFailed: "Unable to load the beta registry.",
    registryEmpty: "No beta registry rows yet.",
    registryMissingLabel: "Missing",
    registryFoundLabel: "Found / safe",
    registryPreviewLabel: "Preview rows",
    registryPartialNote:
      "Preview sampled from {sampledPages} of {totalPages} public pages from {sourceName}.",
    registryFullNote:
      "Full view collected from {sourceName}.",
    registryNameColumn: "Name",
    registryStatusColumn: "Status",
    registryLocationColumn: "Location",
    registryReportedOnColumn: "Reported on",
    registryResultsLabel: "Visible rows",
    registryResultsShown: "{count} visible rows",
    registrySearchLabel: "Search the registry",
    registrySearchPlaceholder: "Name, location, or source",
    registryFilterLabel: "Status",
    registryAllStatuses: "All statuses",
    registryStatusMissing: "Missing",
    registryStatusSafe: "Safe",
    registryStatusFound: "Found",
    registryLinkLabel: "Open beta registry",
    registryPageTitle: "Beta registry | VeneHelp",
    registryPageEyebrow: "Beta registry",
    registryPageIntro:
      "Beta provenance table with search and status filters. The data is still partial and depends on public per-site adapters.",
    findSourceTitle: "Directory",
    searchLabel: "Search",
    searchPlaceholder: "Search by name, service, or tag",
    missingSectionTitle: "Missing people",
    missingSectionIntro: "Platforms to search for and report missing people after the earthquake.",
    missingSectionNote: "The counts are published by each platform and may include duplicate, unverified, or outdated entries, so they do not equal the real number of missing people.",
    locatedSectionTitle: "Located people",
    locatedSectionIntro: "Listings of people already located, such as hospital patients. Not for reporting missing people.",
    aidSectionTitle: "Aid & emergency",
    aidSectionIntro: "Platforms to coordinate rescue, shelter, damage, and other emergency resources. Not for searching or reporting missing people.",
    developerEyebrow: "Technical section",
    developerSectionTitle: "Developers",
    developerSectionIntro:
      "APIs, datasets, official damage maps, and open-source projects that are useful for integrations, agents, and technical analysis.",
    developerEmpty: "No technical resources are published in this version yet.",
    capSearch: "Public search",
    capReport: "Accepts reports",
    capFound: "Mark found / safe",
    checkedShort: "Checked",
    statReported: "reported",
    statFound: "found",
    statLocated: "located",
    statBySite: "per the site",
    localTimeNote: "local time",
    venezuelaTimeNote: "Venezuela time",
    filterLabel: "Show only",
    venehelpDatasetTitle: "VeneHelp public dataset",
    venehelpDatasetSummary:
      "JSON export of the VeneHelp directory for LLMs, search systems, and lightweight integrations.",
    openDataset: "Open dataset",
    openApi: "Open API",
    openSourceCode: "Open source code",
    loadingSources: "Loading sources",
    resultsShown: "Showing {count} of {total} platforms",
    noResults: "No resources match the current filters.",
    loadFailed: "Unable to load sources",
    loadFailedHelp: "Check that the generated JSON file exists and the site is being served from the docs folder.",
    openSource: "Open resource",
    details: "Details",
    directLinkPending: "Direct link pending",
    footer:
      "VeneHelp is a public directory of platforms for finding and reporting people and getting help after the earthquake in Venezuela. Last generated: {generatedAt}.",
    allSourcesEyebrow: "All sources",
    allSourcesTitle: "Resource directory",
    allSourcesIntro: "Each resource has a stable detail page plus a canonical per-language JSON export.",
    breadcrumbsSources: "Sources",
    metadataTitle: "Metadata",
    statusLabelDetail: "Status",
    operatorTypeLabelDetail: "Operator type",
    coverageLabelDetail: "Coverage",
    languageLabelDetail: "Language",
    requiresLoginLabel: "Requires login",
    acceptsReportsLabelDetail: "Accepts new reports",
    publicSearchLabelDetail: "Public search",
    reportFoundLabelDetail: "Can mark found / safe",
    servicesLabelDetail: "What it offers",
    publicContactLabelDetail: "Public contact",
    publicApiLabelDetail: "Public API",
    sourceCodeLabelDetail: "Source code",
    ownerLabelDetail: "Owner",
    crawlerPriorityLabel: "Crawler priority",
    lastCheckedLabel: "Last link check",
    notYetChecked: "Not checked",
    notesTitle: "Notes",
    tagsTitle: "Tags",
    techDetailsTitle: "Technical details",
    viewJson: "View JSON",
    languageNavLabel: "Language",
    sourceListTitle: "All Sources | VeneHelp",
    labsReviewTitle: "Visual review of possible matches",
    labsReviewIntro: "This page shows possible matches for human review. The percentage is heuristic: an exact ID match carries much more weight than name similarity.",
    labsMethodTitle: "How the score is calculated",
    labsMethodIntro: "The current formula does not use machine learning. It is a review heuristic: it combines strong and weak signals to suggest human priority.",
    labsMethodIdentityTitle: "1. ID comes first",
    labsMethodIdentityText: "If the ID matches exactly, the case moves close to the maximum. If the IDs conflict, the score drops even when the name looks similar.",
    labsMethodNameTitle: "2. Then the name",
    labsMethodNameText: "Without an ID, the main weight comes from normalized name similarity: exact, very close, strong, or moderate.",
    labsMethodContextTitle: "3. Age and location adjust",
    labsMethodContextText: "Age and location only adjust the result. An exact or nearby age adds a little; a large difference subtracts. Location adds a small boost and never replaces identity.",
    labsMethodRangesTitle: "How to read the percentages",
    labsMethodRangeHigh: "93–99%: high review priority",
    labsMethodRangeMedium: "80–92%: possible match",
    labsMethodRangeLow: "0–79%: weak or ambiguous signal",
    labsMethodReviewNote: "The percentage does not confirm identity on its own. Review the evidence shown on the card and, when available, verify the ID, age, hospital, and original source.",
    labsSummaryLoading: "Loading labs summary",
    labsMatchesLoading: "Loading candidate matches",
    labsMatchesFailed: "Unable to load labs datasets.",
    labsTableTitle: "Quick review table",
    labsTableNameHeader: "Missing person",
    labsTableSourcesHeader: "Matching sources",
    labsTableScoreHeader: "Suggested match",
    labsTableReviewHeader: "Review",
    labsTableOpenDetail: "Open details",
    labsMinScoreLabel: "Minimum score",
    labsAllScores: "All",
    labsHighOnly: "High only",
    labsMediumUp: "Medium or high",
    labsResultsLabel: "Visible matches",
    labsResultsShown: "{count} visible matches",
    labsNoMatches: "No candidate matches for the current filters.",
    labsSummaryMissing: "Parsed missing records",
    labsSummaryMatchable: "Matchable missing records",
    labsSummaryLocated: "Deduped located records",
    labsSummaryCandidates: "Candidate matches",
    labsSummaryHigh: "High-confidence matches",
    labsSummaryMedium: "Medium-confidence matches",
    labsScoreLabel: "Suggested probability",
    labsIdentityExact: "Exact ID match",
    labsIdentityConflict: "Conflicting ID",
    labsIdentityMissing: "No comparable ID",
    labsNameScore: "Name similarity",
    labsAgeLabel: "Age",
    labsLocationLabel: "Location",
    labsHospitalLabel: "Hospital / facility",
    labsConditionLabel: "Condition",
    labsSourceFileLabel: "Source file",
    labsContactsLabel: "Contacts",
    labsSourceLabel: "Source",
    labsSupportingSourcesTitle: "Matching sources",
    labsTopCandidateTitle: "Top candidate",
    labsOtherCandidatesTitle: "Other candidates",
    labsMissingPanelTitle: "Missing-person report",
    labsLocatedPanelTitle: "Located-person record",
    labsLocatedSourceLabel: "Localizados record",
    labsReasonsTitle: "Score signals",
    labsOpenSourceLink: "Open source",
    labsNoValue: "Not available"
  }
};

const appJs = `
const config = window.VENEHELP_CONFIG || {};
const messages = config.messages || {};
const basePath = config.basePath || "";
const assetVersion = config.assetVersion ? "?v=" + encodeURIComponent(config.assetVersion) : "";

const state = {
  sources: [],
  query: "",
  filters: { public_search: false, accepts_new_reports: false, report_found: false }
};

const sectionEls = Array.from(document.querySelectorAll("[data-section-list]"));
const registryCountEl = document.querySelector("[data-results-count]");
const developerListEl = document.querySelector("[data-developer-list]");
const searchEl = document.querySelector("[data-search]");
const sectionOrder = ["missing", "located", "aid", "developer"];

const interpolate = (template, values = {}) =>
  String(template || "").replace(/\\{(\\w+)\\}/g, (_, key) => String(values[key] ?? ""));

const normalize = (value) => String(value || "").toLowerCase();

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const matchesFilters = (source, filters) =>
  Object.keys(filters).every((key) => !filters[key] || Boolean(source[key]));

const matchesQuery = (source, query) => {
  if (!query) return true;
  const haystack = [
    source.name,
    source.summary,
    source.category_label,
    source.purpose_label,
    source.status_label,
    source.operator_type_label,
    ...(source.service_labels || []),
    ...(source.tags || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
};

const renderBadge = (label, className = "pill") =>
  '<span class="' + className + '">' + label + "</span>";

const renderCapability = (on, label) =>
  '<span class="cap ' + (on ? 'cap--on' : 'cap--off') + '">' +
  (on ? '✓ ' : '✕ ') + escapeHtml(label) + '</span>';

const formatNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  try {
    return n.toLocaleString(messages.lang === 'es' ? 'es-VE' : 'en-US');
  } catch (error) {
    return String(n);
  }
};

const formatAsOf = (value) => {
  if (!value) return '';
  // Date-only stamps (YYYY-MM-DD) have no time component to localize.
  if (value.length <= 10) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  try {
    // No timeZone option -> the browser renders it in the viewer's local time.
    return d.toLocaleString(messages.lang === 'es' ? 'es-VE' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (error) {
    return value;
  }
};

const renderStats = (stats) => {
  if (!stats) return '';
  const parts = [];
  if (stats.reported != null) parts.push('<strong>' + formatNumber(stats.reported) + '</strong> ' + escapeHtml(messages.statReported));
  if (stats.found != null) parts.push('<strong>' + formatNumber(stats.found) + '</strong> ' + escapeHtml(messages.statFound));
  if (stats.located != null) parts.push('<strong>' + formatNumber(stats.located) + '</strong> ' + escapeHtml(messages.statLocated));
  if (!parts.length) return '';
  const asOfText = stats.as_of
    ? ' · ' + formatAsOf(stats.as_of) + (stats.as_of.length > 10 ? ' (' + messages.localTimeNote + ')' : '')
    : '';
  const attribution = escapeHtml(messages.statBySite) + escapeHtml(asOfText);
  return '<p class="source-stats">' + parts.join(' · ') + ' <span class="source-stats-note">— ' + attribution + '</span></p>';
};

const renderRegistryCard = (source) => {
  const detailsPath = basePath + '/sources/' + source.slug + '/';
  const titleHtml = source.url
    ? '<h3><a href="' + source.url + '" target="_blank" rel="noreferrer">' + escapeHtml(source.name) + '</a></h3>'
    : '<h3><a href="' + detailsPath + '">' + escapeHtml(source.name) + '</a></h3>';
  const useWhenHtml = source.use_when_label
    ? '<p class="source-usewhen">' + escapeHtml(source.use_when_label) + '</p>'
    : '';
  const warningHtml = source.warning_label
    ? '<p class="source-warning">' + escapeHtml(source.warning_label) + '</p>'
    : '';
  const capHtml =
    renderCapability(source.public_search, messages.capSearch) +
    renderCapability(source.accepts_new_reports, messages.capReport) +
    renderCapability(source.report_found, messages.capFound);
  const trustHtml = '<p class="small source-trust">' +
    escapeHtml(source.owner_label || '') +
    (source.last_checked_at ? ' · ' + escapeHtml(messages.checkedShort) + ' ' + escapeHtml(source.last_checked_at) : '') +
    '</p>';

  return [
    '<article class="source-card">',
    titleHtml,
    useWhenHtml,
    warningHtml,
    '<p>' + escapeHtml(source.summary) + '</p>',
    renderStats(source.report_stats),
    '<div class="cap-row">' + capHtml + '</div>',
    trustHtml,
    '<footer>',
    '<a class="detail-link" href="' + detailsPath + '">' + messages.details + ' →</a>',
    '</footer>',
    '</article>'
  ].join("");
};

const buildDeveloperResources = (sources) => {
  const datasetPath = basePath + "/data/sources.json" + assetVersion;
  const items = [
    {
      key: "venehelp-dataset",
      title: messages.venehelpDatasetTitle,
      summary: messages.venehelpDatasetSummary,
      links: [
        { href: datasetPath, label: messages.openDataset, primary: true }
      ]
    }
  ];

  sources
    .filter((source) => source.api_url || source.source_code_url || source.section === "developer")
    .forEach((source) => {
      const links = [];
      if (source.api_url) {
        links.push({ href: source.api_url, label: messages.openApi, primary: true, external: true });
      }
      if (source.url && source.url !== source.api_url && source.url !== source.source_code_url) {
        links.push({ href: source.url, label: messages.openSource, primary: !source.api_url, external: true });
      }
      if (source.source_code_url) {
        links.push({ href: source.source_code_url, label: messages.openSourceCode, secondary: true, external: true });
      }
      if (!source.api_url && !source.source_code_url && source.url) {
        links.push({ href: source.url, label: messages.openSource, primary: true, external: true });
      }
      links.push({ href: basePath + '/sources/' + source.slug + '/', label: messages.details, secondary: true, external: false });

      items.push({
        key: source.slug,
        title: source.name,
        summary: source.summary,
        services: source.service_labels || [],
        links
      });
    });

  return items;
};

const renderDeveloperCard = (resource) => {
  const serviceHtml = (resource.services || [])
    .slice(0, 4)
    .map((label) => renderBadge(label))
    .join("");
  const linksHtml = (resource.links || [])
    .map((link) => {
      const className = link.secondary ? "button secondary" : "button";
      const targetAttrs = link.external ? ' target="_blank" rel="noreferrer"' : '';
      return '<a class="' + className + '" href="' + escapeHtml(link.href) + '"' + targetAttrs + '>' + escapeHtml(link.label) + '</a>';
    })
    .join("");

  return [
    '<article class="source-card">',
    '<h3>' + escapeHtml(resource.title) + '</h3>',
    '<p>' + escapeHtml(resource.summary) + '</p>',
    serviceHtml ? '<div class="meta-row">' + serviceHtml + '</div>' : '',
    '<footer>' + linksHtml + '</footer>',
    '</article>'
  ].join("");
};

const render = () => {
  const humanSources = state.sources.filter((source) => (source.section || "missing") !== "developer");
  const filteredHuman = humanSources.filter(
    (source) => matchesQuery(source, state.query) && matchesFilters(source, state.filters)
  );

  if (registryCountEl) {
    registryCountEl.textContent = interpolate(messages.resultsShown, {
      count: filteredHuman.length,
      total: humanSources.length
    });
  }

  sectionEls.forEach((el) => {
    const key = el.getAttribute("data-section-list");
    const inSection = filteredHuman.filter((source) => (source.section || "missing") === key);
    el.innerHTML = inSection.map(renderRegistryCard).join("") || '<p class="small">' + messages.noResults + '</p>';
  });

  if (developerListEl) {
    const devSources = state.sources.filter((source) => matchesQuery(source, state.query));
    const developerResources = buildDeveloperResources(devSources);
    developerListEl.innerHTML = developerResources.map(renderDeveloperCard).join("") || '<p class="small">' + messages.developerEmpty + '</p>';
  }
};

const load = async () => {
  if (!sectionEls.length && !registryCountEl && !developerListEl) {
    return;
  }

  try {
    const response = await fetch(basePath + "/data/sources.json" + assetVersion);
    const sources = await response.json();
    state.sources = sources
      .slice()
      .sort((a, b) => {
        const sectionDiff = sectionOrder.indexOf(a.section || "missing") - sectionOrder.indexOf(b.section || "missing");
        if (sectionDiff !== 0) return sectionDiff;
        return (a.crawler_priority || 99) - (b.crawler_priority || 99);
      });
    render();
  } catch (error) {
    if (registryCountEl) {
      registryCountEl.textContent = messages.loadFailed;
    }
    sectionEls.forEach((el) => {
      el.innerHTML = '<p class="small">' + messages.loadFailedHelp + '</p>';
    });
    if (developerListEl) {
      developerListEl.innerHTML = '<p class="small">' + messages.loadFailedHelp + '</p>';
    }
  }
};

if (searchEl) {
  searchEl.addEventListener("input", (event) => {
    state.query = normalize(event.target.value.trim());
    render();
  });
}

Array.from(document.querySelectorAll("[data-filter]")).forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.getAttribute("data-filter");
    state.filters[key] = !state.filters[key];
    button.setAttribute("aria-pressed", String(state.filters[key]));
    button.classList.toggle("filter-btn--active", state.filters[key]);
    render();
  });
});

load();

const labsSummaryEl = document.querySelector("[data-labs-summary]");
const labsTableEl = document.querySelector("[data-labs-table]");
const labsListEl = document.querySelector("[data-labs-list]");
const labsResultsEl = document.querySelector("[data-labs-results]");
const labsScoreFilterEl = document.querySelector("[data-labs-score-filter]");
const labsDataBasePath = config.labsDataBasePath || (basePath + "/labs/data");

const labsState = {
  summary: null,
  groups: [],
  filter: "all"
};

const labsConfidenceThreshold = (filter) => {
  if (filter === "high") return 0.93;
  if (filter === "medium") return 0.8;
  return 0;
};

const labsConfidenceLabel = (candidate) => {
  const score = Number(candidate && candidate.score);
  if (score >= 0.93) return "high";
  if (score >= 0.8) return "medium";
  return "low";
};

const labsValue = (value) =>
  value === null || value === undefined || value === "" ? escapeHtml(messages.labsNoValue) : escapeHtml(String(value));

const labsAnchorId = (group) => {
  const raw = group && group.missing && group.missing.id ? group.missing.id : "match";
  return "match-" + String(raw).replace(/[^a-z0-9_-]/gi, "-");
};

const labsMatchedSourceLabels = (group) => {
  const labels = ["Localizados Venezuela"];
  if ((group.hospitalesVenezuelaMatches || []).length) {
    labels.push("Hospitales en Venezuela");
  }
  return labels;
};

const labsRenderSummary = (summary) => {
  if (!labsSummaryEl) return;
  if (!summary) {
    labsSummaryEl.innerHTML = '<div class="labs-summary-stat"><strong>…</strong><span>' + escapeHtml(messages.labsSummaryLoading) + '</span></div>';
    return;
  }

  const stats = [
    { value: summary.missing.totalRecords, label: messages.labsSummaryMissing },
    { value: summary.missing.matchableRecords, label: messages.labsSummaryMatchable },
    { value: summary.sources.localizados.dedupedRows, label: messages.labsSummaryLocated },
    { value: summary.matching.candidatePairs, label: messages.labsSummaryCandidates },
    { value: summary.matching.highConfidence, label: messages.labsSummaryHigh },
    { value: summary.matching.mediumConfidence, label: messages.labsSummaryMedium }
  ];

  labsSummaryEl.innerHTML = stats
    .map((item) => '<div class="labs-summary-stat"><strong>' + formatNumber(item.value) + '</strong><span>' + escapeHtml(item.label) + '</span></div>')
    .join("");
};

const labsRenderMatchCard = (group) => {
  const top = (group.candidates || [])[0];
  if (!top) return "";

  const confidence = labsConfidenceLabel(top);
  const scorePercent = top.scorePercent != null ? top.scorePercent : Math.round((Number(top.score) || 0) * 100);
  const identityLabel = top.identitySignal === "exact"
    ? messages.labsIdentityExact
    : top.identitySignal === "conflict"
      ? messages.labsIdentityConflict
      : messages.labsIdentityMissing;
  const nameScorePercent = Math.round((Number(top.nameScore) || 0) * 100);
  const locationScorePercent = Math.round((Number(top.locationScore) || 0) * 100);
  const locationText = [top.locatedHospital, top.locatedAddress].filter(Boolean).join(" · ");
  const otherCandidates = (group.candidates || []).slice(1);
  const supportingSources = (group.supportingSources || []);

  return [
    '<article class="labs-match-card" id="' + escapeHtml(labsAnchorId(group)) + '">',
    '<div class="labs-match-head">',
    '<div>',
    '<h3>' + escapeHtml(group.missing.name || group.missing.rawDescription || messages.labsNoValue) + '</h3>',
    '<p class="small">' + escapeHtml(messages.labsTopCandidateTitle) + ': ' + escapeHtml(top.locatedName || messages.labsNoValue) + '</p>',
    '</div>',
    '<div class="labs-score" data-confidence="' + confidence + '">',
    '<span class="labs-score-value">' + escapeHtml(String(scorePercent)) + '%</span>',
    '<span class="labs-score-label">' + escapeHtml(messages.labsScoreLabel) + '</span>',
    '</div>',
    '</div>',
    '<div class="labs-evidence-list">',
    '<span class="labs-evidence-pill">' + escapeHtml(identityLabel) + '</span>',
    '<span class="labs-evidence-pill">' + escapeHtml(messages.labsNameScore) + ': ' + escapeHtml(String(nameScorePercent)) + '%</span>',
    (top.ageDiff !== null && top.ageDiff !== undefined ? '<span class="labs-evidence-pill">' + escapeHtml(messages.labsAgeLabel) + ': ' + labsValue(group.missing.age) + ' / ' + labsValue(top.locatedAge) + '</span>' : ''),
    (locationScorePercent > 0 ? '<span class="labs-evidence-pill">' + escapeHtml(messages.labsLocationLabel) + ': ' + escapeHtml(String(locationScorePercent)) + '%</span>' : ''),
    '</div>',
    '<div class="labs-review-grid">',
    '<section class="labs-review-panel">',
    '<h3>' + escapeHtml(messages.labsMissingPanelTitle) + '</h3>',
    '<p>' + escapeHtml(group.missing.rawDescription || group.missing.name || messages.labsNoValue) + '</p>',
    '<dl>',
    '<div><dt>' + escapeHtml(messages.labsAgeLabel) + '</dt><dd>' + labsValue(group.missing.age) + '</dd></div>',
    '<div><dt>Cédula</dt><dd>' + labsValue(group.missing.cedula) + '</dd></div>',
    '<div><dt>' + escapeHtml(messages.labsContactsLabel) + '</dt><dd>' + ((group.missing.contacts || []).length ? escapeHtml(group.missing.contacts.join(" · ")) : escapeHtml(messages.labsNoValue)) + '</dd></div>',
    '<div><dt>' + escapeHtml(messages.labsSourceLabel) + '</dt><dd>' + (group.missing.sourceUrl ? '<a class="detail-link" href="' + escapeHtml(group.missing.sourceUrl) + '" target="_blank" rel="noreferrer">' + escapeHtml(messages.labsOpenSourceLink) + '</a>' : escapeHtml(messages.labsNoValue)) + '</dd></div>',
    '</dl>',
    '</section>',
    '<section class="labs-review-panel">',
    '<h3>' + escapeHtml(messages.labsLocatedPanelTitle) + '</h3>',
    '<p>' + escapeHtml(top.locatedName || messages.labsNoValue) + '</p>',
    '<dl>',
    '<div><dt>' + escapeHtml(messages.labsAgeLabel) + '</dt><dd>' + labsValue(top.locatedAge) + '</dd></div>',
    '<div><dt>Cédula</dt><dd>' + labsValue(top.locatedCedula) + '</dd></div>',
    '<div><dt>' + escapeHtml(messages.labsHospitalLabel) + '</dt><dd>' + escapeHtml(locationText || messages.labsNoValue) + '</dd></div>',
    '<div><dt>' + escapeHtml(messages.labsConditionLabel) + '</dt><dd>' + labsValue(top.locatedCondition) + '</dd></div>',
    '<div><dt>' + escapeHtml(messages.labsSourceFileLabel) + '</dt><dd>' + labsValue(top.locatedSourceFile) + '</dd></div>',
    '<div><dt>' + escapeHtml(messages.labsLocatedSourceLabel) + '</dt><dd>' + (top.locatedSourceUrl ? '<a class="detail-link" href="' + escapeHtml(top.locatedSourceUrl) + '" target="_blank" rel="noreferrer">' + escapeHtml(messages.labsOpenSourceLink) + '</a>' : escapeHtml(messages.labsNoValue)) + '</dd></div>',
    '<div><dt>' + escapeHtml(messages.labsReasonsTitle) + '</dt><dd>' + escapeHtml((top.reasons || []).join(" · ") || messages.labsNoValue) + '</dd></div>',
    '</dl>',
    '</section>',
    '</div>',
    (supportingSources.length
      ? '<div class="labs-candidate-list"><h4>' + escapeHtml(messages.labsSupportingSourcesTitle) + '</h4>' +
          supportingSources.map((source) =>
            '<div class="labs-candidate-item">' +
              '<strong>' + escapeHtml(source.label || messages.labsNoValue) + '</strong>' +
              (source.note ? '<p class="small labs-source-note">' + escapeHtml(source.note) + '</p>' : '') +
              (source.url ? '<a class="detail-link" href="' + escapeHtml(source.url) + '" target="_blank" rel="noreferrer">' + escapeHtml(messages.labsOpenSourceLink) + '</a>' : '') +
            '</div>'
          ).join("") +
        '</div>'
      : ''),
    (otherCandidates.length
      ? '<div class="labs-candidate-list"><h4>' + escapeHtml(messages.labsOtherCandidatesTitle) + '</h4>' +
          otherCandidates.map((candidate) => '<div class="labs-candidate-item"><strong>' + escapeHtml(candidate.locatedName || messages.labsNoValue) + '</strong> · ' + escapeHtml(String(candidate.scorePercent != null ? candidate.scorePercent : Math.round((Number(candidate.score) || 0) * 100))) + '% · ' + escapeHtml(candidate.locatedHospital || messages.labsNoValue) + '</div>').join("") +
        '</div>'
      : ''),
    '</article>'
  ].join("");
};

const labsRenderTable = (groups) => {
  if (!labsTableEl) return;
  if (!groups.length) {
    labsTableEl.innerHTML = '<p class="labs-empty">' + escapeHtml(messages.labsNoMatches) + '</p>';
    return;
  }

  labsTableEl.innerHTML = [
    '<h3>' + escapeHtml(messages.labsTableTitle) + '</h3>',
    '<div class="labs-table-wrap">',
    '<table class="labs-match-table">',
    '<thead><tr>',
    '<th>' + escapeHtml(messages.labsTableNameHeader) + '</th>',
    '<th>' + escapeHtml(messages.labsTableSourcesHeader) + '</th>',
    '<th>' + escapeHtml(messages.labsTableScoreHeader) + '</th>',
    '<th>' + escapeHtml(messages.labsTableReviewHeader) + '</th>',
    '</tr></thead>',
    '<tbody>',
    groups.map((group) => {
      const top = (group.candidates || [])[0];
      const scorePercent = top && top.scorePercent != null ? top.scorePercent : Math.round((Number(top && top.score) || 0) * 100);
      const sources = labsMatchedSourceLabels(group);
      return [
        '<tr>',
        '<td><strong>' + escapeHtml(group.missing.name || group.missing.rawDescription || messages.labsNoValue) + '</strong></td>',
        '<td><div class="labs-table-sources">' + sources.map((label) => '<span class="labs-evidence-pill">' + escapeHtml(label) + '</span>').join("") + '</div></td>',
        '<td><strong>' + escapeHtml(String(scorePercent)) + '%</strong></td>',
        '<td><a class="detail-link labs-table-link" href="#' + escapeHtml(labsAnchorId(group)) + '">' + escapeHtml(messages.labsTableOpenDetail) + '</a></td>',
        '</tr>'
      ].join("");
    }).join(""),
    '</tbody>',
    '</table>',
    '</div>'
  ].join("");
};

const labsRenderMatches = () => {
  if (!labsListEl || !labsResultsEl) return;
  const threshold = labsConfidenceThreshold(labsState.filter);
  const visible = (labsState.groups || []).filter((group) => {
    const top = (group.candidates || [])[0];
    return top && (Number(top.score) || 0) >= threshold;
  });
  labsResultsEl.textContent = interpolate(messages.labsResultsShown, { count: visible.length });
  labsRenderTable(visible);
  labsListEl.innerHTML = visible.length
    ? visible.map(labsRenderMatchCard).join("")
    : '<p class="labs-empty">' + escapeHtml(messages.labsNoMatches) + '</p>';
};

const loadLabs = async () => {
  if (!labsSummaryEl && !labsListEl) return;
  try {
    const [summaryResponse, candidatesResponse] = await Promise.all([
      fetch(labsDataBasePath + '/summary.json' + assetVersion),
      fetch(labsDataBasePath + '/candidates.json' + assetVersion)
    ]);
    const summary = await summaryResponse.json();
    const candidates = await candidatesResponse.json();
    labsState.summary = summary;
    labsState.groups = candidates.results || [];
    labsRenderSummary(summary);
    labsRenderMatches();
  } catch (error) {
    if (labsSummaryEl) {
      labsSummaryEl.innerHTML = '<div class="labs-summary-stat"><strong>!</strong><span>' + escapeHtml(messages.labsMatchesFailed) + '</span></div>';
    }
    if (labsResultsEl) {
      labsResultsEl.textContent = messages.labsMatchesFailed;
    }
    if (labsListEl) {
      labsListEl.innerHTML = '<p class="labs-empty">' + escapeHtml(messages.labsMatchesFailed) + '</p>';
    }
  }
};

if (labsScoreFilterEl) {
  labsScoreFilterEl.addEventListener('change', (event) => {
    labsState.filter = event.target.value || 'all';
    labsRenderMatches();
  });
}

loadLabs();
`.trimStart();

const ensureDir = async (target) => {
  await fs.mkdir(target, { recursive: true });
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const interpolate = (template, values = {}) =>
  String(template || "").replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

const valueOrFallback = (value, fallback) =>
  value === null || value === undefined || value === "" ? fallback : escapeHtml(value);

const renderCapabilityStatic = (on, label) =>
  `<span class="cap ${on ? "cap--on" : "cap--off"}">${on ? "✓ " : "✕ "}${escapeHtml(label)}</span>`;

const formatNumberStatic = (value, locale) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString(locale === "es" ? "es-VE" : "en-US");
};

const formatAsOfStatic = (value, locale) => {
  if (!value) return "";
  // Date-only stamps (YYYY-MM-DD) have no time component to localize.
  if (value.length <= 10) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    // Static HTML can't know the viewer's clock, so default to Venezuela time.
    return d.toLocaleString(locale === "es" ? "es-VE" : "en-US", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "America/Caracas"
    });
  } catch (error) {
    return value;
  }
};

const renderStatsStatic = (stats, locale, copy) => {
  if (!stats) return "";
  const parts = [];
  if (stats.reported != null) parts.push(`<strong>${formatNumberStatic(stats.reported, locale)}</strong> ${escapeHtml(copy.statReported)}`);
  if (stats.found != null) parts.push(`<strong>${formatNumberStatic(stats.found, locale)}</strong> ${escapeHtml(copy.statFound)}`);
  if (stats.located != null) parts.push(`<strong>${formatNumberStatic(stats.located, locale)}</strong> ${escapeHtml(copy.statLocated)}`);
  if (!parts.length) return "";
  const asOfText = stats.as_of
    ? ` · ${formatAsOfStatic(stats.as_of, locale)}${stats.as_of.length > 10 ? ` (${copy.venezuelaTimeNote})` : ""}`
    : "";
  const attribution = `${escapeHtml(copy.statBySite)}${escapeHtml(asOfText)}`;
  return `<p class="source-stats" style="margin-top:0.85rem">${parts.join(" · ")} <span class="source-stats-note">— ${attribution}</span></p>`;
};

const renderDefinitionRows = (rows) =>
  rows
    .filter((row) => row.value !== null && row.value !== undefined && row.value !== "")
    .map((row) => `<div><dt>${escapeHtml(row.label)}</dt><dd>${row.html || escapeHtml(row.value)}</dd></div>`)
    .join("");

const renderNotes = (notes = []) =>
  notes.length ? `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>` : "";

const translateMappedValue = (dictionary, value, locale) => dictionary[value]?.[locale] || value;
const booleanLabel = (value, locale, copy) => {
  if (value === null || value === undefined) {
    return copy.notYetChecked;
  }

  return value ? (locale === "es" ? "Sí" : "Yes") : locale === "es" ? "No" : "No";
};

const localizeSource = (source, locale) => {
  const sourceCopy = locale === "es" ? spanishSourceCopy[source.slug] : null;
  const copy = localeCopy[locale];

  return {
    ...source,
    summary: sourceCopy?.summary || source.summary,
    notes: sourceCopy?.notes || source.notes,
    use_when_label: source.use_when?.[locale] || source.use_when?.es || "",
    warning_label: source.warning?.[locale] || source.warning?.es || "",
    section: source.section || "missing",
    category_label: translateMappedValue(categoryLabels, source.category, locale),
    purpose_label: translateMappedValue(purposeLabels, source.purpose, locale),
    status_label: translateMappedValue(statusLabels, source.status, locale),
    operator_type_label: translateMappedValue(operatorTypeLabels, source.operator_type, locale),
    coverage_label: translateMappedValue(coverageLabels, source.coverage, locale),
    language_label:
      source.language === "es"
        ? locale === "es"
          ? "Español"
          : "Spanish"
        : source.language === "en"
          ? locale === "es"
            ? "Inglés"
            : "English"
          : source.language,
    requires_login_label:
      source.requires_login === null
        ? copy.notYetChecked
        : source.requires_login
          ? locale === "es"
            ? "Sí"
            : "Yes"
          : locale === "es"
            ? "No"
            : "No",
    accepts_reports_label_value: booleanLabel(source.accepts_new_reports, locale, copy),
    public_search_label_value: booleanLabel(source.public_search, locale, copy),
    report_found_label_value: booleanLabel(source.report_found, locale, copy),
    owner_label: translateMappedValue(ownerLabels, source.owner, locale),
    service_labels: (source.services || []).map((service) => translateMappedValue(serviceLabels, service, locale)),
    tags: (source.tags || []).map((tag) => translateMappedValue(tagLabels, tag, locale)),
    last_checked_label: source.last_checked_at || copy.notYetChecked,
    public_contact_label: source.public_contact || copy.notYetChecked,
    api_url_label: source.api_url || copy.notYetChecked,
    source_code_url_label: source.source_code_url || copy.notYetChecked
  };
};

const localizedSources = Object.fromEntries(
  supportedLocales.map((locale) => [locale, rawSources.map((source) => localizeSource(source, locale))])
);

const localizeRegistry = (registry, locale) => {
  const copy = localeCopy[locale];

  return {
    ...registry,
    records: (registry.records || []).map((record) => ({
      ...record,
      status_label:
        record.status === "found"
          ? copy.registryStatusFound
          : record.status === "safe"
            ? copy.registryStatusSafe
            : copy.registryStatusMissing
    }))
  };
};

const localizedRegistry = Object.fromEntries(
  supportedLocales.map((locale) => [locale, localizeRegistry(rawRegistry, locale)])
);

const renderAlternateLinks = (pathname) =>
  [
    ...supportedLocales.map(
      (locale) => `<link rel="alternate" hreflang="${locale}" href="${absoluteLocaleUrl(locale, pathname)}">`
    ),
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl("/")}">`
  ].join("\n    ");

const renderRootAlternateLinks = () =>
  [
    `<link rel="alternate" hreflang="es" href="${absoluteUrl("/")}">`,
    `<link rel="alternate" hreflang="en" href="${absoluteLocaleUrl("en", "/")}">`,
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl("/")}">`
  ].join("\n    ");

const renderRootPathAlternateLinks = (pathname) =>
  [
    `<link rel="alternate" hreflang="es" href="${absoluteUrl(pathname)}">`,
    `<link rel="alternate" hreflang="en" href="${absoluteLocaleUrl("en", pathname)}">`,
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl(pathname)}">`
  ].join("\n    ");

const renderCloudflareAnalyticsSnippet = () => {
  if (!cloudflareAnalyticsToken) {
    return "";
  }

  const beaconConfig = escapeHtml(JSON.stringify({ token: cloudflareAnalyticsToken }));
  return `    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${beaconConfig}'></script>\n`;
};

const renderGoogleAnalyticsSnippet = () => {
  if (!googleAnalyticsMeasurementId) {
    return "";
  }

  const measurementId = JSON.stringify(googleAnalyticsMeasurementId);
  const encodedMeasurementId = encodeURIComponent(googleAnalyticsMeasurementId);

  return `    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${encodedMeasurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${measurementId});
    </script>
`;
};

const withAssetVersion = (assetPath) => `${withSitePath(assetPath)}?v=${encodeURIComponent(assetVersion)}`;

const renderHead = ({ lang, title, description, canonical, alternates }) => `  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    ${alternates}
    <link rel="stylesheet" href="${withAssetVersion("/styles.css")}">
${renderGoogleAnalyticsSnippet()}  </head>`;

const renderLanguageSwitcher = (locale, pathname, { rootDefault = false } = {}) => {
  const copy = localeCopy[locale];

  return `<nav class="language-switcher" aria-label="${escapeHtml(copy.languageNavLabel)}">
    ${supportedLocales
      .map((candidate) => {
        const label = candidate === "es" ? "Español" : "English";
        const href = rootDefault && candidate === "es" && pathname === "/" ? withSitePath("/") : localePath(candidate, pathname);
        const current = candidate === locale ? ' aria-current="page"' : "";
        return `<a href="${href}"${current}>${label}</a>`;
      })
      .join("")}
  </nav>`;
};

const renderPageTopbar = (locale, pathname = "/", options = {}) => `<div class="topbar">
  <a class="brand-link" href="${options.rootDefault ? withSitePath("/") : localePath(locale, "/")}">VeneHelp</a>
  ${renderLanguageSwitcher(locale, pathname, options)}
</div>`;

const renderLocaleIndexHtml = (locale, options = {}) => {
  const copy = localeCopy[locale];
  const canonical = options.canonical || absoluteLocaleUrl(locale, "/");
  const alternates = options.alternates || renderAlternateLinks("/");
  const appBasePath = options.appBasePath || localeBasePath(locale);

  return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}">
${renderHead({
  lang: copy.lang,
  title: copy.htmlTitle,
  description: copy.siteDescription,
  canonical,
  alternates
})}
  <body>
    <div class="flag-bar" aria-hidden="true"><span></span><span></span><span></span></div>
    <main>
      <section class="hero">
        <div class="shell">
          ${renderPageTopbar(locale, "/", options)}
          <div class="hero-grid">
            <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
            <h1>${escapeHtml(copy.heroTitle)}</h1>
            <p class="hero-promise">${escapeHtml(copy.heroPromise)}</p>
            <div class="page-links">
              <a class="button secondary" href="${locale === "es" && options.rootDefault ? withSitePath("/labs/") : localePath(locale, "/labs/")}">${escapeHtml(copy.labsHomeCta)}</a>
              <span class="small">${escapeHtml(copy.labsHomePrompt)}</span>
            </div>
          </div>
          <div class="triage">
            <h2 class="triage-title">${escapeHtml(copy.triageTitle)}</h2>
            <div class="route-grid">
              <a class="route-card" href="#section-missing">
                <p class="route-q">${escapeHtml(copy.triageMissingQ)}</p>
                <p class="route-a">${escapeHtml(copy.triageMissingA)} &rarr;</p>
              </a>
              <a class="route-card" href="#section-located">
                <p class="route-q">${escapeHtml(copy.triageLocatedQ)}</p>
                <p class="route-a">${escapeHtml(copy.triageLocatedA)} &rarr;</p>
              </a>
              <a class="route-card" href="#section-aid">
                <p class="route-q">${escapeHtml(copy.triageAidQ)}</p>
                <p class="route-a">${escapeHtml(copy.triageAidA)} &rarr;</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell panel" id="directorio">
          <h2>${escapeHtml(copy.findSourceTitle)}</h2>
          <div class="controls">
            <div class="field">
              <label for="search">${escapeHtml(copy.searchLabel)}</label>
              <input id="search" type="search" placeholder="${escapeHtml(copy.searchPlaceholder)}" data-search>
            </div>
          </div>
          <div class="filters" role="group" aria-label="${escapeHtml(copy.filterLabel)}">
            <span class="filters-label">${escapeHtml(copy.filterLabel)}</span>
            <button type="button" class="filter-btn" data-filter="public_search" aria-pressed="false">${escapeHtml(copy.capSearch)}</button>
            <button type="button" class="filter-btn" data-filter="accepts_new_reports" aria-pressed="false">${escapeHtml(copy.capReport)}</button>
            <button type="button" class="filter-btn" data-filter="report_found" aria-pressed="false">${escapeHtml(copy.capFound)}</button>
          </div>
          <p class="results-count" data-results-count>${escapeHtml(copy.loadingSources)}</p>
          <div class="directory-sections">
            <section class="directory-block" id="section-missing">
              <h3>${escapeHtml(copy.missingSectionTitle)}</h3>
              <p class="small">${escapeHtml(copy.missingSectionIntro)}</p>
              <p class="section-note">${escapeHtml(copy.missingSectionNote)}</p>
              <div class="source-list" data-section-list="missing"></div>
            </section>
            <section class="directory-block" id="section-located">
              <h3>${escapeHtml(copy.locatedSectionTitle)}</h3>
              <p class="small">${escapeHtml(copy.locatedSectionIntro)}</p>
              <div class="source-list" data-section-list="located"></div>
            </section>
            <section class="directory-block" id="section-aid">
              <h3>${escapeHtml(copy.aidSectionTitle)}</h3>
              <p class="small">${escapeHtml(copy.aidSectionIntro)}</p>
              <div class="source-list" data-section-list="aid"></div>
            </section>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell">
          <div class="directory-developers">
            <p class="eyebrow developer-eyebrow">${escapeHtml(copy.developerEyebrow)}</p>
            <h2>${escapeHtml(copy.developerSectionTitle)}</h2>
            <p class="page-intro">${escapeHtml(copy.developerSectionIntro)}</p>
            <div class="page-links" style="margin-top:1rem">
              <a class="button secondary" href="${locale === "es" && options.rootDefault ? withSitePath("/labs/") : localePath(locale, "/labs/")}">Labs</a>
            </div>
            <div class="source-list" data-developer-list></div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="shell">
        <p>${escapeHtml(interpolate(copy.footer, { generatedAt }))}</p>
      </div>
    </footer>
${renderCloudflareAnalyticsSnippet()}    <script>window.VENEHELP_CONFIG = ${JSON.stringify({ basePath: appBasePath, assetVersion, messages: copy })};</script>
    <script src="${withAssetVersion("/app.js")}" defer></script>
  </body>
</html>`;
};

const renderRootIndexHtml = () =>
  renderLocaleIndexHtml("es", {
    canonical: absoluteUrl("/"),
    alternates: renderRootAlternateLinks(),
    appBasePath: localeBasePath("es"),
    rootDefault: true
  });

const renderLabsPageHtml = (locale, options = {}) => {
  const copy = localeCopy[locale];
  const canonical = options.canonical || absoluteLabsUrl(locale);
  const alternates = options.alternates || renderAlternateLinks("/labs/");

  const labsSources = [
    {
      title: "KoboToolbox · TerremotoVE",
      url: "https://kf.kobotoolbox.org/api/v2/assets/a8XWDsdUcpBzXGtgQmiiro/data.json",
      text:
        locale === "es"
          ? "Feed público JSON con reportes de personas desaparecidas, familias desaparecidas, personas rescatadas y eventos relacionados."
          : "Public JSON feed with reports of missing people, missing families, rescued people, and related events."
    },
    {
      title: "Localizados Venezuela API",
      url: "https://localizadosvenezuela.com/api",
      text:
        locale === "es"
          ? "API pública de solo lectura con personas localizadas en hospitales y otros recintos."
          : "Public read-only API with people located in hospitals and other facilities."
    }
  ];

  const sections =
    locale === "es"
      ? {
          eyebrow: "Labs",
          title: "Laboratorio de matching",
          intro:
            "Este espacio separa el trabajo experimental del directorio principal. Aquí vamos a probar el pipeline de costo cero para cruzar reportes públicos de personas desaparecidas con listados públicos de personas localizadas.",
          statusTitle: "Versión inicial",
          statusText:
            "Empezamos sin backend pagado: GitHub Actions para sincronizar fuentes, archivos JSON estáticos para publicar resultados y revisión manual antes de confirmar cualquier coincidencia.",
          infraTitle: "Infraestructura 0$",
          infraItems: [
            "GitHub Actions programadas para descargar Kobo y Localizados.",
            "Scripts del repositorio para parsing, normalización y scoring.",
            "Datasets generados en docs/ para servirlos por GitHub Pages.",
            "Revisión manual de coincidencias sugeridas antes de publicarlas."
          ],
          pipelineTitle: "Pipeline que vamos a montar",
          pipelineItems: [
            "Ingesta: descargar Kobo y Localizados en cada corrida.",
            "Parsing: extraer nombre, cédula, edad, contacto y ubicación desde texto libre.",
            "Normalización: limpiar acentos, mayúsculas, espacios y variantes de nombres.",
            "Matching: generar candidatos por cédula, nombre, edad y ubicación.",
            "Revisión: publicar coincidencias sugeridas por separado para verificación humana."
          ],
          outputsTitle: "Salidas esperadas",
          outputsItems: [
            "Dataset de personas desaparecidas normalizadas.",
            "Dataset de personas localizadas normalizadas.",
            "Dataset de coincidencias candidatas con puntaje y explicación."
          ],
          dataLinksTitle: "Datasets actuales",
          dataLinkLabels: {
            summary: "Resumen JSON",
            missing: "Desaparecidos JSON",
            located: "Localizados JSON",
            candidates: "Coincidencias JSON"
          },
          sourcesTitle: "Fuentes públicas confirmadas",
          note:
            "Más adelante esto puede moverse a un subdominio como labs.directorioterremotovenezuela.org, pero empezar con /labs/ es la opción más simple y más barata.",
          ctaPrimary: "Volver al directorio",
          ctaSecondary: "Ver recursos técnicos"
        }
      : {
          eyebrow: "Labs",
          title: "Matching lab",
          intro:
            "This space separates experimental work from the main directory. We will test the zero-cost pipeline here for cross-matching public missing-person reports with public located-person lists.",
          statusTitle: "Initial version",
          statusText:
            "We start without a paid backend: GitHub Actions for source syncs, static JSON files for publishing results, and manual review before confirming any match.",
          infraTitle: "Zero-dollar infrastructure",
          infraItems: [
            "Scheduled GitHub Actions to fetch Kobo and Localizados.",
            "Repository scripts for parsing, normalization, and scoring.",
            "Generated datasets under docs/ to serve them through GitHub Pages.",
            "Manual review of suggested matches before anything is published."
          ],
          pipelineTitle: "Pipeline we will build",
          pipelineItems: [
            "Ingest: fetch Kobo and Localizados on each run.",
            "Parsing: extract name, ID, age, contact, and location from free text.",
            "Normalization: clean accents, casing, whitespace, and name variants.",
            "Matching: generate candidates by ID, name, age, and location.",
            "Review: publish suggested matches separately for human verification."
          ],
          outputsTitle: "Expected outputs",
          outputsItems: [
            "Normalized missing-people dataset.",
            "Normalized located-people dataset.",
            "Candidate-match dataset with score and explanation."
          ],
          dataLinksTitle: "Current datasets",
          dataLinkLabels: {
            summary: "Summary JSON",
            missing: "Missing JSON",
            located: "Located JSON",
            candidates: "Candidates JSON"
          },
          sourcesTitle: "Confirmed public sources",
          note:
            "Later this can move to a subdomain like labs.directorioterremotovenezuela.org, but starting with /labs/ is the simplest and cheapest option.",
          ctaPrimary: "Back to directory",
          ctaSecondary: "See technical resources"
        };

  const labsDataBasePath = options.rootDefault ? withSitePath("/labs/data") : localePath(locale, "/labs/data");

  return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}">
${renderHead({
  lang: copy.lang,
  title: `${sections.title} | VeneHelp`,
  description: sections.intro,
  canonical,
  alternates
})}
  <body>
    <div class="flag-bar" aria-hidden="true"><span></span><span></span><span></span></div>
    <main class="page">
      <div class="shell">
        ${renderPageTopbar(locale, "/labs/", options)}
        <p class="eyebrow">${escapeHtml(sections.eyebrow)}</p>
        <h1>${escapeHtml(sections.title)}</h1>
        <p class="page-intro">${escapeHtml(sections.intro)}</p>

        <section class="page-card">
          <h2>${escapeHtml(copy.labsReviewTitle)}</h2>
          <p class="page-intro">${escapeHtml(copy.labsReviewIntro)}</p>
          <h3>${escapeHtml(copy.labsMethodTitle)}</h3>
          <p class="small">${escapeHtml(copy.labsMethodIntro)}</p>
          <div class="labs-method-grid">
            <article class="labs-method-card">
              <h3>${escapeHtml(copy.labsMethodIdentityTitle)}</h3>
              <p>${escapeHtml(copy.labsMethodIdentityText)}</p>
            </article>
            <article class="labs-method-card">
              <h3>${escapeHtml(copy.labsMethodNameTitle)}</h3>
              <p>${escapeHtml(copy.labsMethodNameText)}</p>
            </article>
            <article class="labs-method-card">
              <h3>${escapeHtml(copy.labsMethodContextTitle)}</h3>
              <p>${escapeHtml(copy.labsMethodContextText)}</p>
            </article>
          </div>
          <p class="labs-kicker" style="margin-top:1rem">${escapeHtml(copy.labsMethodRangesTitle)}</p>
          <div class="labs-method-ranges">
            <span class="labs-method-range" data-confidence="high">${escapeHtml(copy.labsMethodRangeHigh)}</span>
            <span class="labs-method-range" data-confidence="medium">${escapeHtml(copy.labsMethodRangeMedium)}</span>
            <span class="labs-method-range" data-confidence="low">${escapeHtml(copy.labsMethodRangeLow)}</span>
          </div>
          <p class="labs-note">${escapeHtml(copy.labsMethodReviewNote)}</p>
          <div class="labs-review-toolbar">
            <div class="field">
              <label for="labs-score-filter">${escapeHtml(copy.labsMinScoreLabel)}</label>
              <select id="labs-score-filter" data-labs-score-filter>
                <option value="all">${escapeHtml(copy.labsAllScores)}</option>
                <option value="medium">${escapeHtml(copy.labsMediumUp)}</option>
                <option value="high">${escapeHtml(copy.labsHighOnly)}</option>
              </select>
            </div>
            <div class="field">
              <label>${escapeHtml(copy.labsResultsLabel)}</label>
              <p class="small" data-labs-results>${escapeHtml(copy.labsMatchesLoading)}</p>
            </div>
          </div>
          <div class="labs-summary-grid" data-labs-summary>
            <div class="labs-summary-stat"><strong>…</strong><span>${escapeHtml(copy.labsSummaryLoading)}</span></div>
          </div>
          <div data-labs-table>
            <p class="labs-empty">${escapeHtml(copy.labsMatchesLoading)}</p>
          </div>
          <div class="labs-match-list" data-labs-list>
            <p class="labs-empty">${escapeHtml(copy.labsMatchesLoading)}</p>
          </div>
        </section>

        <section class="page-card">
          <div class="labs-grid">
            <article class="labs-card">
              <p class="labs-kicker">${escapeHtml(sections.statusTitle)}</p>
              <p>${escapeHtml(sections.statusText)}</p>
            </article>
            <article class="labs-card">
              <p class="labs-kicker">${escapeHtml(sections.outputsTitle)}</p>
              <ul>
                ${sections.outputsItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
              <div class="page-links" style="margin-top:1rem">
                <a class="button secondary" href="${labsDataBasePath}/summary.json">${escapeHtml(sections.dataLinkLabels.summary)}</a>
                <a class="button secondary" href="${labsDataBasePath}/missing.json">${escapeHtml(sections.dataLinkLabels.missing)}</a>
                <a class="button secondary" href="${labsDataBasePath}/located.json">${escapeHtml(sections.dataLinkLabels.located)}</a>
                <a class="button secondary" href="${labsDataBasePath}/candidates.json">${escapeHtml(sections.dataLinkLabels.candidates)}</a>
              </div>
            </article>
          </div>
          <div class="page-links" style="margin-top:1rem">
            <a class="button" href="${options.rootDefault ? withSitePath("/") : localePath(locale, "/")}">${escapeHtml(sections.ctaPrimary)}</a>
            <a class="button secondary" href="${localePath(locale, "/#directorio")}">${escapeHtml(sections.ctaSecondary)}</a>
          </div>
        </section>

        <section class="page-card">
          <h2>${escapeHtml(sections.infraTitle)}</h2>
          <div class="labs-grid">
            <article class="labs-card">
              <ol>
                ${sections.infraItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ol>
            </article>
            <article class="labs-card">
              <h3>${escapeHtml(sections.pipelineTitle)}</h3>
              <ol>
                ${sections.pipelineItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ol>
            </article>
          </div>
        </section>

        <section class="page-card">
          <h2>${escapeHtml(sections.sourcesTitle)}</h2>
          <div class="labs-grid">
            ${labsSources
              .map(
                (source) => `
                <article class="labs-card">
                  <h3>${escapeHtml(source.title)}</h3>
                  <p>${escapeHtml(source.text)}</p>
                  <div class="page-links" style="margin-top:1rem">
                    <a class="button secondary" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(copy.openSource)}</a>
                  </div>
                </article>`
              )
              .join("")}
          </div>
          <p class="labs-note">${escapeHtml(sections.note)}</p>
        </section>
      </div>
    </main>
${renderCloudflareAnalyticsSnippet()}    <script>window.VENEHELP_CONFIG = ${JSON.stringify({
  basePath: options.rootDefault ? "" : localeBasePath(locale),
  labsDataBasePath,
  assetVersion,
  messages: copy
})};</script>
    <script src="${withAssetVersion("/app.js")}" defer></script>
  </body>
</html>`;
};

const renderRegistryPageHtml = (locale) => {
  const copy = localeCopy[locale];

  return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}">
${renderHead({
  lang: copy.lang,
  title: copy.registryPageTitle,
  description: copy.registryPageIntro,
  canonical: absoluteRegistryUrl(locale),
  alternates: renderAlternateLinks("/registro/")
})}
  <body>
    <div class="flag-bar" aria-hidden="true"><span></span><span></span><span></span></div>
    <main class="page">
      <div class="shell">
        ${renderPageTopbar(locale, "/registro/")}
        <p class="eyebrow">${escapeHtml(copy.registryPageEyebrow)}</p>
        <h1>${escapeHtml(copy.registryTitle)}</h1>
        <p class="page-intro">${escapeHtml(copy.registryPageIntro)}</p>

        <section class="page-card">
          <p class="small" data-registry-meta>${escapeHtml(copy.registryLoading)}</p>
          <div class="registry-stats" data-registry-stats></div>
          <div class="controls">
            <div class="field">
              <label for="registry-search">${escapeHtml(copy.registrySearchLabel)}</label>
              <input
                id="registry-search"
                type="search"
                placeholder="${escapeHtml(copy.registrySearchPlaceholder)}"
                data-registry-search
              >
            </div>
            <div class="field">
              <label for="registry-status">${escapeHtml(copy.registryFilterLabel)}</label>
              <select id="registry-status" data-registry-status>
                <option value="all">${escapeHtml(copy.registryAllStatuses)}</option>
                <option value="missing">${escapeHtml(copy.registryStatusMissing)}</option>
                <option value="safe">${escapeHtml(copy.registryStatusSafe)}</option>
                <option value="found">${escapeHtml(copy.registryStatusFound)}</option>
              </select>
            </div>
            <div class="field">
              <label>${escapeHtml(copy.registryResultsLabel)}</label>
              <p class="small" data-registry-results>${escapeHtml(copy.registryLoading)}</p>
            </div>
          </div>
          <div class="table-scroll">
            <table class="registry-table">
              <thead>
                <tr>
                  <th>${escapeHtml(copy.registryNameColumn)}</th>
                  <th>${escapeHtml(copy.registryStatusColumn)}</th>
                  <th>${escapeHtml(copy.registryLocationColumn)}</th>
                  <th>${escapeHtml(copy.registryReportedOnColumn)}</th>
                </tr>
              </thead>
              <tbody data-registry-body>
                <tr><td colspan="4" class="small">${escapeHtml(copy.registryLoading)}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
${renderCloudflareAnalyticsSnippet()}    <script>window.VENEHELP_CONFIG = ${JSON.stringify({ basePath: localeBasePath(locale), assetVersion, messages: copy })};</script>
    <script src="${withAssetVersion("/app.js")}" defer></script>
  </body>
</html>`;
};

const renderLocalizedSourcesIndexHtml = (locale) => {
  const copy = localeCopy[locale];

  return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}">
${renderHead({
  lang: copy.lang,
  title: copy.sourceListTitle,
  description: copy.allSourcesIntro,
  canonical: absoluteLocaleUrl(locale, "/sources/"),
  alternates: renderAlternateLinks("/sources/")
})}
  <body>
    <div class="flag-bar" aria-hidden="true"><span></span><span></span><span></span></div>
    <main class="page">
      <div class="shell">
        ${renderPageTopbar(locale, "/sources/")}
        <p class="eyebrow">${escapeHtml(copy.allSourcesEyebrow)}</p>
        <h1>${escapeHtml(copy.allSourcesTitle)}</h1>
        <p class="page-intro">${escapeHtml(copy.allSourcesIntro)}</p>
        <div class="source-list">
          ${localizedSources[locale]
            .map(
              (source) => `
              <article class="source-card">
                <div class="meta-row">
                  <span class="pill">${escapeHtml(source.status_label)}</span>
                  <span class="pill">${escapeHtml(source.operator_type_label)}</span>
                  <span class="pill">${escapeHtml(source.category_label)}</span>
                  <span class="pill">${escapeHtml(source.purpose_label)}</span>
                </div>
                <h3><a href="${localePath(locale, `/sources/${source.slug}/`)}">${escapeHtml(source.name)}</a></h3>
                <p>${escapeHtml(source.summary)}</p>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </main>
${renderCloudflareAnalyticsSnippet()}  </body>
</html>`;
};

const renderLocalizedSourcePage = (locale, source) => {
  const copy = localeCopy[locale];
  const sourcePath = `/sources/${source.slug}/`;

  return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}">
${renderHead({
  lang: copy.lang,
  title: `${source.name} | VeneHelp`,
  description: source.summary,
  canonical: absoluteLocaleUrl(locale, sourcePath),
  alternates: renderAlternateLinks(sourcePath)
})}
  <body>
    <div class="flag-bar" aria-hidden="true"><span></span><span></span><span></span></div>
    <main class="page">
      <div class="shell">
        ${renderPageTopbar(locale, sourcePath)}
        <p class="eyebrow"><a href="${localePath(locale, "/")}">VeneHelp</a> / <a href="${localePath(locale, "/sources/")}">${escapeHtml(copy.breadcrumbsSources)}</a></p>
        <h1>${escapeHtml(source.name)}</h1>
        ${source.use_when_label ? `<p class="source-usewhen detail-usewhen">${escapeHtml(source.use_when_label)}</p>` : ""}
        <p class="page-intro">${escapeHtml(source.summary)}</p>

        <section class="page-card">
          <div class="meta-row">
            <span class="pill">${escapeHtml(source.status_label)}</span>
            <span class="pill">${escapeHtml(source.operator_type_label)}</span>
            <span class="pill">${escapeHtml(source.category_label)}</span>
            <span class="pill">${escapeHtml(source.purpose_label)}</span>
          </div>
          ${source.warning_label ? `<p class="source-warning" style="margin-top:1rem">${escapeHtml(source.warning_label)}</p>` : ""}
          <div class="cap-row" style="margin-top:1rem">
            ${renderCapabilityStatic(source.public_search, copy.capSearch)}
            ${renderCapabilityStatic(source.accepts_new_reports, copy.capReport)}
            ${renderCapabilityStatic(source.report_found, copy.capFound)}
          </div>
          <p class="small source-trust" style="margin-top:0.85rem">${escapeHtml(source.owner_label || "")}${source.last_checked_at ? ` · ${escapeHtml(copy.checkedShort)} ${escapeHtml(source.last_checked_at)}` : ""}</p>
          ${renderStatsStatic(source.report_stats, locale, copy)}
          <div class="page-links" style="margin-top:1rem">
            ${
              source.url
                ? `<a class="button" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(copy.openSource)}</a>`
                : `<span class="small">${escapeHtml(copy.directLinkPending)}</span>`
            }
          </div>
        </section>

        <section class="page-card">
          <h2>${escapeHtml(copy.notesTitle)}</h2>
          ${renderNotes(source.notes)}
        </section>

        <section class="page-card">
          <h2>${escapeHtml(copy.tagsTitle)}</h2>
          <div class="meta-row">
            ${(source.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </section>

        <section class="page-card">
          <details class="tech-details">
            <summary>${escapeHtml(copy.techDetailsTitle)}</summary>
            <dl class="definition-list">
              ${renderDefinitionRows([
                { label: copy.statusLabelDetail, value: source.status_label },
                { label: copy.operatorTypeLabelDetail, value: source.operator_type_label },
                { label: copy.coverageLabelDetail, value: source.coverage_label },
                { label: copy.languageLabelDetail, value: source.language_label },
                { label: copy.requiresLoginLabel, value: source.requires_login_label },
                { label: copy.acceptsReportsLabelDetail, value: source.accepts_reports_label_value },
                { label: copy.publicSearchLabelDetail, value: source.public_search_label_value },
                { label: copy.reportFoundLabelDetail, value: source.report_found_label_value },
                {
                  label: copy.publicContactLabelDetail,
                  value: source.public_contact,
                  html: source.public_contact ? `<a href="${escapeHtml(source.public_contact)}" target="_blank" rel="noreferrer">${escapeHtml(source.public_contact)}</a>` : null
                },
                {
                  label: copy.publicApiLabelDetail,
                  value: source.api_url,
                  html: source.api_url ? `<a href="${escapeHtml(source.api_url)}" target="_blank" rel="noreferrer">${escapeHtml(source.api_url)}</a>` : null
                },
                {
                  label: copy.sourceCodeLabelDetail,
                  value: source.source_code_url,
                  html: source.source_code_url ? `<a href="${escapeHtml(source.source_code_url)}" target="_blank" rel="noreferrer">${escapeHtml(source.source_code_url)}</a>` : null
                },
                { label: copy.ownerLabelDetail, value: source.owner_label },
                {
                  label: copy.servicesLabelDetail,
                  value: (source.service_labels || []).length ? "x" : null,
                  html: (source.service_labels || []).map((label) => `<span class="pill">${escapeHtml(label)}</span>`).join(" ")
                },
                { label: copy.crawlerPriorityLabel, value: source.crawler_priority },
                { label: copy.lastCheckedLabel, value: source.last_checked_at }
              ])}
            </dl>
            <div class="page-links" style="margin-top:1rem">
              <a class="button secondary" href="${localePath(locale, "/data/sources.json")}">${escapeHtml(copy.viewJson)}</a>
            </div>
          </details>
        </section>
      </div>
    </main>
${renderCloudflareAnalyticsSnippet()}  </body>
</html>`;
};

const renderRedirectPage = (targetPath, title) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${escapeHtml(targetPath)}">
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeHtml(targetPath)}">
    <script>window.location.replace(${JSON.stringify(targetPath)});</script>
${renderGoogleAnalyticsSnippet()}  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(targetPath)}">${escapeHtml(targetPath)}</a>.</p>
${renderCloudflareAnalyticsSnippet()}  </body>
</html>`;

const renderRobots = () => `User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

const renderLlms = () => `# VeneHelp

VeneHelp is a public directory of search, reporting, and aid sources related to the Venezuela earthquake emergency.

## Preferred entrypoints

- Spanish default homepage: ${absoluteUrl("/")}
- Spanish homepage: ${absoluteLocaleUrl("es", "/")}
- English homepage: ${absoluteLocaleUrl("en", "/")}
- Spanish Labs page: ${absoluteUrl("/labs/")}
- English Labs page: ${absoluteLocaleUrl("en", "/labs/")}
- Canonical raw dataset: ${absoluteUrl("/data/sources.json")}
${showRegistry ? `- Spanish beta registry page: ${absoluteRegistryUrl("es")}
- English beta registry page: ${absoluteRegistryUrl("en")}
- Beta registry dataset: ${absoluteUrl("/data/registry.json")}` : ""}

## Usage notes

- Treat entries as directory pointers, not as endorsements or authoritative claims.
- Prefer crawler priority 1 and 2 sources first.
- Check each origin source directly before repeating sensitive claims.
`;

const renderSitemap = () => {
  const entries = [
    absoluteUrl("/"),
    absoluteUrl("/labs/"),
    absoluteUrl("/data/sources.json"),
    ...(showRegistry ? [absoluteUrl("/data/registry.json")] : []),
    ...supportedLocales.flatMap((locale) => [
      absoluteLocaleUrl(locale, "/"),
      absoluteLocaleUrl(locale, "/labs/"),
      absoluteLocaleUrl(locale, "/sources/"),
      absoluteLocaleUrl(locale, "/data/sources.json"),
      ...(showRegistry ? [absoluteRegistryUrl(locale), absoluteLocaleUrl(locale, "/data/registry.json")] : []),
      ...localizedSources[locale].map((source) => absoluteLocaleUrl(locale, `/sources/${source.slug}/`))
    ])
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeHtml(entry)}</loc>
    <lastmod>${escapeHtml(generatedAt)}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;
};

await fs.rm(docsDir, { recursive: true, force: true });
await ensureDir(docsDir);
await fs.writeFile(path.join(docsDir, "styles.css"), styles);
await fs.writeFile(path.join(docsDir, "app.js"), appJs);
await fs.writeFile(path.join(docsDir, "index.html"), renderRootIndexHtml());
await ensureDir(path.join(docsDir, "labs"));
await fs.writeFile(
  path.join(docsDir, "labs", "index.html"),
  renderLabsPageHtml("es", {
    canonical: absoluteUrl("/labs/"),
    alternates: renderRootPathAlternateLinks("/labs/"),
    rootDefault: true
  })
);
await fs.writeFile(path.join(docsDir, "robots.txt"), renderRobots());
await fs.writeFile(path.join(docsDir, "llms.txt"), renderLlms());
await fs.writeFile(path.join(docsDir, "sitemap.xml"), renderSitemap());
await fs.writeFile(path.join(docsDir, "CNAME"), `${customDomain}\n`);

const rawDataDir = path.join(docsDir, "data");
await ensureDir(rawDataDir);
await fs.writeFile(path.join(rawDataDir, "sources.json"), JSON.stringify(rawSources, null, 2) + "\n");
if (showRegistry) {
  await fs.writeFile(path.join(rawDataDir, "registry.json"), JSON.stringify(rawRegistry, null, 2) + "\n");
}

for (const locale of supportedLocales) {
  const localeDir = path.join(docsDir, locale);
  const localeDataDir = path.join(localeDir, "data");
  const localeSourcesDir = path.join(localeDir, "sources");
  const localeLabsDir = path.join(localeDir, "labs");

  await ensureDir(localeDir);
  await ensureDir(localeDataDir);
  await ensureDir(localeSourcesDir);
  await ensureDir(localeLabsDir);
  if (showRegistry) {
    await ensureDir(path.join(localeDir, "registro"));
  }

  await fs.writeFile(path.join(localeDir, "index.html"), renderLocaleIndexHtml(locale));
  await fs.writeFile(path.join(localeLabsDir, "index.html"), renderLabsPageHtml(locale));
  if (showRegistry) {
    await fs.writeFile(path.join(localeDir, "registro", "index.html"), renderRegistryPageHtml(locale));
  }
  await fs.writeFile(path.join(localeDataDir, "sources.json"), JSON.stringify(localizedSources[locale], null, 2) + "\n");
  if (showRegistry) {
    await fs.writeFile(path.join(localeDataDir, "registry.json"), JSON.stringify(localizedRegistry[locale], null, 2) + "\n");
  }
  await fs.writeFile(path.join(localeSourcesDir, "index.html"), renderLocalizedSourcesIndexHtml(locale));

  for (const source of localizedSources[locale]) {
    const sourceDir = path.join(localeSourcesDir, source.slug);
    await ensureDir(sourceDir);
    await fs.writeFile(path.join(sourceDir, "index.html"), renderLocalizedSourcePage(locale, source));
  }
}

const legacySourcesDir = path.join(docsDir, "sources");
await ensureDir(legacySourcesDir);
await fs.writeFile(path.join(legacySourcesDir, "index.html"), renderRedirectPage(localePath("es", "/sources/"), "Redirecting"));

for (const source of rawSources) {
  const legacySourceDir = path.join(legacySourcesDir, source.slug);
  await ensureDir(legacySourceDir);
  await fs.writeFile(
    path.join(legacySourceDir, "index.html"),
    renderRedirectPage(localePath("es", `/sources/${source.slug}/`), `Redirecting ${source.name}`)
  );
}

console.log(
  `Built ${rawSources.length} source pages per locale into ${docsDir} for ${supportedLocales.join(", ")}.`
);
