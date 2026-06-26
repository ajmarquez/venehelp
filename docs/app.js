const config = window.VENEHELP_CONFIG || {};
const messages = config.messages || {};
const basePath = config.basePath || "";

const state = {
  sources: [],
  query: ""
};

const sectionEls = Array.from(document.querySelectorAll("[data-section-list]"));
const registryCountEl = document.querySelector("[data-results-count]");
const developerListEl = document.querySelector("[data-developer-list]");
const searchEl = document.querySelector("[data-search]");
const sectionOrder = ["missing", "located", "humanitarian"];

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
  const filtered = state.sources.filter((source) => matchesQuery(source, state.query));

  if (registryCountEl) {
    registryCountEl.textContent = interpolate(messages.resultsShown, { count: filtered.length });
  }

  sectionEls.forEach((el) => {
    const key = el.getAttribute("data-section-list");
    const inSection = filtered.filter((source) => (source.section || "missing") === key);
    el.innerHTML = inSection.map(renderRegistryCard).join("") || '<p class="small">' + messages.noResults + '</p>';
  });

  if (developerListEl) {
    const developerResources = buildDeveloperResources(filtered);
    developerListEl.innerHTML = developerResources.map(renderDeveloperCard).join("") || '<p class="small">' + messages.developerEmpty + '</p>';
  }
};

const load = async () => {
  if (!sectionEls.length && !registryCountEl && !developerListEl) {
    return;
  }

  try {
    const response = await fetch(basePath + "/data/sources.json");
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

load();
