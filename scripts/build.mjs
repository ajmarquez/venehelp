import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const docsDir = path.join(rootDir, "docs");
const sourceFile = path.join(rootDir, "data", "sources.json");
const registryFile = path.join(rootDir, "data", "registry.json");

const customDomain = (process.env.SITE_DOMAIN || "directorioterremotovenezuela.org").replace(/^https?:\/\//, "").replace(/\/+$/, "");
const siteUrl = (process.env.SITE_URL || `https://${customDomain}`).replace(/\/+$/, "");
const sitePath = (process.env.SITE_PATH || "").replace(/\/+$/, "");
const cloudflareAnalyticsToken = (process.env.CLOUDFLARE_ANALYTICS_TOKEN || "").trim();
const generatedAt = new Date().toISOString();
const rawSources = JSON.parse(await fs.readFile(sourceFile, "utf8"));
const supportedLocales = ["es", "en"];
let rawRegistry;

try {
  rawRegistry = JSON.parse(await fs.readFile(registryFile, "utf8"));
} catch (error) {
  rawRegistry = {
    generated_at: generatedAt,
    schema_version: 1,
    beta: true,
    notes: ["Registry preview not generated yet."],
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
}

const withSitePath = (pathname) => `${sitePath}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
const absoluteUrl = (pathname) => `${siteUrl}${withSitePath(pathname)}`;
const localeBasePath = (locale) => withSitePath(`/${locale}`);
const localePath = (locale, pathname = "/") =>
  withSitePath(`/${locale}${pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`}`);
const absoluteLocaleUrl = (locale, pathname = "/") => `${siteUrl}${localePath(locale, pathname)}`;
const registryPath = (locale) => localePath(locale, "/registro/");
const absoluteRegistryUrl = (locale) => `${siteUrl}${registryPath(locale)}`;

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
  grid-template-columns: minmax(16rem, 2fr) minmax(10rem, 1fr) minmax(10rem, 1fr);
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

.directory-note {
  margin: 1rem 0 0;
  padding-left: 0.85rem;
  border-left: 4px solid var(--yellow);
  color: var(--muted);
  max-width: 76ch;
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
  color: var(--muted);
}

.source-list {
  display: grid;
  gap: 0;
  margin-top: 1.25rem;
  border-top: 1px solid var(--line);
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
  background: var(--red);
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

.page-card + .page-card {
  margin-top: 0;
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
  "context-and-location": { es: "Contexto y ubicación", en: "Context and location" },
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
      "Plataforma ciudadana para reportes de personas desaparecidas y otras emergencias, mencionada como un registro alternativo.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026."
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
  "kobotoolbox-terremotove": {
    summary:
      "Formulario comunitario para reportar personas desaparecidas o atrapadas, daños y necesidades de ayuda.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Podría conectarse con mapas o paneles públicos de Kobo."
    ]
  },
  "yummy-sos": {
    summary:
      "Sitio de emergencia operado por Yummy para reportar daños estructurales, ver reportes públicos y encontrar refugios tras el terremoto.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Los metadatos de la página y la navegación visible muestran flujos públicos para reportar daños, ver reportes, refugios y recursos."
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
      "Directorio de recursos de ayuda a afectados por el Terremoto en Venezuela.",
    eyebrow: "Directorio de ayuda",
    heroTitle: "VeneHelp",
    heroLede:
      "Directorio de recursos de ayuda a afectados por el Terremoto en Venezuela.",
    directoryNote:
      "Agrupamos sitios, formularios, mapas y registros que han aparecido de forma fragmentada o redundante. La meta es que personas afectadas, voluntarios, periodistas y LLMs encuentren recursos confiables desde un solo lugar.",
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
    findSourceTitle: "Recursos disponibles",
    findSourceIntro:
      "Busca por nombre o filtra por tipo de recurso. El dataset para agentes y buscadores está disponible en <a href=\"{dataUrl}\"><code>{dataPath}</code></a>.",
    searchLabel: "Buscar",
    searchPlaceholder: "Busca por nombre, categoría o etiqueta",
    categoryLabel: "Categoría",
    purposeLabel: "Propósito",
    allCategories: "Todas las categorías",
    allPurposes: "Todos los propósitos",
    loadingSources: "Cargando recursos",
    resultsShown: "{count} recursos visibles",
    noResults: "Ningún recurso coincide con los filtros actuales.",
    loadFailed: "No se pudieron cargar las fuentes",
    loadFailedHelp: "Verifica que exista el archivo JSON generado y que el sitio se esté sirviendo desde la carpeta docs.",
    openSource: "Abrir recurso",
    details: "Detalles",
    directLinkPending: "Enlace directo pendiente",
    footer:
      "VeneHelp agrupa enlaces públicos y datos estructurados para facilitar el acceso humano y la búsqueda por LLMs. Última generación: {generatedAt}.",
    allSourcesEyebrow: "Todos los recursos",
    allSourcesTitle: "Directorio de recursos",
    allSourcesIntro: "Cada recurso tiene una página estable de detalle y una exportación JSON canónica por idioma.",
    breadcrumbsSources: "Recursos",
    metadataTitle: "Metadatos",
    coverageLabelDetail: "Cobertura",
    languageLabelDetail: "Idioma",
    requiresLoginLabel: "Requiere inicio de sesión",
    ownerLabelDetail: "Responsable",
    crawlerPriorityLabel: "Prioridad para rastreo",
    lastCheckedLabel: "Última revisión de enlace",
    notYetChecked: "No revisado",
    notesTitle: "Notas",
    tagsTitle: "Etiquetas",
    viewJson: "Ver JSON",
    languageNavLabel: "Idioma",
    sourceListTitle: "Todos los recursos | VeneHelp"
  },
  en: {
    lang: "en",
    localeLabel: "English",
    alternateLocaleLabel: "Español",
    htmlTitle: "VeneHelp",
    siteDescription:
      "Directory of help resources for people affected by the earthquake in Venezuela.",
    eyebrow: "Help directory",
    heroTitle: "VeneHelp",
    heroLede:
      "Directory of help resources for people affected by the earthquake in Venezuela.",
    directoryNote:
      "We group sites, forms, maps, and registries that have appeared with fragmented or redundant information. The goal is to help affected people, volunteers, journalists, and LLMs find useful resources from one place.",
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
    findSourceTitle: "Available resources",
    findSourceIntro:
      "Search by name or filter by resource type. The dataset for agents and search systems is available at <a href=\"{dataUrl}\"><code>{dataPath}</code></a>.",
    searchLabel: "Search",
    searchPlaceholder: "Search by name, category, or tag",
    categoryLabel: "Category",
    purposeLabel: "Purpose",
    allCategories: "All categories",
    allPurposes: "All purposes",
    loadingSources: "Loading sources",
    resultsShown: "{count} resources shown",
    noResults: "No resources match the current filters.",
    loadFailed: "Unable to load sources",
    loadFailedHelp: "Check that the generated JSON file exists and the site is being served from the docs folder.",
    openSource: "Open resource",
    details: "Details",
    directLinkPending: "Direct link pending",
    footer:
      "VeneHelp groups public links and structured data to support human access and LLM search. Last generated: {generatedAt}.",
    allSourcesEyebrow: "All sources",
    allSourcesTitle: "Resource directory",
    allSourcesIntro: "Each resource has a stable detail page plus a canonical per-language JSON export.",
    breadcrumbsSources: "Sources",
    metadataTitle: "Metadata",
    coverageLabelDetail: "Coverage",
    languageLabelDetail: "Language",
    requiresLoginLabel: "Requires login",
    ownerLabelDetail: "Owner",
    crawlerPriorityLabel: "Crawler priority",
    lastCheckedLabel: "Last link check",
    notYetChecked: "Not checked",
    notesTitle: "Notes",
    tagsTitle: "Tags",
    viewJson: "View JSON",
    languageNavLabel: "Language",
    sourceListTitle: "All Sources | VeneHelp"
  }
};

const appJs = `
const config = window.VENEHELP_CONFIG || {};
const messages = config.messages || {};
const basePath = config.basePath || "";

const state = {
  registry: null,
  registryQuery: "",
  registryStatus: "all",
  sources: [],
  query: "",
  category: "all",
  purpose: "all"
};

const registryStatsEl = document.querySelector("[data-registry-stats]");
const registryMetaEl = document.querySelector("[data-registry-meta]");
const registryBodyEl = document.querySelector("[data-registry-body]");
const registryResultsEl = document.querySelector("[data-registry-results]");
const registrySearchEl = document.querySelector("[data-registry-search]");
const registryStatusEl = document.querySelector("[data-registry-status]");
const listEl = document.querySelector("[data-source-list]");
const countEl = document.querySelector("[data-results-count]");
const searchEl = document.querySelector("[data-search]");
const categoryEl = document.querySelector("[data-category]");
const purposeEl = document.querySelector("[data-purpose]");

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

const matchesQuery = (source, query) => {
  if (!query) return true;
  const haystack = [
    source.name,
    source.summary,
    source.category_label,
    source.purpose_label,
    ...(source.tags || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
};

const renderBadge = (label, className = "pill") =>
  '<span class="' + className + '">' + label + "</span>";

const matchesRegistryQuery = (record, query) => {
  if (!query) return true;
  const haystack = [
    record.name,
    record.location,
    record.source_name,
    record.status_label,
    ...(record.reported_on || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
};

const getFilteredRegistryRecords = () =>
  (state.registry?.records || []).filter((record) => {
    const matchesStatus = state.registryStatus === "all" || record.status === state.registryStatus;
    return matchesStatus && matchesRegistryQuery(record, state.registryQuery);
  });

const renderRegistry = () => {
  if (!registryStatsEl && !registryMetaEl && !registryBodyEl && !registryResultsEl) {
    return;
  }

  if (!state.registry) {
    if (registryMetaEl) {
      registryMetaEl.textContent = messages.registryLoading;
    }
    return;
  }

  const summary = state.registry.summary || {};
  if (registryMetaEl) {
    registryMetaEl.textContent = summary.is_partial
      ? interpolate(messages.registryPartialNote, {
          sampledPages: summary.sampled_pages ?? 0,
          totalPages: summary.total_pages ?? 0,
          sourceName: summary.source_name || ""
        })
      : interpolate(messages.registryFullNote, {
          sourceName: summary.source_name || ""
        });
  }

  if (registryStatsEl) {
    registryStatsEl.innerHTML = [
      '<article class="registry-stat registry-stat--missing"><strong>' + (summary.missing_count_display || "-") + '</strong><span>' + messages.registryMissingLabel + '</span></article>',
      '<article class="registry-stat registry-stat--found"><strong>' + (summary.found_count_display || "-") + '</strong><span>' + messages.registryFoundLabel + '</span></article>',
      '<article class="registry-stat registry-stat--preview"><strong>' + (summary.preview_records || 0) + '</strong><span>' + messages.registryPreviewLabel + '</span></article>'
    ].join("");
  }

  const records = getFilteredRegistryRecords();

  if (registryResultsEl) {
    registryResultsEl.textContent = interpolate(messages.registryResultsShown, { count: records.length });
  }

  if (!registryBodyEl) {
    return;
  }

  const rows = records.map((record) => {
    const nameHtml = record.detail_url
      ? '<a href="' + escapeHtml(record.detail_url) + '" target="_blank" rel="noreferrer">' + escapeHtml(record.name) + '</a>'
      : escapeHtml(record.name);

    return [
      '<tr>',
      '<td>' + nameHtml + '</td>',
      '<td><span class="status-chip status-chip--' + escapeHtml(record.status) + '">' + escapeHtml(record.status_label) + '</span></td>',
      '<td>' + escapeHtml(record.location || '') + '</td>',
      '<td>' + escapeHtml((record.reported_on || []).join(', ')) + '</td>',
      '</tr>'
    ].join("");
  });

  registryBodyEl.innerHTML = rows.join("") || '<tr><td colspan="4" class="small">' + messages.registryEmpty + '</td></tr>';
};

const renderCard = (source) => {
  const detailsPath = basePath + '/sources/' + source.slug + '/';
  const linkHtml = source.url
    ? '<a class="button" href="' + source.url + '" target="_blank" rel="noreferrer">' + messages.openSource + '</a>'
    : '<span class="small">' + messages.directLinkPending + '</span>';

  return [
    '<article class="source-card">',
    '<h3><a href="' + detailsPath + '">' + source.name + '</a></h3>',
    '<p>' + source.summary + '</p>',
    '<div class="meta-row">',
    renderBadge(source.category_label),
    renderBadge(source.purpose_label),
    '</div>',
    '<footer>',
    linkHtml,
    '<a class="button secondary" href="' + detailsPath + '">' + messages.details + '</a>',
    '</footer>',
    '</article>'
  ].join("");
};

const render = () => {
  if (!countEl || !listEl) {
    return;
  }

  const filtered = state.sources.filter((source) => {
    const matchesCategory = state.category === "all" || source.category === state.category;
    const matchesPurposeFilter = state.purpose === "all" || source.purpose === state.purpose;
    return matchesCategory && matchesPurposeFilter && matchesQuery(source, state.query);
  });

  countEl.textContent = interpolate(messages.resultsShown, { count: filtered.length });
  listEl.innerHTML = filtered.map(renderCard).join("") || '<p class="small">' + messages.noResults + '</p>';
};

const load = async () => {
  const tasks = [];

  if (registryStatsEl || registryMetaEl || registryBodyEl || registryResultsEl) {
    tasks.push(
      fetch(basePath + "/data/registry.json")
        .then((response) => response.json())
        .then((data) => {
          state.registry = data;
          renderRegistry();
        })
        .catch(() => {
          if (registryMetaEl) {
            registryMetaEl.textContent = messages.registryLoadFailed;
          }
        })
    );
  }

  if (listEl || countEl) {
    tasks.push(
      fetch(basePath + "/data/sources.json")
        .then((response) => response.json())
        .then((data) => {
          state.sources = data;
          render();
        })
        .catch(() => {
          if (countEl) {
            countEl.textContent = messages.loadFailed;
          }
          if (listEl) {
            listEl.innerHTML = '<p class="small">' + messages.loadFailedHelp + '</p>';
          }
        })
    );
  }

  await Promise.all(tasks);
};

if (searchEl) {
  searchEl.addEventListener("input", (event) => {
    state.query = normalize(event.target.value.trim());
    render();
  });
}

if (categoryEl) {
  categoryEl.addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
  });
}

if (purposeEl) {
  purposeEl.addEventListener("change", (event) => {
    state.purpose = event.target.value;
    render();
  });
}

if (registrySearchEl) {
  registrySearchEl.addEventListener("input", (event) => {
    state.registryQuery = normalize(event.target.value.trim());
    renderRegistry();
  });
}

if (registryStatusEl) {
  registryStatusEl.addEventListener("change", (event) => {
    state.registryStatus = event.target.value;
    renderRegistry();
  });
}

load();
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
    coverage_label: translateMappedValue(coverageLabels, source.coverage, locale),
    language_label: source.language === "es" ? (locale === "es" ? "Español" : "Spanish") : source.language,
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
    owner_label: translateMappedValue(ownerLabels, source.owner, locale),
    tags: (source.tags || []).map((tag) => translateMappedValue(tagLabels, tag, locale)),
    last_checked_label: source.last_checked_at || copy.notYetChecked
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

const renderCloudflareAnalyticsSnippet = () => {
  if (!cloudflareAnalyticsToken) {
    return "";
  }

  const beaconConfig = escapeHtml(JSON.stringify({ token: cloudflareAnalyticsToken }));
  return `    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${beaconConfig}'></script>\n`;
};

const renderHead = ({ lang, title, description, canonical, alternates }) => `  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    ${alternates}
    <link rel="stylesheet" href="${withSitePath("/styles.css")}">
  </head>`;

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

const renderFilterOptions = (locale, field, labels) => {
  const values = [...new Set(localizedSources[locale].map((source) => source[field]))];
  return values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(labels[value]?.[locale] || value)}</option>`)
    .join("");
};

const renderLocaleIndexHtml = (locale, options = {}) => {
  const copy = localeCopy[locale];
  const dataPath = localePath(locale, "/data/sources.json");
  const registryUrl = registryPath(locale);
  const introHtml = interpolate(copy.findSourceIntro, {
    dataUrl: dataPath,
    dataPath
  });
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
            <p class="lede">${escapeHtml(copy.heroLede)}</p>
            <p class="directory-note">${escapeHtml(copy.directoryNote)}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell panel">
          <h2>${escapeHtml(copy.registryTitle)}</h2>
          <p class="page-intro">${escapeHtml(copy.registryIntro)}</p>
          <p class="small" data-registry-meta>${escapeHtml(copy.registryLoading)}</p>
          <div class="registry-stats" data-registry-stats></div>
          <div class="page-links" style="margin-top:1rem">
            <a class="button" href="${registryUrl}">${escapeHtml(copy.registryLinkLabel)}</a>
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
                ${renderFilterOptions(locale, "category", categoryLabels)}
              </select>
            </div>
            <div class="field">
              <label for="purpose">${escapeHtml(copy.purposeLabel)}</label>
              <select id="purpose" data-purpose>
                <option value="all">${escapeHtml(copy.allPurposes)}</option>
                ${renderFilterOptions(locale, "purpose", purposeLabels)}
              </select>
            </div>
          </div>
          <p class="small" data-results-count>${escapeHtml(copy.loadingSources)}</p>
          <div class="source-list" data-source-list></div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="shell">
        <p>${escapeHtml(interpolate(copy.footer, { generatedAt }))}</p>
      </div>
    </footer>
${renderCloudflareAnalyticsSnippet()}    <script>window.VENEHELP_CONFIG = ${JSON.stringify({ basePath: appBasePath, messages: copy })};</script>
    <script src="${withSitePath("/app.js")}" defer></script>
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
${renderCloudflareAnalyticsSnippet()}    <script>window.VENEHELP_CONFIG = ${JSON.stringify({ basePath: localeBasePath(locale), messages: copy })};</script>
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
        <p class="page-intro">${escapeHtml(source.summary)}</p>

        <section class="page-card">
          <div class="meta-row">
            <span class="pill">${escapeHtml(source.category_label)}</span>
            <span class="pill">${escapeHtml(source.purpose_label)}</span>
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
              <dd>${valueOrFallback(source.coverage_label, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.languageLabelDetail)}</dt>
              <dd>${valueOrFallback(source.language_label, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.requiresLoginLabel)}</dt>
              <dd>${valueOrFallback(source.requires_login_label, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.ownerLabelDetail)}</dt>
              <dd>${valueOrFallback(source.owner_label, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.crawlerPriorityLabel)}</dt>
              <dd>${valueOrFallback(source.crawler_priority, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.lastCheckedLabel)}</dt>
              <dd>${valueOrFallback(source.last_checked_label, copy.notYetChecked)}</dd>
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
  </head>
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

VeneHelp is a public directory of missing-person reporting sources related to the Venezuela earthquake emergency.

## Preferred entrypoints

- Spanish default homepage: ${absoluteUrl("/")}
- Spanish homepage: ${absoluteLocaleUrl("es", "/")}
- English homepage: ${absoluteLocaleUrl("en", "/")}
- Spanish beta registry page: ${absoluteRegistryUrl("es")}
- English beta registry page: ${absoluteRegistryUrl("en")}
- Canonical raw dataset: ${absoluteUrl("/data/sources.json")}
- Beta registry dataset: ${absoluteUrl("/data/registry.json")}

## Usage notes

- Treat entries as directory pointers, not as endorsements or authoritative claims.
- Prefer crawler priority 1 and 2 sources first.
- Check each origin source directly before repeating sensitive claims.
`;

const renderSitemap = () => {
  const entries = [
    absoluteUrl("/"),
    absoluteUrl("/data/sources.json"),
    absoluteUrl("/data/registry.json"),
    ...supportedLocales.flatMap((locale) => [
      absoluteLocaleUrl(locale, "/"),
      absoluteRegistryUrl(locale),
      absoluteLocaleUrl(locale, "/sources/"),
      absoluteLocaleUrl(locale, "/data/sources.json"),
      absoluteLocaleUrl(locale, "/data/registry.json"),
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
await fs.writeFile(path.join(docsDir, "robots.txt"), renderRobots());
await fs.writeFile(path.join(docsDir, "llms.txt"), renderLlms());
await fs.writeFile(path.join(docsDir, "sitemap.xml"), renderSitemap());
await fs.writeFile(path.join(docsDir, "CNAME"), `${customDomain}\n`);

const rawDataDir = path.join(docsDir, "data");
await ensureDir(rawDataDir);
await fs.writeFile(path.join(rawDataDir, "sources.json"), JSON.stringify(rawSources, null, 2) + "\n");
await fs.writeFile(path.join(rawDataDir, "registry.json"), JSON.stringify(rawRegistry, null, 2) + "\n");

for (const locale of supportedLocales) {
  const localeDir = path.join(docsDir, locale);
  const localeDataDir = path.join(localeDir, "data");
  const localeSourcesDir = path.join(localeDir, "sources");

  await ensureDir(localeDir);
  await ensureDir(localeDataDir);
  await ensureDir(localeSourcesDir);
  await ensureDir(path.join(localeDir, "registro"));

  await fs.writeFile(path.join(localeDir, "index.html"), renderLocaleIndexHtml(locale));
  await fs.writeFile(path.join(localeDir, "registro", "index.html"), renderRegistryPageHtml(locale));
  await fs.writeFile(path.join(localeDataDir, "sources.json"), JSON.stringify(localizedSources[locale], null, 2) + "\n");
  await fs.writeFile(path.join(localeDataDir, "registry.json"), JSON.stringify(localizedRegistry[locale], null, 2) + "\n");
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
