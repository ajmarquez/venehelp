import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const docsDir = path.join(rootDir, "docs");
const sourceFile = path.join(rootDir, "data", "sources.json");

const customDomain = (process.env.SITE_DOMAIN || "directorioterremotovenezuela.org").replace(/^https?:\/\//, "").replace(/\/+$/, "");
const siteUrl = (process.env.SITE_URL || `https://${customDomain}`).replace(/\/+$/, "");
const sitePath = (process.env.SITE_PATH || "").replace(/\/+$/, "");
const rawSources = JSON.parse(await fs.readFile(sourceFile, "utf8"));
const generatedAt = new Date().toISOString();
const supportedLocales = ["es", "en"];

const withSitePath = (pathname) => `${sitePath}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
const absoluteUrl = (pathname) => `${siteUrl}${withSitePath(pathname)}`;
const localeBasePath = (locale) => withSitePath(`/${locale}`);
const localePath = (locale, pathname = "/") =>
  withSitePath(`/${locale}${pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`}`);
const absoluteLocaleUrl = (locale, pathname = "/") => `${siteUrl}${localePath(locale, pathname)}`;

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

.eyebrow,
.brand-link {
  display: inline-block;
  margin: 0 0 1rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(168, 56, 31, 0.18);
  color: var(--accent);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  text-decoration: none;
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
.page-links,
.chooser-actions,
.topbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
}

.topbar {
  justify-content: space-between;
  margin-bottom: 1.2rem;
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

.language-switcher {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.3rem;
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(111, 101, 95, 0.18);
}

.language-switcher a {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  text-decoration: none;
  color: var(--muted);
}

.language-switcher a[aria-current="page"] {
  background: var(--accent);
  color: #fffaf2;
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

.chooser-card {
  max-width: 44rem;
  margin: 0 auto;
  padding: 1.6rem;
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
  "context-and-location": { es: "Contexto y ubicación", en: "Context and location" },
  "official-reporting": { es: "Reporte oficial", en: "Official reporting" },
  lead: { es: "Pista", en: "Lead" }
};

const statusLabels = {
  unverified: { es: "Sin verificar", en: "Unverified" },
  verified: { es: "Verificado", en: "Verified" },
  lead: { es: "Pista", en: "Lead" }
};

const coverageLabels = {
  national: { es: "Nacional", en: "National" }
};

const ownerLabels = {
  "Volunteer initiative": { es: "Iniciativa voluntaria", en: "Volunteer initiative" },
  "Citizen platform": { es: "Plataforma ciudadana", en: "Citizen platform" },
  "Community responders": { es: "Respondedores comunitarios", en: "Community responders" },
  "Media outlet": { es: "Medio de comunicación", en: "Media outlet" },
  "Campaign network": { es: "Red de campaña", en: "Campaign network" },
  Government: { es: "Gobierno", en: "Government" },
  Unknown: { es: "Desconocido", en: "Unknown" }
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
  app: { es: "aplicacion", en: "app" }
};

const spanishSourceCopy = {
  "desaparecidos-terremoto-venezuela": {
    summary:
      "Registro ciudadano para reportar y buscar personas desaparecidas tras el terremoto. Se ha citado como una de las plataformas públicas más referenciadas.",
    notes: [
      "Necesita verificación manual antes de tratarse como una fuente autoritativa.",
      "Está orientado a reportar personas desaparecidas, buscar registros y marcar a alguien como encontrado."
    ]
  },
  "venezuela-te-busca": {
    summary:
      "Registro colaborativo de personas desaparecidas con flujos de búsqueda y reporte.",
    notes: [
      "Necesita verificación manual antes de publicarse.",
      "Se reporta que permite buscar por nombre, cédula o ubicación."
    ]
  },
  "venezuela-reporta": {
    summary:
      "Plataforma ciudadana para reportes de personas desaparecidas y otras emergencias, mencionada como un registro alternativo.",
    notes: [
      "Necesita verificación manual antes de publicarse."
    ]
  },
  "terremoto-venezuela-mapa": {
    summary:
      "Sitio de mapeo de incidentes y daños que puede ayudar a contextualizar ubicaciones vinculadas con reportes de personas desaparecidas.",
    notes: [
      "Sirve como contexto complementario, no como registro principal de personas desaparecidas.",
      "Necesita verificación manual antes de publicarse."
    ]
  },
  "kobotoolbox-terremotove": {
    summary:
      "Formulario comunitario para reportar personas desaparecidas o atrapadas, daños y necesidades de ayuda.",
    notes: [
      "Necesita verificación manual antes de publicarse.",
      "Podría conectarse con mapas o paneles públicos de Kobo."
    ]
  },
  "talcual-digital-lead": {
    summary:
      "Pista sobre un posible formulario o canal específico para reportar personas desaparecidas promovido por el medio.",
    notes: [
      "La URL exacta del formulario sigue pendiente de verificación.",
      "Mantenerlo como pista hasta confirmar la página o formulario directo de emergencia."
    ]
  },
  "reconectemos-a-cada-familia-lead": {
    summary:
      "Pista sobre una iniciativa de reporte vinculada a una campaña, mencionada junto a las principales plataformas públicas.",
    notes: [
      "Todavía no hay una URL directa verificada.",
      "Agregarla solo después de confirmar la página o el registro exacto."
    ]
  },
  venapp: {
    summary:
      "Aplicación móvil del gobierno, presuntamente adaptada para reportes de emergencia relacionados con el terremoto.",
    notes: [
      "Está basada en una app móvil y probablemente no sea rastreable de forma directa por agentes web públicos.",
      "Conviene mantenerla por completitud, pero tratarla distinto a las fuentes web."
    ]
  }
};

const localeCopy = {
  es: {
    lang: "es",
    localeLabel: "Español",
    alternateLocaleLabel: "English",
    htmlTitle: "Directorio VeneHelp",
    siteDescription:
      "Directorio público de recursos para reportar personas desaparecidas relacionados con la emergencia del terremoto en Venezuela.",
    eyebrow: "Directorio VeneHelp",
    heroTitle: "Un punto de entrada público para recursos fragmentados de personas desaparecidas",
    heroLede:
      "Este sitio no reemplaza los registros originales. Ayuda a familias, voluntarios, periodistas y agentes LLM a encontrarlos desde un solo directorio público.",
    cautionTitle: "Usa esta información con cuidado",
    cautionBody:
      "Cada fuente de esta primera versión debe verificarse manualmente. Mantén los enlaces públicos, actuales y claramente etiquetados para reducir daños durante una crisis.",
    initialDataset: "dataset inicial",
    machineReadable: "legible por máquinas",
    githubPagesReady: "listo para GitHub Pages",
    stats: {
      knownSources: "fuentes conocidas",
      primaryTargets: "fuentes prioritarias para rastreo",
      unverifiedLeads: "pistas sin verificar"
    },
    findSourceTitle: "Encontrar una fuente",
    findSourceIntro:
      "Usa los filtros para acotar el directorio, o consulta el dataset en <a href=\"{dataUrl}\"><code>{dataPath}</code></a>.",
    searchLabel: "Buscar",
    searchPlaceholder: "Busca por nombre, categoría o etiqueta",
    categoryLabel: "Categoría",
    purposeLabel: "Propósito",
    allCategories: "Todas las categorías",
    allPurposes: "Todos los propósitos",
    loadingSources: "Cargando fuentes",
    resultsShown: "{count} fuentes visibles",
    noResults: "Ninguna fuente coincide con los filtros actuales.",
    loadFailed: "No se pudieron cargar las fuentes",
    loadFailedHelp: "Verifica que exista el archivo JSON generado y que el sitio se esté sirviendo desde la carpeta docs.",
    openSource: "Abrir fuente",
    details: "Ver detalles",
    directLinkPending: "Enlace directo pendiente de verificación",
    crawlersTitle: "Para rastreadores y agentes",
    crawlerNotes: [
      "Empieza por la portada o por el índice JSON.",
      "Prioriza las fuentes con <code>crawler_priority</code> 1 o 2.",
      "Trata las entradas con estado <code>lead</code> o <code>unverified</code> como pistas, no como verdad confiable.",
      "Revisa <code>last_verified_at</code> y <code>status</code> antes de depender de una fuente."
    ],
    footer:
      "Generado {generatedAt}. Construido como directorio público, no como reemplazo de las fuentes originales.",
    allSourcesEyebrow: "Todas las fuentes",
    allSourcesTitle: "Directorio de fuentes",
    allSourcesIntro: "Cada fuente tiene una página estable de detalle y una exportación JSON canónica por idioma.",
    breadcrumbsSources: "Fuentes",
    metadataTitle: "Metadatos",
    coverageLabelDetail: "Cobertura",
    languageLabelDetail: "Idioma",
    requiresLoginLabel: "Requiere inicio de sesión",
    ownerLabelDetail: "Responsable",
    crawlerPriorityLabel: "Prioridad para rastreo",
    lastVerifiedLabel: "Última verificación",
    notYetVerified: "Aún sin verificar",
    notesTitle: "Notas",
    tagsTitle: "Etiquetas",
    viewJson: "Ver JSON",
    chooserTitle: "Elige idioma",
    chooserBody:
      "Sugerimos una versión según el idioma del navegador y recordamos tu elección. También puedes cambiar de idioma manualmente en cualquier página.",
    chooserEs: "Continuar en Español",
    chooserEn: "Continue in English",
    chooserRedirecting: "Redirigiendo a la versión sugerida...",
    languageNavLabel: "Idioma",
    sourceListTitle: "Todas las fuentes | VeneHelp"
  },
  en: {
    lang: "en",
    localeLabel: "English",
    alternateLocaleLabel: "Español",
    htmlTitle: "VeneHelp Directory",
    siteDescription:
      "Public directory of missing-person reporting resources related to the Venezuela earthquake emergency.",
    eyebrow: "VeneHelp directory",
    heroTitle: "One public entrypoint for fragmented missing-person resources",
    heroLede:
      "This site does not replace the original registries. It helps families, volunteers, journalists, and LLM agents discover them from a single public directory.",
    cautionTitle: "Use carefully",
    cautionBody:
      "Every source in the first version should be manually verified. Keep links public, current, and clearly labeled to reduce harm during a crisis.",
    initialDataset: "initial dataset",
    machineReadable: "machine-readable",
    githubPagesReady: "GitHub Pages ready",
    stats: {
      knownSources: "known sources",
      primaryTargets: "primary crawl targets",
      unverifiedLeads: "unverified leads"
    },
    findSourceTitle: "Find a source",
    findSourceIntro:
      "Use filters to narrow the directory, or consume the dataset at <a href=\"{dataUrl}\"><code>{dataPath}</code></a>.",
    searchLabel: "Search",
    searchPlaceholder: "Search by name, category, or tag",
    categoryLabel: "Category",
    purposeLabel: "Purpose",
    allCategories: "All categories",
    allPurposes: "All purposes",
    loadingSources: "Loading sources",
    resultsShown: "{count} sources shown",
    noResults: "No sources match the current filters.",
    loadFailed: "Unable to load sources",
    loadFailedHelp: "Check that the generated JSON file exists and the site is being served from the docs folder.",
    openSource: "Open source",
    details: "View details",
    directLinkPending: "Direct link pending verification",
    crawlersTitle: "For crawlers and agents",
    crawlerNotes: [
      "Start at the homepage or the JSON index.",
      "Prioritize sources with <code>crawler_priority</code> 1 or 2.",
      "Treat entries with status <code>lead</code> or <code>unverified</code> as discovery pointers, not trusted truth.",
      "Check <code>last_verified_at</code> and <code>status</code> before relying on a source."
    ],
    footer:
      "Generated {generatedAt}. Built as a public directory, not a replacement for the original sources.",
    allSourcesEyebrow: "All sources",
    allSourcesTitle: "Source directory",
    allSourcesIntro: "Each source has a stable detail page plus a canonical per-language JSON export.",
    breadcrumbsSources: "Sources",
    metadataTitle: "Metadata",
    coverageLabelDetail: "Coverage",
    languageLabelDetail: "Language",
    requiresLoginLabel: "Requires login",
    ownerLabelDetail: "Owner",
    crawlerPriorityLabel: "Crawler priority",
    lastVerifiedLabel: "Last verified",
    notYetVerified: "Not yet verified",
    notesTitle: "Notes",
    tagsTitle: "Tags",
    viewJson: "View JSON",
    chooserTitle: "Choose language",
    chooserBody:
      "We suggest a version based on your browser language and remember your choice. You can also switch languages manually on any page.",
    chooserEs: "Continuar en Español",
    chooserEn: "Continue in English",
    chooserRedirecting: "Redirecting to the suggested version...",
    languageNavLabel: "Language",
    sourceListTitle: "All Sources | VeneHelp"
  }
};

const appJs = `
const config = window.VENEHELP_CONFIG || {};
const messages = config.messages || {};
const basePath = config.basePath || "";

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

const interpolate = (template, values = {}) =>
  String(template || "").replace(/\\{(\\w+)\\}/g, (_, key) => String(values[key] ?? ""));

const normalize = (value) => String(value || "").toLowerCase();

const matchesQuery = (source, query) => {
  if (!query) return true;
  const haystack = [
    source.name,
    source.summary,
    source.category_label,
    source.purpose_label,
    source.status_label,
    ...(source.tags || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
};

const renderBadge = (label, className = "pill") =>
  '<span class="' + className + '">' + label + "</span>";

const renderCard = (source) => {
  const detailsPath = basePath + '/sources/' + source.slug + '/';
  const linkHtml = source.url
    ? '<a class="button" href="' + source.url + '" target="_blank" rel="noreferrer">' + messages.openSource + '</a>'
    : '<span class="small">' + messages.directLinkPending + '</span>';

  return [
    '<article class="source-card">',
    '<div class="meta-row">',
    renderBadge(source.category_label),
    renderBadge(source.purpose_label),
    renderBadge(source.status_label, 'status status-' + source.status),
    '</div>',
    '<h3><a href="' + detailsPath + '">' + source.name + '</a></h3>',
    '<p>' + source.summary + '</p>',
    '<footer>',
    linkHtml,
    '<a class="button secondary" href="' + detailsPath + '">' + messages.details + '</a>',
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

  countEl.textContent = interpolate(messages.resultsShown, { count: filtered.length });
  listEl.innerHTML = filtered.map(renderCard).join("") || '<p class="small">' + messages.noResults + '</p>';
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
  countEl.textContent = messages.loadFailed;
  listEl.innerHTML = '<p class="small">' + messages.loadFailedHelp + '</p>';
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

const interpolate = (template, values = {}) =>
  String(template || "").replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

const valueOrFallback = (value, fallback) =>
  value === null || value === undefined || value === "" ? fallback : escapeHtml(value);

const renderNotes = (notes = []) =>
  notes.length ? `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>` : "";

const translateMappedValue = (dictionary, value, locale) => dictionary[value]?.[locale] || value;

const localizeSource = (source, locale) => {
  const sourceCopy = locale === "es" ? spanishSourceCopy[source.slug] : null;
  const copy = localeCopy[locale];

  return {
    ...source,
    summary: sourceCopy?.summary || source.summary,
    notes: sourceCopy?.notes || source.notes,
    category_label: translateMappedValue(categoryLabels, source.category, locale),
    purpose_label: translateMappedValue(purposeLabels, source.purpose, locale),
    status_label: translateMappedValue(statusLabels, source.status, locale),
    coverage_label: translateMappedValue(coverageLabels, source.coverage, locale),
    language_label: source.language === "es" ? (locale === "es" ? "Español" : "Spanish") : source.language,
    requires_login_label:
      source.requires_login === null
        ? copy.notYetVerified
        : source.requires_login
          ? locale === "es"
            ? "Sí"
            : "Yes"
          : locale === "es"
            ? "No"
            : "No",
    owner_label: translateMappedValue(ownerLabels, source.owner, locale),
    tags: (source.tags || []).map((tag) => translateMappedValue(tagLabels, tag, locale)),
    last_verified_label: source.last_verified_at || copy.notYetVerified
  };
};

const localizedSources = Object.fromEntries(
  supportedLocales.map((locale) => [locale, rawSources.map((source) => localizeSource(source, locale))])
);

const renderAlternateLinks = (pathname) =>
  [
    ...supportedLocales.map(
      (locale) => `<link rel="alternate" hreflang="${locale}" href="${absoluteLocaleUrl(locale, pathname)}">`
    ),
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl("/")}">`
  ].join("\n    ");

const renderHead = ({ lang, title, description, canonical, alternates }) => `  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    ${alternates}
    <link rel="stylesheet" href="${withSitePath("/styles.css")}">
  </head>`;

const renderLanguageSwitcher = (locale, pathname) => {
  const copy = localeCopy[locale];

  return `<nav class="language-switcher" aria-label="${escapeHtml(copy.languageNavLabel)}">
    ${supportedLocales
      .map((candidate) => {
        const label = candidate === "es" ? "Español" : "English";
        const current = candidate === locale ? ' aria-current="page"' : "";
        return `<a href="${localePath(candidate, pathname)}"${current}>${label}</a>`;
      })
      .join("")}
  </nav>`;
};

const renderPageTopbar = (locale, pathname = "/") => `<div class="topbar">
  <a class="brand-link" href="${localePath(locale, "/")}">VeneHelp</a>
  ${renderLanguageSwitcher(locale, pathname)}
</div>`;

const persistLocaleScript = (locale) =>
  `<script>try { localStorage.setItem("venehelp-locale", ${JSON.stringify(locale)}); } catch (error) {}</script>`;

const renderLocaleIndexHtml = (locale) => {
  const copy = localeCopy[locale];
  const dataPath = localePath(locale, "/data/sources.json");
  const introHtml = interpolate(copy.findSourceIntro, {
    dataUrl: dataPath,
    dataPath
  });

  return `<!doctype html>
<html lang="${escapeHtml(copy.lang)}">
${renderHead({
  lang: copy.lang,
  title: copy.htmlTitle,
  description: copy.siteDescription,
  canonical: absoluteLocaleUrl(locale, "/"),
  alternates: renderAlternateLinks("/")
})}
  <body>
    <main>
      <section class="hero">
        <div class="shell">
          ${renderPageTopbar(locale, "/")}
        </div>
        <div class="shell hero-grid">
          <div>
            <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
            <h1>${escapeHtml(copy.heroTitle)}</h1>
            <p class="lede">${escapeHtml(copy.heroLede)}</p>
          </div>
          <aside class="hero-card">
            <h2>${escapeHtml(copy.cautionTitle)}</h2>
            <p>${escapeHtml(copy.cautionBody)}</p>
            <div class="meta-row">
              <span class="status status-unverified">${escapeHtml(copy.initialDataset)}</span>
              <span class="pill">${escapeHtml(copy.machineReadable)}</span>
              <span class="pill">${escapeHtml(copy.githubPagesReady)}</span>
            </div>
          </aside>
        </div>
        <div class="shell stats">
          <div class="stat">
            <strong data-total-sources>0</strong>
            <span>${escapeHtml(copy.stats.knownSources)}</span>
          </div>
          <div class="stat">
            <strong data-primary-sources>0</strong>
            <span>${escapeHtml(copy.stats.primaryTargets)}</span>
          </div>
          <div class="stat">
            <strong data-lead-sources>0</strong>
            <span>${escapeHtml(copy.stats.unverifiedLeads)}</span>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell panel">
          <h2>${escapeHtml(copy.findSourceTitle)}</h2>
          <p class="page-intro">${introHtml}</p>
          <div class="controls">
            <div class="field">
              <label for="search">${escapeHtml(copy.searchLabel)}</label>
              <input id="search" type="search" placeholder="${escapeHtml(copy.searchPlaceholder)}" data-search>
            </div>
            <div class="field">
              <label for="category">${escapeHtml(copy.categoryLabel)}</label>
              <select id="category" data-category>
                <option value="all">${escapeHtml(copy.allCategories)}</option>
                ${Object.entries(categoryLabels)
                  .map(([value, labels]) => `<option value="${escapeHtml(value)}">${escapeHtml(labels[locale])}</option>`)
                  .join("")}
              </select>
            </div>
            <div class="field">
              <label for="purpose">${escapeHtml(copy.purposeLabel)}</label>
              <select id="purpose" data-purpose>
                <option value="all">${escapeHtml(copy.allPurposes)}</option>
                ${Object.entries(purposeLabels)
                  .map(([value, labels]) => `<option value="${escapeHtml(value)}">${escapeHtml(labels[locale])}</option>`)
                  .join("")}
              </select>
            </div>
          </div>
          <p class="small" data-results-count>${escapeHtml(copy.loadingSources)}</p>
          <div class="source-list" data-source-list></div>
        </div>
      </section>

      <section class="section">
        <div class="shell panel">
          <h2>${escapeHtml(copy.crawlersTitle)}</h2>
          <ul>
            ${copy.crawlerNotes.map((note) => `<li>${note}</li>`).join("")}
          </ul>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="shell">
        <p>${escapeHtml(interpolate(copy.footer, { generatedAt }))}</p>
      </div>
    </footer>
    ${persistLocaleScript(locale)}
    <script>window.VENEHELP_CONFIG = ${JSON.stringify({ basePath: localeBasePath(locale), messages: copy })};</script>
    <script src="${withSitePath("/app.js")}" defer></script>
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
                  <span class="pill">${escapeHtml(source.category_label)}</span>
                  <span class="pill">${escapeHtml(source.purpose_label)}</span>
                  <span class="status status-${escapeHtml(source.status)}">${escapeHtml(source.status_label)}</span>
                </div>
                <h3><a href="${localePath(locale, `/sources/${source.slug}/`)}">${escapeHtml(source.name)}</a></h3>
                <p>${escapeHtml(source.summary)}</p>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </main>
    ${persistLocaleScript(locale)}
  </body>
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
    <main class="page">
      <div class="shell">
        ${renderPageTopbar(locale, sourcePath)}
        <p class="eyebrow"><a href="${localePath(locale, "/")}">VeneHelp</a> / <a href="${localePath(locale, "/sources/")}">${escapeHtml(copy.breadcrumbsSources)}</a></p>
        <h1>${escapeHtml(source.name)}</h1>
        <p class="page-intro">${escapeHtml(source.summary)}</p>

        <section class="page-card">
          <div class="meta-row">
            <span class="pill">${escapeHtml(source.category_label)}</span>
            <span class="pill">${escapeHtml(source.purpose_label)}</span>
            <span class="status status-${escapeHtml(source.status)}">${escapeHtml(source.status_label)}</span>
          </div>
          <div class="page-links" style="margin-top:1rem">
            ${
              source.url
                ? `<a class="button" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(copy.openSource)}</a>`
                : `<span class="small">${escapeHtml(copy.directLinkPending)}</span>`
            }
            <a class="button secondary" href="${localePath(locale, "/data/sources.json")}">${escapeHtml(copy.viewJson)}</a>
          </div>
        </section>

        <section class="page-card">
          <h2>${escapeHtml(copy.metadataTitle)}</h2>
          <dl class="definition-list">
            <div>
              <dt>${escapeHtml(copy.coverageLabelDetail)}</dt>
              <dd>${valueOrFallback(source.coverage_label, copy.notYetVerified)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.languageLabelDetail)}</dt>
              <dd>${valueOrFallback(source.language_label, copy.notYetVerified)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.requiresLoginLabel)}</dt>
              <dd>${valueOrFallback(source.requires_login_label, copy.notYetVerified)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.ownerLabelDetail)}</dt>
              <dd>${valueOrFallback(source.owner_label, copy.notYetVerified)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.crawlerPriorityLabel)}</dt>
              <dd>${valueOrFallback(source.crawler_priority, copy.notYetVerified)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.lastVerifiedLabel)}</dt>
              <dd>${valueOrFallback(source.last_verified_label, copy.notYetVerified)}</dd>
            </div>
          </dl>
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
      </div>
    </main>
    ${persistLocaleScript(locale)}
  </body>
</html>`;
};

const renderRootChooserHtml = () => `<!doctype html>
<html lang="en">
${renderHead({
  lang: "en",
  title: "VeneHelp",
  description: "Choose a language for the VeneHelp directory.",
  canonical: absoluteUrl("/"),
  alternates: renderAlternateLinks("/")
})}
  <body>
    <main class="page">
      <div class="shell">
        <section class="panel chooser-card">
          <p class="eyebrow">VeneHelp</p>
          <h1>Choose language / Elige idioma</h1>
          <p class="page-intro">${escapeHtml(localeCopy.en.chooserBody)} ${escapeHtml(localeCopy.es.chooserBody)}</p>
          <div class="chooser-actions">
            <a class="button" href="${localePath("es", "/")}" data-locale-choice="es">${escapeHtml(localeCopy.es.chooserEs)}</a>
            <a class="button secondary" href="${localePath("en", "/")}" data-locale-choice="en">${escapeHtml(localeCopy.en.chooserEn)}</a>
          </div>
          <p class="small" id="redirect-note">${escapeHtml(localeCopy.en.chooserRedirecting)} ${escapeHtml(localeCopy.es.chooserRedirecting)}</p>
        </section>
      </div>
    </main>
    <script>
      const supported = ${JSON.stringify(supportedLocales)};
      const links = {
        es: ${JSON.stringify(localePath("es", "/"))},
        en: ${JSON.stringify(localePath("en", "/"))}
      };

      const detectLocale = () => {
        const stored = (() => {
          try {
            return localStorage.getItem("venehelp-locale");
          } catch (error) {
            return null;
          }
        })();

        if (stored && supported.includes(stored)) {
          return stored;
        }

        const candidates = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
        for (const candidate of candidates) {
          const normalized = String(candidate || "").toLowerCase();
          if (normalized.startsWith("es")) return "es";
          if (normalized.startsWith("en")) return "en";
        }
        return "es";
      };

      const targetLocale = detectLocale();
      const note = document.getElementById("redirect-note");
      if (note) {
        note.textContent = targetLocale === "es"
          ? ${JSON.stringify(localeCopy.es.chooserRedirecting)}
          : ${JSON.stringify(localeCopy.en.chooserRedirecting)};
      }

      document.querySelectorAll("[data-locale-choice]").forEach((link) => {
        link.addEventListener("click", () => {
          try {
            localStorage.setItem("venehelp-locale", link.getAttribute("data-locale-choice"));
          } catch (error) {}
        });
      });

      window.setTimeout(() => {
        window.location.replace(links[targetLocale] || links.es);
      }, 900);
    </script>
  </body>
</html>`;

const renderRedirectPage = (targetPath, title) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${escapeHtml(targetPath)}">
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeHtml(targetPath)}">
    <script>window.location.replace(${JSON.stringify(targetPath)});</script>
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(targetPath)}">${escapeHtml(targetPath)}</a>.</p>
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

- Language chooser: ${absoluteUrl("/")}
- Spanish homepage: ${absoluteLocaleUrl("es", "/")}
- English homepage: ${absoluteLocaleUrl("en", "/")}
- Canonical raw dataset: ${absoluteUrl("/data/sources.json")}

## Usage notes

- Treat entries with status "unverified" or "lead" as discovery pointers.
- Prefer crawler priority 1 and 2 sources first.
- Check each origin source directly before repeating sensitive claims.
`;

const renderSitemap = () => {
  const entries = [
    absoluteUrl("/"),
    absoluteUrl("/data/sources.json"),
    ...supportedLocales.flatMap((locale) => [
      absoluteLocaleUrl(locale, "/"),
      absoluteLocaleUrl(locale, "/sources/"),
      absoluteLocaleUrl(locale, "/data/sources.json"),
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

await ensureDir(docsDir);
await fs.writeFile(path.join(docsDir, "styles.css"), styles);
await fs.writeFile(path.join(docsDir, "app.js"), appJs);
await fs.writeFile(path.join(docsDir, "index.html"), renderRootChooserHtml());
await fs.writeFile(path.join(docsDir, "robots.txt"), renderRobots());
await fs.writeFile(path.join(docsDir, "llms.txt"), renderLlms());
await fs.writeFile(path.join(docsDir, "sitemap.xml"), renderSitemap());
await fs.writeFile(path.join(docsDir, "CNAME"), `${customDomain}\n`);

const rawDataDir = path.join(docsDir, "data");
await ensureDir(rawDataDir);
await fs.writeFile(path.join(rawDataDir, "sources.json"), JSON.stringify(rawSources, null, 2) + "\n");

for (const locale of supportedLocales) {
  const localeDir = path.join(docsDir, locale);
  const localeDataDir = path.join(localeDir, "data");
  const localeSourcesDir = path.join(localeDir, "sources");

  await ensureDir(localeDir);
  await ensureDir(localeDataDir);
  await ensureDir(localeSourcesDir);

  await fs.writeFile(path.join(localeDir, "index.html"), renderLocaleIndexHtml(locale));
  await fs.writeFile(path.join(localeDataDir, "sources.json"), JSON.stringify(localizedSources[locale], null, 2) + "\n");
  await fs.writeFile(path.join(localeSourcesDir, "index.html"), renderLocalizedSourcesIndexHtml(locale));

  for (const source of localizedSources[locale]) {
    const sourceDir = path.join(localeSourcesDir, source.slug);
    await ensureDir(sourceDir);
    await fs.writeFile(path.join(sourceDir, "index.html"), renderLocalizedSourcePage(locale, source));
  }
}

const legacySourcesDir = path.join(docsDir, "sources");
await ensureDir(legacySourcesDir);
await fs.writeFile(path.join(legacySourcesDir, "index.html"), renderRedirectPage(localePath("en", "/sources/"), "Redirecting"));

for (const source of rawSources) {
  const legacySourceDir = path.join(legacySourcesDir, source.slug);
  await ensureDir(legacySourceDir);
  await fs.writeFile(
    path.join(legacySourceDir, "index.html"),
    renderRedirectPage(localePath("en", `/sources/${source.slug}/`), `Redirecting ${source.name}`)
  );
}

console.log(
  `Built ${rawSources.length} source pages per locale into ${docsDir} for ${supportedLocales.join(", ")}.`
);
