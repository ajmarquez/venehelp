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
  String(template || "").replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

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
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
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
  const attribution = escapeHtml(messages.statBySite) + (stats.as_of ? ' · ' + escapeHtml(formatAsOf(stats.as_of)) : '');
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
