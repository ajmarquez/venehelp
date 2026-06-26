const config = window.VENEHELP_CONFIG || {};
const messages = config.messages || {};
const basePath = config.basePath || "";

const state = {
  registry: null,
  sources: [],
  query: "",
  category: "all",
  purpose: "all"
};

const registryStatsEl = document.querySelector("[data-registry-stats]");
const registryMetaEl = document.querySelector("[data-registry-meta]");
const registryBodyEl = document.querySelector("[data-registry-body]");
const listEl = document.querySelector("[data-source-list]");
const countEl = document.querySelector("[data-results-count]");
const searchEl = document.querySelector("[data-search]");
const categoryEl = document.querySelector("[data-category]");
const purposeEl = document.querySelector("[data-purpose]");

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
    ...(source.tags || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
};

const renderBadge = (label, className = "pill") =>
  '<span class="' + className + '">' + label + "</span>";

const renderRegistry = () => {
  if (!registryStatsEl || !registryMetaEl || !registryBodyEl) {
    return;
  }

  if (!state.registry) {
    registryMetaEl.textContent = messages.registryLoading;
    return;
  }

  const summary = state.registry.summary || {};
  registryMetaEl.textContent = summary.is_partial
    ? interpolate(messages.registryPartialNote, {
        sampledPages: summary.sampled_pages ?? 0,
        totalPages: summary.total_pages ?? 0,
        sourceName: summary.source_name || ""
      })
    : interpolate(messages.registryFullNote, {
        sourceName: summary.source_name || ""
      });

  registryStatsEl.innerHTML = [
    '<article class="registry-stat registry-stat--missing"><strong>' + (summary.missing_count_display || "-") + '</strong><span>' + messages.registryMissingLabel + '</span></article>',
    '<article class="registry-stat registry-stat--found"><strong>' + (summary.found_count_display || "-") + '</strong><span>' + messages.registryFoundLabel + '</span></article>',
    '<article class="registry-stat registry-stat--preview"><strong>' + (summary.preview_records || 0) + '</strong><span>' + messages.registryPreviewLabel + '</span></article>'
  ].join("");

  const rows = (state.registry.records || []).map((record) => {
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
  const filtered = state.sources.filter((source) => {
    const matchesCategory = state.category === "all" || source.category === state.category;
    const matchesPurposeFilter = state.purpose === "all" || source.purpose === state.purpose;
    return matchesCategory && matchesPurposeFilter && matchesQuery(source, state.query);
  });

  countEl.textContent = interpolate(messages.resultsShown, { count: filtered.length });
  listEl.innerHTML = filtered.map(renderCard).join("") || '<p class="small">' + messages.noResults + '</p>';
};

const load = async () => {
  const [registryResponse, sourcesResponse] = await Promise.all([
    fetch(basePath + "/data/registry.json"),
    fetch(basePath + "/data/sources.json")
  ]);
  state.registry = await registryResponse.json();
  state.sources = await sourcesResponse.json();

  renderRegistry();
  render();
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

load().catch(() => {
  if (registryMetaEl) {
    registryMetaEl.textContent = messages.registryLoadFailed;
  }
  countEl.textContent = messages.loadFailed;
  listEl.innerHTML = '<p class="small">' + messages.loadFailedHelp + '</p>';
});
