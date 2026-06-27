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

  return [
    '<article class="labs-match-card">',
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
    (otherCandidates.length
      ? '<div class="labs-candidate-list"><h4>' + escapeHtml(messages.labsOtherCandidatesTitle) + '</h4>' +
          otherCandidates.map((candidate) => '<div class="labs-candidate-item"><strong>' + escapeHtml(candidate.locatedName || messages.labsNoValue) + '</strong> · ' + escapeHtml(String(candidate.scorePercent != null ? candidate.scorePercent : Math.round((Number(candidate.score) || 0) * 100))) + '% · ' + escapeHtml(candidate.locatedHospital || messages.labsNoValue) + '</div>').join("") +
        '</div>'
      : ''),
    '</article>'
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
