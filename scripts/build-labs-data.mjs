import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const docsDir = path.join(rootDir, "docs");
const outDirs = [
  path.join(docsDir, "labs", "data"),
  path.join(docsDir, "es", "labs", "data"),
  path.join(docsDir, "en", "labs", "data")
];

const generatedAt = new Date().toISOString();
const userAgent = "VeneHelpLabsBot/1.0 (+https://directorioterremotovenezuela.org/labs/)";
const timeoutMs = 20_000;

const locationStopwords = new Set([
  "DE", "DEL", "LA", "LAS", "LOS", "EL", "EN", "Y", "A", "AL", "UN", "UNA", "POR",
  "PERSONA", "PERSONAS", "DESAPARECIDA", "DESAPARECIDO", "FAMILIA", "PAREJA", "SE",
  "ENCUENTRA", "TRAS", "TERREMOTO", "EDIFICIO", "RESIDENCIAS", "HOTEL", "AVENIDA",
  "CALLE", "SEÑOR", "SEÑORA", "TRIAJE", "TRAUMA", "SHOCK", "CONTACTO", "CI"
]);

const nameBlacklist = new Set([
  "HOTEL", "EDIFICIO", "RESIDENCIAS", "CENTRO", "COMERCIAL", "UNIVERSIDAD", "AVENIDA",
  "CALLE", "CARRETERA", "AEROPUERTO", "PUNTO", "ACOPIO", "REFUGIO", "ALBERGUE", "TÍA",
  "FAMILIA", "PAREJA", "PERSONAS", "TRAUMA", "SHOCK", "TRIAJE", "COLEGIO", "CLINICA",
  "HOSPITAL", "APARTAMENTOS", "RESIDENCIA", "RESIDENCIAL", "CC"
]);

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": userAgent, accept: "application/json" },
      redirect: "follow",
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const writeJsonEverywhere = async (filename, value) => {
  const json = JSON.stringify(value, null, 2) + "\n";
  for (const dir of outDirs) {
    await ensureDir(dir);
    await fs.writeFile(path.join(dir, filename), json);
  }
};

const stripAccents = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "");

const normalizeWhitespace = (value) => String(value || "").replace(/\s+/g, " ").trim();

const normalizeName = (value) =>
  normalizeWhitespace(
    stripAccents(value)
      .toUpperCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"“”'’[\]\\|+<>]/g, " ")
  );

const tokenize = (value) =>
  normalizeName(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

const significantTokens = (value) =>
  tokenize(value).filter((token) => token.length > 2 && !locationStopwords.has(token));

const unique = (values) => [...new Set(values.filter(Boolean))];

const extractEmails = (value) =>
  unique((String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((email) => email.toLowerCase()));

const extractPhones = (value) => {
  const matches = String(value || "").match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || [];
  return unique(
    matches
      .map((match) => match.replace(/[^\d+]/g, ""))
      .filter((digits) => digits.replace(/\D/g, "").length >= 8 && digits.replace(/\D/g, "").length <= 15)
  );
};

const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

const extractCedula = (value, { allowImplicit = true } = {}) => {
  const text = String(value || "");
  const explicit = text.match(/\b(?:C\.?\s*I\.?|CI|CEDULA|C[EÉ]DULA)\s*[:#-]?\s*(\d{5,10})\b/i);
  if (explicit) return explicit[1];

  if (!allowImplicit) return null;

  const withoutPhones = text.replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, " ");
  const implicit = withoutPhones.match(/\b(\d{5,9})\b/);
  return implicit ? implicit[1] : null;
};

const extractAge = (value) => {
  const match = String(value || "").match(/\b(\d{1,3})\s*a(?:ñ|n)os\b/i);
  if (!match) return null;
  const age = Number.parseInt(match[1], 10);
  return Number.isFinite(age) ? age : null;
};

const parseGeoPoint = (value) => {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Number.parseFloat(part));

  if (parts.length < 2 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  return { lat: parts[0], lon: parts[1] };
};

const looksLikeUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const titleCase = (value) =>
  normalizeWhitespace(
    String(value || "")
      .toLocaleLowerCase("es-VE")
      .replace(/(^|[\s'’-]+)(\p{L})/gu, (_, prefix, char) => prefix + char.toLocaleUpperCase("es-VE"))
  );

const extractLikelyName = (value) => {
  const text = normalizeWhitespace(String(value || ""));
  if (!text) return { name: null, reason: "empty" };

  const upper = normalizeName(text);
  if (/^(EDIFICIO|HOTEL|RESIDENCIAS|RESIDENCIAL|CENTRO COMERCIAL|APARTAMENTOS|COLEGIO)\b/.test(upper)) {
    return { name: null, reason: "place-report" };
  }
  if (/\bFAMILIA\b/.test(upper)) return { name: null, reason: "family-report" };
  if (/\bPAREJA\b/.test(upper)) return { name: null, reason: "group-report" };
  if (/\bPERSONAS?\s+ATRAPADAS\b/.test(upper)) return { name: null, reason: "group-report" };

  const cleaned = text
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:Desaparecid[oa]|Desaparecido el se[ñn]or|Desaparecida la se[ñn]ora|Se encuentra desaparecid[oa]|Persona desaparecida)\b/gi, " ")
    .replace(/\b(?:C\.?\s*I\.?|CI|CEDULA|C[EÉ]DULA)\b.*$/i, " ")
    .replace(/[/:]/g, " ");

  const candidates = cleaned.match(/\b[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ'’-]+(?:\s+[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ'’-]+){1,4}\b/g) || [];

  for (const candidate of candidates) {
    const tokens = tokenize(candidate);
    if (tokens.length < 2 || tokens.length > 5) continue;
    if (tokens.some((token) => nameBlacklist.has(token))) continue;
    if (tokens.filter((token) => token.length > 1).length < 2) continue;
    return { name: titleCase(candidate), reason: "parsed-from-text" };
  }

  return { name: null, reason: "no-clear-name" };
};

const stringSimilarity = (left, right) => {
  if (!left || !right) return 0;
  if (left === right) return 1;

  const a = left.replace(/\s+/g, "");
  const b = right.replace(/\s+/g, "");
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;

  const grams = (value) => {
    const map = new Map();
    for (let index = 0; index < value.length - 1; index += 1) {
      const gram = value.slice(index, index + 2);
      map.set(gram, (map.get(gram) || 0) + 1);
    }
    return map;
  };

  const gramsA = grams(a);
  const gramsB = grams(b);
  let overlap = 0;
  for (const [gram, count] of gramsA.entries()) {
    overlap += Math.min(count, gramsB.get(gram) || 0);
  }
  return (2 * overlap) / (Math.max(1, a.length - 1) + Math.max(1, b.length - 1));
};

const tokenOverlap = (left, right) => {
  const leftTokens = significantTokens(left);
  const rightTokens = significantTokens(right);
  if (!leftTokens.length || !rightTokens.length) return 0;
  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);
  let overlap = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) overlap += 1;
  }
  return overlap / Math.max(leftSet.size, rightSet.size);
};

const locationOverlap = (missingText, locatedText) => {
  const leftTokens = significantTokens(missingText);
  const rightTokens = significantTokens(locatedText);
  if (!leftTokens.length || !rightTokens.length) return 0;
  const rightSet = new Set(rightTokens);
  let overlap = 0;
  for (const token of new Set(leftTokens)) {
    if (rightSet.has(token)) overlap += 1;
  }
  return overlap / Math.max(1, Math.min(new Set(leftTokens).size, rightSet.size));
};

const parseKoboMissingRecord = (row) => {
  const event = String(row.Evento || "");
  const description = normalizeWhitespace(row.Descripci_n_del_evento || "");
  const additional = normalizeWhitespace(row.Informaci_n_adicional || "");
  const linkField = normalizeWhitespace(row.Enlace || "");
  const freeTextParts = [description, additional, looksLikeUrl(linkField) ? "" : linkField].filter(Boolean);
  const freeText = freeTextParts.join(" | ");
  const nameParse = extractLikelyName(description);
  const cedula = extractCedula([description, additional, linkField].join(" "), { allowImplicit: false })
    || extractCedula(description, { allowImplicit: true });
  const age = extractAge([description, additional, linkField].join(" "));
  const contacts = unique([...extractPhones(additional), ...extractPhones(linkField), ...extractEmails(additional), ...extractEmails(linkField)]);
  const point = parseGeoPoint(row.Ubicaci_n);
  const isMatchable = Boolean(nameParse.name || cedula);

  return {
    id: `kobo-${row._id}`,
    source: "kobotoolbox-terremotove",
    sourceRecordId: String(row._id),
    sourceUrl: looksLikeUrl(linkField) ? linkField : null,
    submittedAt: row._submission_time || null,
    event,
    category: event.includes("familia_desaparecida") ? "missing-family" : "missing-person",
    rawDescription: description,
    rawAdditional: additional || null,
    rawLinkField: linkField || null,
    freeText,
    name: nameParse.name,
    normalizedName: nameParse.name ? normalizeName(nameParse.name) : null,
    cedula,
    age,
    contacts,
    geo: point,
    locationText: freeText,
    isMatchable,
    notMatchableReason: isMatchable ? null : nameParse.reason
  };
};

const parseLocalizadosRecord = (row) => ({
  id: `localizados-${row.slug}`,
  source: "localizados-venezuela",
  sourceRecordId: row.slug,
  sourceUrl: `https://localizadosvenezuela.com/buscar/${row.slug}`,
  publishedAt: row.publicadoEn || null,
  name: titleCase(row.nombreCompleto || ""),
  normalizedName: row.nombreCompleto ? normalizeName(row.nombreCompleto) : null,
  cedula: row.cedula ? digitsOnly(row.cedula) : null,
  age: row.edad ? Number.parseInt(String(row.edad), 10) || null : null,
  condition: row.condicion || null,
  locationName: row.lugarNombre || null,
  locationSlug: row.lugarSlug || null,
  address: row.direccion || null,
  sourceFile: row.fuente?.nombre || null
});

const dedupeLocatedRecords = (records) => {
  const byKey = new Map();
  for (const record of records) {
    const key = record.cedula
      ? `cedula:${record.cedula}`
      : `name:${record.normalizedName || record.id}|age:${record.age || ""}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        ...record,
        aliases: unique([record.name]),
        hospitals: unique([record.locationName].filter(Boolean)),
        addresses: unique([record.address].filter(Boolean)),
        sourceRecordIds: [record.sourceRecordId]
      });
      continue;
    }

    existing.aliases = unique([...existing.aliases, record.name]);
    existing.hospitals = unique([...existing.hospitals, record.locationName]);
    existing.addresses = unique([...existing.addresses, record.address]);
    existing.sourceRecordIds = unique([...existing.sourceRecordIds, record.sourceRecordId]);
    if (!existing.age && record.age) existing.age = record.age;
    if (!existing.cedula && record.cedula) existing.cedula = record.cedula;
    if (!existing.locationName && record.locationName) existing.locationName = record.locationName;
    if (!existing.address && record.address) existing.address = record.address;
  }
  return [...byKey.values()];
};

const scoreCandidate = (missingRecord, locatedRecord) => {
  const reasons = [];
  let score = 0;
  const identityExact = Boolean(
    missingRecord.cedula && locatedRecord.cedula && missingRecord.cedula === locatedRecord.cedula
  );
  const identityConflict = Boolean(
    missingRecord.cedula && locatedRecord.cedula && missingRecord.cedula !== locatedRecord.cedula
  );

  if (identityExact) {
    score = 0.99;
    reasons.push("Exact cedula match");
  }

  const normalizedMissingName = missingRecord.normalizedName;
  const normalizedLocatedName = locatedRecord.normalizedName;
  const nameScore = normalizedMissingName && normalizedLocatedName
    ? Math.max(
        stringSimilarity(normalizedMissingName, normalizedLocatedName),
        tokenOverlap(normalizedMissingName, normalizedLocatedName)
      )
    : 0;

  if (normalizedMissingName && normalizedLocatedName) {
    if (normalizedMissingName === normalizedLocatedName) {
      reasons.push("Exact normalized name");
      score = Math.max(score, 0.94);
    } else if (nameScore >= 0.92) {
      reasons.push("Very strong name similarity");
      score = Math.max(score, 0.88);
    } else if (nameScore >= 0.82) {
      reasons.push("Strong name similarity");
      score = Math.max(score, 0.78);
    } else if (nameScore >= 0.72) {
      reasons.push("Moderate name similarity");
      score = Math.max(score, 0.68);
    }
  }

  let ageDiff = null;
  if (missingRecord.age && locatedRecord.age) {
    ageDiff = Math.abs(missingRecord.age - locatedRecord.age);
    if (ageDiff === 0) {
      reasons.push("Exact age match");
      score += 0.06;
    } else if (ageDiff <= 2) {
      reasons.push("Close age");
      score += 0.03;
    } else if (ageDiff >= 10) {
      score -= 0.08;
      reasons.push("Age conflict");
    }
  }

  const locationScore = locationOverlap(
    missingRecord.locationText,
    [locatedRecord.locationName, locatedRecord.address].filter(Boolean).join(" ")
  );
  if (locationScore >= 0.5) {
    reasons.push("Location overlap");
    score += 0.05;
  } else if (locationScore >= 0.25) {
    reasons.push("Weak location overlap");
    score += 0.02;
  }

  score = Math.max(0, Math.min(0.99, score));

  if (identityConflict) {
    score = Math.max(0, score - 0.12);
    reasons.push("Different cedula");
  }

  let confidence = "low";
  if (score >= 0.93) confidence = "high";
  else if (score >= 0.8) confidence = "medium";

  return {
    score: Number(score.toFixed(3)),
    scorePercent: Math.round(score * 100),
    confidence,
    reasons,
    nameScore: Number(nameScore.toFixed(3)),
    locationScore: Number(locationScore.toFixed(3)),
    identitySignal: identityExact ? "exact" : identityConflict ? "conflict" : "none",
    ageDiff
  };
};

const buildCandidateMatches = (missingRecords, locatedRecords) => {
  const groups = [];
  const flat = [];

  for (const missingRecord of missingRecords) {
    if (!missingRecord.isMatchable) continue;

    const candidates = [];
    for (const locatedRecord of locatedRecords) {
      const scored = scoreCandidate(missingRecord, locatedRecord);
      if (scored.score < 0.68) continue;
      candidates.push({
        missingId: missingRecord.id,
        locatedId: locatedRecord.id,
        missingName: missingRecord.name || missingRecord.rawDescription,
        locatedName: locatedRecord.name,
        locatedHospital: locatedRecord.locationName,
        locatedAddress: locatedRecord.address,
        locatedSourceUrl: locatedRecord.sourceUrl,
        locatedCondition: locatedRecord.condition,
        locatedSourceFile: locatedRecord.sourceFile,
        missingCedula: missingRecord.cedula,
        locatedCedula: locatedRecord.cedula,
        missingAge: missingRecord.age,
        locatedAge: locatedRecord.age,
        ...scored
      });
    }

    candidates.sort((left, right) => right.score - left.score);
    const topCandidates = candidates.slice(0, 5);
    if (!topCandidates.length) continue;

    groups.push({
      missing: {
        id: missingRecord.id,
        name: missingRecord.name,
        rawDescription: missingRecord.rawDescription,
        cedula: missingRecord.cedula,
        age: missingRecord.age,
        contacts: missingRecord.contacts,
        sourceUrl: missingRecord.sourceUrl,
        submittedAt: missingRecord.submittedAt
      },
      candidates: topCandidates
    });
    flat.push(...topCandidates);
  }

  return {
    grouped: groups.sort((left, right) => {
      const leftTop = left.candidates[0]?.score || 0;
      const rightTop = right.candidates[0]?.score || 0;
      return rightTop - leftTop;
    }),
    flat: flat.sort((left, right) => right.score - left.score)
  };
};

const fetchAllKoboRows = async () => {
  let url = "https://kf.kobotoolbox.org/api/v2/assets/a8XWDsdUcpBzXGtgQmiiro/data.json?limit=100";
  const rows = [];
  while (url) {
    const page = await fetchJson(url);
    rows.push(...(page.results || []));
    url = page.next || null;
  }
  return rows;
};

const fetchAllLocalizadosRows = async () => {
  const rows = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const payload = await fetchJson(`https://localizadosvenezuela.com/api/v1/localizados?page=${page}&limit=200`);
    rows.push(...(payload.data || []));
    totalPages = Number(payload.meta?.totalPages || 1);
    page += 1;
  }
  return rows;
};

const buildSummary = ({ koboRows, missingRecords, localizadosRaw, localizadosDeduped, candidatesFlat }) => {
  const eventCounts = {};
  for (const row of koboRows) {
    const key = row.Evento || "<missing>";
    eventCounts[key] = (eventCounts[key] || 0) + 1;
  }

  return {
    generatedAt,
    sources: {
      kobo: {
        assetUid: "a8XWDsdUcpBzXGtgQmiiro",
        rows: koboRows.length,
        eventCounts
      },
      localizados: {
        rawRows: localizadosRaw.length,
        dedupedRows: localizadosDeduped.length
      }
    },
    missing: {
      totalRecords: missingRecords.length,
      matchableRecords: missingRecords.filter((record) => record.isMatchable).length,
      withCedula: missingRecords.filter((record) => record.cedula).length
    },
    matching: {
      candidatePairs: candidatesFlat.length,
      highConfidence: candidatesFlat.filter((candidate) => candidate.confidence === "high").length,
      mediumConfidence: candidatesFlat.filter((candidate) => candidate.confidence === "medium").length
    }
  };
};

const main = async () => {
  const koboRows = await fetchAllKoboRows();
  const missingRecords = koboRows
    .filter((row) => {
      const event = String(row.Evento || "");
      return event.includes("persona_desaparecida") || event.includes("familia_desaparecida");
    })
    .map(parseKoboMissingRecord);

  const localizadosRaw = (await fetchAllLocalizadosRows()).map(parseLocalizadosRecord);
  const localizadosDeduped = dedupeLocatedRecords(localizadosRaw);
  const candidates = buildCandidateMatches(missingRecords, localizadosDeduped);
  const summary = buildSummary({
    koboRows,
    missingRecords,
    localizadosRaw,
    localizadosDeduped,
    candidatesFlat: candidates.flat
  });

  await writeJsonEverywhere("summary.json", summary);
  await writeJsonEverywhere("missing.json", {
    generatedAt,
    source: "kobotoolbox-terremotove",
    total: missingRecords.length,
    results: missingRecords
  });
  await writeJsonEverywhere("located.json", {
    generatedAt,
    source: "localizados-venezuela",
    totalRaw: localizadosRaw.length,
    totalDeduped: localizadosDeduped.length,
    results: localizadosDeduped
  });
  await writeJsonEverywhere("candidates.json", {
    generatedAt,
    totalGroups: candidates.grouped.length,
    totalPairs: candidates.flat.length,
    results: candidates.grouped
  });

  console.log(`Wrote labs datasets at ${generatedAt}`);
  console.log(`- missing records: ${missingRecords.length}`);
  console.log(`- located records (deduped): ${localizadosDeduped.length}`);
  console.log(`- candidate groups: ${candidates.grouped.length}`);
};

await main();
