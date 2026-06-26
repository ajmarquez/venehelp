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
