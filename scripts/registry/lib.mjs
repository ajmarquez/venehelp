const STATUS_PRIORITY = {
  missing: 1,
  safe: 2,
  found: 3
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const decodeHtml = (value) =>
  String(value || "")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

export const stripTags = (value) => decodeHtml(String(value || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

export const parseDisplayNumber = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
};

export const parseAgeAndLocation = (value) => {
  const text = stripTags(value);
  const pieces = text.split("·").map((piece) => piece.trim()).filter(Boolean);
  let age = null;
  let locationPieces = pieces;

  if (pieces.length > 0) {
    const match = pieces[0].match(/^(\d+)\s*a(?:n|ñ)os?$/i);
    if (match) {
      age = Number(match[1]);
      locationPieces = pieces.slice(1);
    }
  }

  return {
    age,
    location: locationPieces.join(" · ") || null
  };
};

export const personKey = (record) => {
  const nameKey = normalizeText(record.name);
  const locationKey = normalizeText(record.location).slice(0, 80);

  if (record.age !== null && locationKey) {
    return `${nameKey}|${record.age}|${locationKey}`;
  }

  if (locationKey) {
    return `${nameKey}|${locationKey}`;
  }

  if (record.age !== null) {
    return `${nameKey}|${record.age}`;
  }

  return `${record.source_slug}|${record.source_record_id}`;
};

export const preferredStatus = (currentStatus, nextStatus) =>
  STATUS_PRIORITY[nextStatus] > STATUS_PRIORITY[currentStatus] ? nextStatus : currentStatus;

export const mapLimit = async (items, limit, iteratee) => {
  const results = new Array(items.length);
  let index = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await iteratee(items[current], current);
    }
  });

  await Promise.all(workers);
  return results;
};
