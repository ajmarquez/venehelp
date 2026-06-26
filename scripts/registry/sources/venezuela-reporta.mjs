import { decodeHtml, mapLimit, normalizeText, parseAgeAndLocation, parseDisplayNumber, preferredStatus, stripTags } from "../lib.mjs";

const SOURCE_NAME = "Venezuela Reporta";
const SOURCE_SLUG = "venezuela-reporta";
const BASE_URL = "https://venezuelareporta.org";
const formatCount = (value) => (value === null ? null : new Intl.NumberFormat("es-VE").format(value));

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; VeneHelpBot/0.1; +https://directorioterremotovenezuela.org/)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
};

const parseHomepageCounts = (html) => {
  const missingMatch = html.match(/<span class="font-extrabold">([0-9.]+)<\/span>\s*personas desaparecidas/i);
  const foundMatch = html.match(/<a class="font-semibold text-encontrado-ink hover:underline"[^>]*>([0-9.]+).*?ya encontradas/i);
  const missingCount = parseDisplayNumber(missingMatch?.[1]);
  const foundCount = parseDisplayNumber(foundMatch?.[1]);

  return {
    missing_count_display: formatCount(missingCount),
    missing_count: missingCount,
    found_count_display: formatCount(foundCount),
    found_count: foundCount
  };
};

const parseSearchSummary = (html) => {
  const cleanHtml = html.replace(/<!-- -->/g, "");
  const totalMatch = cleanHtml.match(/>([0-9.]+)\s+resultados/i);
  const pageMatch = cleanHtml.match(/P[aá]gina\s+(\d+)\s+de\s+(\d+)/i);
  const totalResults = parseDisplayNumber(totalMatch?.[1]);

  return {
    total_results_display: formatCount(totalResults),
    total_results: totalResults,
    current_page: pageMatch ? Number(pageMatch[1]) : 1,
    total_pages: pageMatch ? Number(pageMatch[2]) : 1
  };
};

const parseReportedOn = (text) => {
  const clean = stripTags(text);
  if (!clean) return [SOURCE_NAME];

  const viaMatch = clean.match(/^v[ií]a\s+(.+)$/i);
  if (viaMatch) {
    return [SOURCE_NAME, viaMatch[1].trim()];
  }

  return [SOURCE_NAME];
};

const parseStatus = (text) => {
  const clean = stripTags(text).toLowerCase();
  if (clean.includes("encontrado")) return "found";
  if (clean.includes("a salvo")) return "safe";
  return "missing";
};

const parseCards = (html) => {
  const cards = [];
  const cardRegex = /<a class="card group overflow-hidden transition hover:shadow-lg" href="([^"]+)">([\s\S]*?)<\/a>/g;
  let match;

  while ((match = cardRegex.exec(html))) {
    const href = match[1];
    const block = match[2];

    const statusMatch = block.match(/>(Se busca|A salvo|Encontrado)</i);
    const nameMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const subtitleMatch = block.match(/<p class="truncate text-sm text-ink-soft">([\s\S]*?)<\/p>/i);
    const sourceMatch = block.match(/<p class="mt-1 truncate text-\[11px\] text-ink-mute">([\s\S]*?)<\/p>/i);

    if (!nameMatch) {
      continue;
    }

    const { age, location } = parseAgeAndLocation(subtitleMatch?.[1]);
    const recordId = href.split("/reporte/")[1] || href;

    cards.push({
      source_slug: SOURCE_SLUG,
      source_name: SOURCE_NAME,
      source_record_id: recordId,
      detail_url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
      name: stripTags(nameMatch[1]),
      normalized_name: normalizeText(nameMatch[1]),
      status: parseStatus(statusMatch?.[1] || ""),
      age,
      location,
      reported_on: parseReportedOn(sourceMatch?.[1] || "")
    });
  }

  return cards;
};

const canonicalizePreview = (records) => {
  const grouped = new Map();

  for (const record of records) {
    const baseKey = record.age !== null || record.location
      ? `${record.normalized_name}|${record.age ?? ""}|${normalizeText(record.location).slice(0, 80)}`
      : `${record.source_slug}|${record.source_record_id}`;

    const existing = grouped.get(baseKey);
    if (!existing) {
      grouped.set(baseKey, {
        id: baseKey,
        name: record.name,
        status: record.status,
        age: record.age,
        location: record.location,
        reported_on: [...record.reported_on],
        source_records: 1,
        detail_url: record.detail_url
      });
      continue;
    }

    existing.status = preferredStatus(existing.status, record.status);
    existing.source_records += 1;
    existing.reported_on = [...new Set(existing.reported_on.concat(record.reported_on))];

    if (!existing.location && record.location) {
      existing.location = record.location;
    }

    if (existing.age === null && record.age !== null) {
      existing.age = record.age;
    }
  }

  return [...grouped.values()];
};

export const collectVenezuelaReporta = async ({ maxPages = 5, concurrency = 4 } = {}) => {
  const [homepageHtml, firstSearchHtml] = await Promise.all([
    fetchText(`${BASE_URL}/`),
    fetchText(`${BASE_URL}/buscar`)
  ]);

  const counts = parseHomepageCounts(homepageHtml);
  const summary = parseSearchSummary(firstSearchHtml);
  const totalPages = summary.total_pages || 1;
  const sampledPages = Math.min(maxPages, totalPages);
  const pageNumbers = Array.from({ length: sampledPages }, (_, index) => index + 1);

  const pageHtml = await mapLimit(pageNumbers, concurrency, async (page) => {
    if (page === 1) {
      return firstSearchHtml;
    }

    return fetchText(`${BASE_URL}/buscar?page=${page}`);
  });

  const rawRecords = pageHtml.flatMap((html) => parseCards(html));
  const previewRecords = canonicalizePreview(rawRecords);

  return {
    source: {
      slug: SOURCE_SLUG,
      name: SOURCE_NAME,
      url: `${BASE_URL}/buscar`
    },
    summary: {
      is_partial: sampledPages < totalPages,
      sampled_pages: sampledPages,
      total_pages: totalPages,
      total_results: summary.total_results,
      total_results_display: summary.total_results_display,
      missing_count: counts.missing_count,
      missing_count_display: counts.missing_count_display,
      found_count: counts.found_count,
      found_count_display: counts.found_count_display,
      preview_records: previewRecords.length,
      raw_records: rawRecords.length
    },
    previewRecords
  };
};
