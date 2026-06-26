import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const docsDir = path.join(rootDir, "docs");
const sourcesDir = path.join(docsDir, "sources");
const docsDataDir = path.join(docsDir, "data");
const siteUrl = (process.env.SITE_URL || "https://example.org").replace(/\/+$/, "");
const sitePath = (process.env.SITE_PATH || "").replace(/\/+$/, "");

const sourceFile = path.join(rootDir, "data", "sources.json");
const sources = JSON.parse(await fs.readFile(sourceFile, "utf8"));
const generatedAt = new Date().toISOString();

const withSitePath = (pathname) => `${sitePath}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
const absoluteUrl = (pathname) => `${siteUrl}${withSitePath(pathname)}`;

const styles = `
:root {
  --bg: #f3ede2;
  --paper: #fffaf2;
  --card: #fffdf8;
  --ink: #1f1a17;
  --muted: #6f655f;
  --line: #d6c6b6;
  --accent: #a8381f;
  --accent-soft: #f6ddd3;
  --success: #2d6a4f;
  --warn: #9a6700;
  --shadow: 0 18px 48px rgba(64, 41, 24, 0.08);
  --radius: 18px;
  --max: 1120px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(168, 56, 31, 0.10), transparent 28rem),
    linear-gradient(180deg, #fbf6ee 0%, #f0e4d2 100%);
  line-height: 1.5;
}

a {
  color: var(--accent);
}

main {
  display: block;
}

.shell {
  width: min(calc(100% - 2rem), var(--max));
  margin: 0 auto;
}

.hero {
  padding: 4rem 0 2.5rem;
}

.eyebrow {
  display: inline-block;
  margin: 0 0 1rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(168, 56, 31, 0.18);
  color: var(--accent);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

h1, h2, h3 {
  line-height: 1.1;
  margin: 0;
}

h1 {
  max-width: 14ch;
  font-size: clamp(2.6rem, 5vw, 4.8rem);
}

.hero-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1.4fr) minmax(18rem, 0.8fr);
  align-items: start;
}

.lede {
  margin: 1rem 0 0;
  max-width: 62ch;
  color: var(--muted);
  font-size: 1.08rem;
}

.hero-card,
.panel,
.source-card,
.page-card {
  background: rgba(255, 250, 242, 0.92);
  border: 1px solid rgba(111, 101, 95, 0.16);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.hero-card {
  padding: 1.2rem 1.2rem 1rem;
}

.hero-card p,
.page-intro {
  color: var(--muted);
}

.stats {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 2rem;
}

.stat {
  padding: 1rem 1.1rem;
  background: rgba(255, 253, 248, 0.92);
  border: 1px solid rgba(111, 101, 95, 0.14);
  border-radius: 16px;
}

.stat strong {
  display: block;
  font-size: 1.6rem;
}

.section {
  padding: 0 0 2.5rem;
}

.panel {
  padding: 1.25rem;
}

.controls {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: 2fr 1fr 1fr;
  margin-top: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field label {
  font-size: 0.92rem;
  color: var(--muted);
}

input,
select {
  width: 100%;
  padding: 0.88rem 0.95rem;
  font: inherit;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.9rem;
}

.pill,
.status {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.88rem;
  border: 1px solid rgba(111, 101, 95, 0.18);
}

.pill {
  background: rgba(246, 221, 211, 0.7);
}

.status-unverified,
.status-lead {
  background: #f6e9c3;
  color: var(--warn);
}

.status-verified {
  background: #d8f0e3;
  color: var(--success);
}

.source-list {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.source-card {
  padding: 1.2rem;
}

.source-card h3 {
  font-size: 1.4rem;
}

.source-card p {
  margin: 0.9rem 0;
  color: var(--muted);
}

.source-card footer,
.page-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  text-decoration: none;
  background: var(--accent);
  color: #fffaf2;
}

.button.secondary {
  background: transparent;
  color: var(--accent);
  border: 1px solid rgba(168, 56, 31, 0.25);
}

.small {
  color: var(--muted);
  font-size: 0.94rem;
}

ul {
  padding-left: 1.2rem;
}

.footer {
  padding: 0 0 3rem;
  color: var(--muted);
}

.page {
  padding: 3rem 0;
}

.page-card {
  padding: 1.4rem;
}

.page-card + .page-card {
  margin-top: 1rem;
}

.definition-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.definition-list div {
  padding: 0.85rem 0.95rem;
  border-radius: 14px;
  background: rgba(255, 253, 248, 0.82);
  border: 1px solid rgba(111, 101, 95, 0.12);
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
  .hero-grid,
  .controls,
  .definition-list,
  .stats {
    grid-template-columns: 1fr;
  }
}
`.trimStart();

const appJs = `
const basePath = window.VENEHELP_BASE_PATH || "";
const state = {
  sources: [],
  query: "",
  category: "all",
  purpose: "all"
};

const listEl = document.querySelector("[data-source-list]");
const countEl = document.querySelector("[data-results-count]");
const searchEl = document.querySelector("[data-search]");
const categoryEl = document.querySelector("[data-category]");
const purposeEl = document.querySelector("[data-purpose]");
const totalEl = document.querySelector("[data-total-sources]");
const primaryEl = document.querySelector("[data-primary-sources]");
const leadEl = document.querySelector("[data-lead-sources]");

const normalize = (value) => String(value || "").toLowerCase();

const matchesQuery = (source, query) => {
  if (!query) return true;
  const haystack = [
    source.name,
    source.summary,
    source.category,
    source.purpose,
    ...(source.tags || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
};

const renderBadge = (label, className = "pill") =>
  '<span class="' + className + '">' + label + "</span>";

const renderCard = (source) => {
  const detailsPath = basePath + '/sources/' + source.slug + '/';
  const linkHtml = source.url
    ? '<a class="button" href="' + source.url + '" target="_blank" rel="noreferrer">Open source</a>'
    : '<span class="small">Direct link pending verification</span>';

  return [
    '<article class="source-card">',
    '<div class="meta-row">',
    renderBadge(source.category),
    renderBadge(source.purpose),
    renderBadge(source.status, 'status status-' + source.status),
    '</div>',
    '<h3><a href="' + detailsPath + '">' + source.name + '</a></h3>',
    '<p>' + source.summary + '</p>',
    '<footer>',
    linkHtml,
    '<a class="button secondary" href="' + detailsPath + '">View details</a>',
    '</footer>',
    '</article>'
  ].join("");
};

const render = () => {
  const filtered = state.sources.filter((source) => {
    const matchesCategory = state.category === "all" || source.category === state.category;
    const matchesPurposeFilter = state.purpose === "all" || source.purpose === state.purpose;
    return matchesCategory && matchesPurposeFilter && matchesQuery(source, state.query);
  });

  countEl.textContent = filtered.length + " sources shown";
  listEl.innerHTML = filtered.map(renderCard).join("") || '<p class="small">No sources match the current filters.</p>';
};

const load = async () => {
  const response = await fetch(basePath + "/data/sources.json");
  state.sources = await response.json();

  totalEl.textContent = String(state.sources.length);
  primaryEl.textContent = String(state.sources.filter((item) => item.crawler_priority <= 2).length);
  leadEl.textContent = String(state.sources.filter((item) => item.status === "lead").length);

  render();
};

searchEl.addEventListener("input", (event) => {
  state.query = normalize(event.target.value.trim());
  render();
});

categoryEl.addEventListener("change", (event) => {
  state.category = event.target.value;
  render();
});

purposeEl.addEventListener("change", (event) => {
  state.purpose = event.target.value;
  render();
});

load().catch(() => {
  countEl.textContent = "Unable to load sources";
  listEl.innerHTML = '<p class="small">Check that the generated JSON file exists and the site is being served from the docs folder.</p>';
});
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

const titleCase = (value) =>
  String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const valueOrFallback = (value, fallback = "Unknown") =>
  value === null || value === undefined || value === "" ? fallback : escapeHtml(value);

const renderNotes = (notes = []) =>
  notes.length
    ? `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`
    : "<p class=\"small\">No notes yet.</p>";

const renderIndexHtml = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>VeneHelp Directory</title>
    <meta name="description" content="A public directory of missing-person reporting resources related to the Venezuela earthquake emergency.">
    <link rel="canonical" href="${absoluteUrl("/")}">
    <link rel="stylesheet" href="${withSitePath("/styles.css")}">
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="shell hero-grid">
          <div>
            <p class="eyebrow">VeneHelp directory</p>
            <h1>One public entrypoint for fragmented missing-person resources</h1>
            <p class="lede">This site does not replace the original registries. It helps families, volunteers, journalists, and LLM agents discover them from a single public directory.</p>
          </div>
          <aside class="hero-card">
            <h2>Use carefully</h2>
            <p>Every source in the first version should be manually verified. Keep links public, current, and clearly labeled to reduce harm during a crisis.</p>
            <div class="meta-row">
              <span class="status status-unverified">initial dataset</span>
              <span class="pill">machine-readable</span>
              <span class="pill">GitHub Pages ready</span>
            </div>
          </aside>
        </div>
        <div class="shell stats">
          <div class="stat">
            <strong data-total-sources>0</strong>
            <span>known sources</span>
          </div>
          <div class="stat">
            <strong data-primary-sources>0</strong>
            <span>primary crawl targets</span>
          </div>
          <div class="stat">
            <strong data-lead-sources>0</strong>
            <span>unverified leads</span>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell panel">
          <h2>Find a source</h2>
          <p class="page-intro">Use filters to narrow the directory, or consume the raw dataset at <a href="${withSitePath("/data/sources.json")}"><code>/data/sources.json</code></a>.</p>
          <div class="controls">
            <div class="field">
              <label for="search">Search</label>
              <input id="search" type="search" placeholder="Search by name, category, or tag" data-search>
            </div>
            <div class="field">
              <label for="category">Category</label>
              <select id="category" data-category>
                <option value="all">All categories</option>
                <option value="website">Website</option>
                <option value="map">Map</option>
                <option value="form">Form</option>
                <option value="media">Media</option>
                <option value="campaign">Campaign</option>
                <option value="app">App</option>
              </select>
            </div>
            <div class="field">
              <label for="purpose">Purpose</label>
              <select id="purpose" data-purpose>
                <option value="all">All purposes</option>
                <option value="report-and-search">Report and search</option>
                <option value="reporting">Reporting</option>
                <option value="context-and-location">Context and location</option>
                <option value="official-reporting">Official reporting</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>
          <p class="small" data-results-count>Loading sources</p>
          <div class="source-list" data-source-list></div>
        </div>
      </section>

      <section class="section">
        <div class="shell panel">
          <h2>For crawlers and agents</h2>
          <ul>
            <li>Start at the homepage or the JSON index.</li>
            <li>Prioritize sources with <code>crawler_priority</code> 1 or 2.</li>
            <li>Treat <code>lead</code> and <code>unverified</code> entries as discovery pointers, not trusted truth.</li>
            <li>Check <code>last_verified_at</code> and <code>status</code> before relying on a source.</li>
          </ul>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="shell">
        <p>Generated ${escapeHtml(generatedAt)}. Built as a public directory, not a replacement for the original sources.</p>
      </div>
    </footer>
    <script>window.VENEHELP_BASE_PATH = ${JSON.stringify(sitePath)};</script>
    <script src="${withSitePath("/app.js")}" defer></script>
  </body>
</html>`;

const renderSourcesIndexHtml = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>All Sources | VeneHelp</title>
    <meta name="description" content="All directory sources tracked by VeneHelp.">
    <link rel="canonical" href="${absoluteUrl("/sources/")}">
    <link rel="stylesheet" href="${withSitePath("/styles.css")}">
  </head>
  <body>
    <main class="page">
      <div class="shell">
        <p class="eyebrow">All sources</p>
        <h1>Source directory</h1>
        <p class="page-intro">Each source has a stable detail page plus the canonical JSON export.</p>
        <div class="source-list">
          ${sources
            .map(
              (source) => `
              <article class="source-card">
                <div class="meta-row">
                  <span class="pill">${escapeHtml(source.category)}</span>
                  <span class="pill">${escapeHtml(source.purpose)}</span>
                  <span class="status status-${escapeHtml(source.status)}">${escapeHtml(source.status)}</span>
                </div>
                <h3><a href="${withSitePath(`/sources/${escapeHtml(source.slug)}/`)}">${escapeHtml(source.name)}</a></h3>
                <p>${escapeHtml(source.summary)}</p>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </main>
  </body>
</html>`;

const renderSourcePage = (source) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(source.name)} | VeneHelp</title>
    <meta name="description" content="${escapeHtml(source.summary)}">
    <link rel="canonical" href="${absoluteUrl(`/sources/${escapeHtml(source.slug)}/`)}">
    <link rel="stylesheet" href="${withSitePath("/styles.css")}">
  </head>
  <body>
    <main class="page">
      <div class="shell">
        <p class="eyebrow"><a href="${withSitePath("/")}">VeneHelp</a> / <a href="${withSitePath("/sources/")}">Sources</a></p>
        <h1>${escapeHtml(source.name)}</h1>
        <p class="page-intro">${escapeHtml(source.summary)}</p>

        <section class="page-card">
          <div class="meta-row">
            <span class="pill">${escapeHtml(source.category)}</span>
            <span class="pill">${escapeHtml(source.purpose)}</span>
            <span class="status status-${escapeHtml(source.status)}">${escapeHtml(source.status)}</span>
          </div>
          <div class="page-links" style="margin-top:1rem">
            ${
              source.url
                ? `<a class="button" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open source</a>`
                : `<span class="small">Direct link pending verification</span>`
            }
            <a class="button secondary" href="${withSitePath("/data/sources.json")}">View raw dataset</a>
          </div>
        </section>

        <section class="page-card">
          <h2>Metadata</h2>
          <dl class="definition-list">
            <div>
              <dt>Coverage</dt>
              <dd>${valueOrFallback(source.coverage)}</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>${valueOrFallback(source.language)}</dd>
            </div>
            <div>
              <dt>Requires login</dt>
              <dd>${valueOrFallback(source.requires_login)}</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>${valueOrFallback(source.owner)}</dd>
            </div>
            <div>
              <dt>Crawler priority</dt>
              <dd>${valueOrFallback(source.crawler_priority)}</dd>
            </div>
            <div>
              <dt>Last verified</dt>
              <dd>${valueOrFallback(source.last_verified_at, "Not yet verified")}</dd>
            </div>
          </dl>
        </section>

        <section class="page-card">
          <h2>Notes</h2>
          ${renderNotes(source.notes)}
        </section>

        <section class="page-card">
          <h2>Tags</h2>
          <div class="meta-row">
            ${(source.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </section>
      </div>
    </main>
  </body>
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

VeneHelp is a public directory of missing-person reporting sources related to the Venezuela earthquake emergency.

## Preferred entrypoints

- Homepage: ${absoluteUrl("/")}
- Source list: ${absoluteUrl("/sources/")}
- JSON dataset: ${absoluteUrl("/data/sources.json")}

## Usage notes

- Treat entries with status "unverified" or "lead" as discovery pointers.
- Prefer crawler priority 1 and 2 sources first.
- Check each origin source directly before repeating sensitive claims.
`;

const renderSitemap = () => {
  const entries = [
    absoluteUrl("/"),
    absoluteUrl("/sources/"),
    absoluteUrl("/data/sources.json"),
    ...sources.map((source) => absoluteUrl(`/sources/${source.slug}/`))
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

await ensureDir(docsDir);
await ensureDir(sourcesDir);
await ensureDir(docsDataDir);

await fs.writeFile(path.join(docsDir, "styles.css"), styles);
await fs.writeFile(path.join(docsDir, "app.js"), appJs);
await fs.writeFile(path.join(docsDir, "index.html"), renderIndexHtml());
await fs.writeFile(path.join(docsDir, "robots.txt"), renderRobots());
await fs.writeFile(path.join(docsDir, "llms.txt"), renderLlms());
await fs.writeFile(path.join(docsDir, "sitemap.xml"), renderSitemap());
await fs.writeFile(path.join(docsDataDir, "sources.json"), JSON.stringify(sources, null, 2) + "\n");

await ensureDir(path.join(sourcesDir));
await fs.writeFile(path.join(sourcesDir, "index.html"), renderSourcesIndexHtml());

for (const source of sources) {
  const sourcePageDir = path.join(sourcesDir, source.slug);
  await ensureDir(sourcePageDir);
  await fs.writeFile(path.join(sourcePageDir, "index.html"), renderSourcePage(source));
}

console.log(`Built ${sources.length} source pages into ${docsDir}`);
