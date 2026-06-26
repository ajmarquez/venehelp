import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const docsDir = path.join(rootDir, "docs");
const sourceFile = path.join(rootDir, "data", "sources.json");
const defaultCloudflareAnalyticsToken = "4a80fe27b95e4d6b990cb960bf94699d";

const customDomain = (process.env.SITE_DOMAIN || "directorioterremotovenezuela.org").replace(/^https?:\/\//, "").replace(/\/+$/, "");
const siteUrl = (process.env.SITE_URL || `https://${customDomain}`).replace(/\/+$/, "");
const sitePath = (process.env.SITE_PATH || "").replace(/\/+$/, "");
const cloudflareAnalyticsToken = (process.env.CLOUDFLARE_ANALYTICS_TOKEN ?? defaultCloudflareAnalyticsToken).trim();
const showRegistry = false;
const generatedAt = new Date().toISOString();
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

.directory-note {
  margin: 1rem 0 0;
  padding-left: 0.85rem;
  border-left: 4px solid var(--yellow);
  color: var(--muted);
  max-width: 76ch;
}

.route-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1rem;
}

.route-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem;
  background: var(--surface-muted);
}

.route-card p {
  margin: 0.75rem 0 0;
  color: var(--muted);
}

.route-links a {
  color: var(--blue);
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

.directory-split {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}

.directory-block h3 {
  margin: 0;
  font-size: 1.15rem;
}

.directory-block .small {
  margin: 0.5rem 0 0;
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
  .route-grid,
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
  hospitals: { es: "hospitales", en: "hospitals" }
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
  "kobotoolbox-terremotove": {
    summary:
      "Formulario comunitario para reportar personas desaparecidas o atrapadas tras el terremoto.",
    notes: [
      "La URL cargó correctamente durante la revisión de enlaces del 26 de junio de 2026.",
      "Sirve como una vía adicional de ingreso para reportes públicos de personas."
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
  "icrc-family-links-venezuela": {
    summary:
      "Punto de entrada humanitario de la Cruz Roja para restablecer contacto y gestionar solicitudes de búsqueda familiar relacionadas con emergencias en Venezuela.",
    notes: [
      "Ruta humanitaria prioritaria para familias que necesitan una vía de escalamiento con mayor confianza.",
      "El sitio usa controles de acceso que pueden bloquear revisiones automáticas, así que conviene verificarlo manualmente."
    ]
  },
  "localizados-venezuela": {
    summary:
      "Plataforma pública y de código abierto para buscar y aportar registros de personas ya localizadas tras el terremoto, con API pública de solo lectura para integraciones.",
    notes: [
      "La documentación de la API pública está disponible en /api y los endpoints GET de la v1 responden JSON con CORS habilitado para lectura.",
      "El proyecto aclara que es solo para personas localizadas y redirige los casos de desaparecidos a desaparecidosterremotovenezuela.com."
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
      "Directorio público de plataformas para buscar, reportar y marcar personas encontradas tras el terremoto en Venezuela.",
    eyebrow: "Directorio de personas desaparecidas",
    heroTitle: "Dónde buscar y reportar personas",
    heroLede:
      "VeneHelp reúne las plataformas públicas donde familias, voluntarios y buscadores están reportando, buscando y marcando personas como encontradas tras el terremoto en Venezuela.",
    directoryNote:
      "No recibimos reportes aquí. El objetivo es mostrar en un solo lugar qué sitios aceptan casos nuevos, cuáles tienen búsqueda pública y cuáles permiten marcar a alguien como encontrado o a salvo.",
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
    findSourceIntro:
      "Separamos el directorio entre registros para familias y recursos para desarrolladores. Usa la búsqueda para ubicar una plataforma concreta y luego revisa la sección técnica si necesitas APIs o datasets.",
    searchLabel: "Buscar",
    searchPlaceholder: "Busca por nombre, servicio o etiqueta",
    registrySectionTitle: "Registros",
    registrySectionIntro:
      "Plataformas públicas para buscar personas, reportar casos, avisar que alguien está a salvo o escalar a una ruta humanitaria.",
    developerSectionTitle: "Desarrolladores",
    developerSectionIntro:
      "APIs, datasets y proyectos open source útiles para integraciones, agentes y análisis técnico.",
    developerEmpty: "Todavía no hay recursos técnicos publicados en esta versión.",
    venehelpDatasetTitle: "Dataset público de VeneHelp",
    venehelpDatasetSummary:
      "Exportación JSON del directorio de VeneHelp para LLMs, buscadores e integraciones simples.",
    openDataset: "Abrir dataset",
    openApi: "Abrir API",
    openSourceCode: "Abrir código fuente",
    loadingSources: "Cargando recursos",
    resultsShown: "{count} registros visibles",
    noResults: "Ningún recurso coincide con los filtros actuales.",
    loadFailed: "No se pudieron cargar las fuentes",
    loadFailedHelp: "Verifica que exista el archivo JSON generado y que el sitio se esté sirviendo desde la carpeta docs.",
    openSource: "Abrir recurso",
    details: "Detalles",
    directLinkPending: "Enlace directo pendiente",
    footer:
      "VeneHelp es un directorio público de plataformas para buscar y reportar personas tras el terremoto en Venezuela. Última generación: {generatedAt}.",
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
      "Public directory of platforms to search for, report, and mark people found after the earthquake in Venezuela.",
    eyebrow: "Missing-person directory",
    heroTitle: "Where to search for and report people",
    heroLede:
      "VeneHelp gathers the public platforms where families, volunteers, and searchers are reporting, searching for, and marking people as found after the earthquake in Venezuela.",
    directoryNote:
      "We do not take reports here. The goal is to show in one place which sites accept new cases, which offer public search, and which let someone be marked as found or safe.",
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
    findSourceIntro:
      "The directory is split between registry tools for families and technical resources for developers. Use search to find a specific platform, then review the technical section if you need APIs or datasets.",
    searchLabel: "Search",
    searchPlaceholder: "Search by name, service, or tag",
    registrySectionTitle: "Registries",
    registrySectionIntro:
      "Public platforms for searching for people, filing reports, marking someone safe, or escalating through a humanitarian path.",
    developerSectionTitle: "Developers",
    developerSectionIntro:
      "APIs, datasets, and open-source projects that are useful for integrations, agents, and technical analysis.",
    developerEmpty: "No technical resources are published in this version yet.",
    venehelpDatasetTitle: "VeneHelp public dataset",
    venehelpDatasetSummary:
      "JSON export of the VeneHelp directory for LLMs, search systems, and lightweight integrations.",
    openDataset: "Open dataset",
    openApi: "Open API",
    openSourceCode: "Open source code",
    loadingSources: "Loading sources",
    resultsShown: "{count} registries shown",
    noResults: "No resources match the current filters.",
    loadFailed: "Unable to load sources",
    loadFailedHelp: "Check that the generated JSON file exists and the site is being served from the docs folder.",
    openSource: "Open resource",
    details: "Details",
    directLinkPending: "Direct link pending",
    footer:
      "VeneHelp is a public directory of platforms for searching for and reporting people after the earthquake in Venezuela. Last generated: {generatedAt}.",
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
  sources: [],
  query: ""
};

const registryListEl = document.querySelector("[data-source-list]");
const registryCountEl = document.querySelector("[data-results-count]");
const developerListEl = document.querySelector("[data-developer-list]");
const searchEl = document.querySelector("[data-search]");

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
    source.status_label,
    source.operator_type_label,
    ...(source.service_labels || []),
    ...(source.tags || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
};

const renderBadge = (label, className = "pill") =>
  '<span class="' + className + '">' + label + "</span>";

const renderRegistryCard = (source) => {
  const detailsPath = basePath + '/sources/' + source.slug + '/';
  const linkHtml = source.url
    ? '<a class="button" href="' + source.url + '" target="_blank" rel="noreferrer">' + messages.openSource + '</a>'
    : '<span class="small">' + messages.directLinkPending + '</span>';
  const serviceHtml = (source.service_labels || [])
    .slice(0, 4)
    .map((label) => renderBadge(label))
    .join("");

  return [
    '<article class="source-card">',
    '<h3><a href="' + detailsPath + '">' + source.name + '</a></h3>',
    '<p>' + source.summary + '</p>',
    '<p class="small source-facts">' +
      escapeHtml(messages.publicSearchLabelDetail) + ': ' + escapeHtml(source.public_search_label_value) +
      ' · ' +
      escapeHtml(messages.acceptsReportsLabelDetail) + ': ' + escapeHtml(source.accepts_reports_label_value) +
      ' · ' +
      escapeHtml(messages.reportFoundLabelDetail) + ': ' + escapeHtml(source.report_found_label_value) +
      '</p>',
    serviceHtml ? '<div class="meta-row">' + serviceHtml + '</div>' : '',
    '<footer>',
    linkHtml,
    '<a class="button secondary" href="' + detailsPath + '">' + messages.details + '</a>',
    '</footer>',
    '</article>'
  ].join("");
};

const buildDeveloperResources = (sources) => {
  const datasetPath = basePath + "/data/sources.json";
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
    .filter((source) => source.api_url || source.source_code_url)
    .forEach((source) => {
      const links = [];
      if (source.api_url) {
        links.push({ href: source.api_url, label: messages.openApi, primary: true, external: true });
      }
      if (source.source_code_url) {
        links.push({ href: source.source_code_url, label: messages.openSourceCode, secondary: true, external: true });
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
  if (!registryCountEl || !registryListEl || !developerListEl) {
    return;
  }

  const filtered = state.sources.filter((source) => matchesQuery(source, state.query));
  const developerResources = buildDeveloperResources(filtered);

  registryCountEl.textContent = interpolate(messages.resultsShown, { count: filtered.length });
  registryListEl.innerHTML = filtered.map(renderRegistryCard).join("") || '<p class="small">' + messages.noResults + '</p>';
  developerListEl.innerHTML = developerResources.map(renderDeveloperCard).join("") || '<p class="small">' + messages.developerEmpty + '</p>';
};

const load = async () => {
  if (!registryListEl && !registryCountEl && !developerListEl) {
    return;
  }

  try {
    const response = await fetch(basePath + "/data/sources.json");
    state.sources = await response.json();
    render();
  } catch (error) {
    if (registryCountEl) {
      registryCountEl.textContent = messages.loadFailed;
    }
    if (registryListEl) {
      registryListEl.innerHTML = '<p class="small">' + messages.loadFailedHelp + '</p>';
    }
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
            <p class="lede">${escapeHtml(copy.heroLede)}</p>
            <p class="directory-note">${escapeHtml(copy.directoryNote)}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell panel" id="directorio">
          <h2>${escapeHtml(copy.findSourceTitle)}</h2>
          <p class="page-intro">${escapeHtml(copy.findSourceIntro)}</p>
          <div class="controls">
            <div class="field">
              <label for="search">${escapeHtml(copy.searchLabel)}</label>
              <input id="search" type="search" placeholder="${escapeHtml(copy.searchPlaceholder)}" data-search>
            </div>
          </div>
          <div class="directory-split">
            <section class="directory-block">
              <h3>${escapeHtml(copy.registrySectionTitle)}</h3>
              <p class="small">${escapeHtml(copy.registrySectionIntro)}</p>
              <p class="small" data-results-count>${escapeHtml(copy.loadingSources)}</p>
              <div class="source-list" data-source-list></div>
            </section>
            <section class="directory-block">
              <h3>${escapeHtml(copy.developerSectionTitle)}</h3>
              <p class="small">${escapeHtml(copy.developerSectionIntro)}</p>
              <div class="source-list" data-developer-list></div>
            </section>
          </div>
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
        <p class="page-intro">${escapeHtml(source.summary)}</p>

        <section class="page-card">
          <div class="meta-row">
            <span class="pill">${escapeHtml(source.status_label)}</span>
            <span class="pill">${escapeHtml(source.operator_type_label)}</span>
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
              <dt>${escapeHtml(copy.statusLabelDetail)}</dt>
              <dd>${valueOrFallback(source.status_label, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.operatorTypeLabelDetail)}</dt>
              <dd>${valueOrFallback(source.operator_type_label, copy.notYetChecked)}</dd>
            </div>
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
              <dt>${escapeHtml(copy.acceptsReportsLabelDetail)}</dt>
              <dd>${valueOrFallback(source.accepts_reports_label_value, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.publicSearchLabelDetail)}</dt>
              <dd>${valueOrFallback(source.public_search_label_value, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.reportFoundLabelDetail)}</dt>
              <dd>${valueOrFallback(source.report_found_label_value, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.publicContactLabelDetail)}</dt>
              <dd>${
                source.public_contact && source.public_contact !== copy.notYetChecked
                  ? `<a href="${escapeHtml(source.public_contact)}" target="_blank" rel="noreferrer">${escapeHtml(source.public_contact)}</a>`
                  : escapeHtml(copy.notYetChecked)
              }</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.publicApiLabelDetail)}</dt>
              <dd>${
                source.api_url && source.api_url !== copy.notYetChecked
                  ? `<a href="${escapeHtml(source.api_url)}" target="_blank" rel="noreferrer">${escapeHtml(source.api_url)}</a>`
                  : escapeHtml(copy.notYetChecked)
              }</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.sourceCodeLabelDetail)}</dt>
              <dd>${
                source.source_code_url && source.source_code_url !== copy.notYetChecked
                  ? `<a href="${escapeHtml(source.source_code_url)}" target="_blank" rel="noreferrer">${escapeHtml(source.source_code_url)}</a>`
                  : escapeHtml(copy.notYetChecked)
              }</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.ownerLabelDetail)}</dt>
              <dd>${valueOrFallback(source.owner_label, copy.notYetChecked)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(copy.servicesLabelDetail)}</dt>
              <dd>${(source.service_labels || []).map((label) => `<span class="pill">${escapeHtml(label)}</span>`).join(" ") || escapeHtml(copy.notYetChecked)}</dd>
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

VeneHelp is a public directory of search, reporting, and aid sources related to the Venezuela earthquake emergency.

## Preferred entrypoints

- Spanish default homepage: ${absoluteUrl("/")}
- Spanish homepage: ${absoluteLocaleUrl("es", "/")}
- English homepage: ${absoluteLocaleUrl("en", "/")}
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
    absoluteUrl("/data/sources.json"),
    ...(showRegistry ? [absoluteUrl("/data/registry.json")] : []),
    ...supportedLocales.flatMap((locale) => [
      absoluteLocaleUrl(locale, "/"),
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

  await ensureDir(localeDir);
  await ensureDir(localeDataDir);
  await ensureDir(localeSourcesDir);
  if (showRegistry) {
    await ensureDir(path.join(localeDir, "registro"));
  }

  await fs.writeFile(path.join(localeDir, "index.html"), renderLocaleIndexHtml(locale));
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
