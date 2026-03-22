// Infrastructure Integrity API
//
// Data providers:
//   EIA Form 861 Annual Electric Power Industry Report (2022)
//     Metric : SAIDI without major event days (minutes/customer/year)
//     Source : https://www.eia.gov/electricity/annual/html/epa_11_01.html
//     Note   : Values are baked-in from the published 2022 report; no API key required.
//   OpenStreetMap Overpass API  https://overpass-api.de/
//     Counts major highway segments within 500 m of the address.
//     No API key required.
//
// Methodology:
//   1. Geocode via Census Bureau Geography endpoint → lat/lon + two-letter state code.
//   2. Look up the state's 2022 SAIDI from the static table.
//      Grid score = clamp(0, 100, 100 − round(saidi / 3))
//      (SAIDI 0 → score 100; SAIDI 300 → score 0)
//   3. Query Overpass for motorway/trunk/primary/secondary/tertiary way count within 500 m.
//      Road score = clamp(0, 100, count × 9 + 10)   (0 roads → 10; ≥10 roads → 100)
//   4. Infrastructure score = round(0.6 × gridScore + 0.4 × roadScore)
//   5. Cache results for 7 days.

import { json } from '@sveltejs/kit';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 1000;
const CACHE_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/** @type {Map<string, {data: object, cachedAt: number}>} */
const cache = new Map();

function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of cache) {
    if (!value || typeof value.cachedAt !== 'number') {
      cache.delete(key);
      continue;
    }
    if (now - value.cachedAt > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
    const excess = cache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < excess; i += 1) {
      cache.delete(entries[i][0]);
    }
  }
}

if (typeof setInterval === 'function') {
  const interval = setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL_MS);
  if (typeof interval.unref === 'function') interval.unref();
}

const CENSUS_GEOCODER_URL =
  'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// State-level SAIDI (System Average Interruption Duration Index) in minutes / customer / year
// Source: EIA Form 861, 2022 Annual Electric Power Industry Report, Table 11.1
// Metric: Without Major Event Days (WO MED) — lower value = more reliable grid
const STATE_SAIDI_2022 = {
  AK: 240, AL: 95,  AR: 85,  AZ: 52,  CA: 110, CO: 55,  CT: 118,
  DC: 42,  DE: 65,  FL: 76,  GA: 112, HI: 130, IA: 50,  ID: 47,
  IL: 96,  IN: 85,  KS: 67,  KY: 92,  LA: 117, MA: 100, MD: 88,
  ME: 143, MI: 116, MN: 65,  MO: 89,  MS: 108, MT: 79,  NC: 74,
  ND: 62,  NE: 61,  NH: 159, NJ: 103, NM: 92,  NV: 64,  NY: 115,
  OH: 108, OK: 106, OR: 66,  PA: 95,  RI: 61,  SC: 91,  SD: 63,
  TN: 104, TX: 77,  UT: 51,  VA: 74,  VT: 152, WA: 47,  WI: 91,
  WV: 89,  WY: 78,
};

// Approximate US weighted average SAIDI (WO MED) — used when state is unknown.
const NATIONAL_AVG_SAIDI = 100;

/**
 * Geocode a US address using the Census Bureau Geography endpoint.
 * Returns { lat, lon, state } or throws on failure.
 * `state` is the two-letter postal abbreviation (e.g. "TX"), or null if unavailable.
 */
async function geocodeAddress(address) {
  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    vintage: 'Current_Current',
    format: 'json',
  });

  const res = await fetch(`${CENSUS_GEOCODER_URL}?${params}`, {
    headers: { 'User-Agent': 'PropertyRiskAgent/1.0' },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Census geocoder returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const match = data?.result?.addressMatches?.[0];
  if (!match) {
    throw new Error('Address not found by Census geocoder');
  }

  const { x: lon, y: lat } = match.coordinates;
  const stateGeo = match.geographies?.States?.[0];
  const state = stateGeo?.STUSAB ?? null;

  return { lat, lon, state };
}

/**
 * Query the OSM Overpass API for the count of major road segments
 * within `radius` metres of a lat/lon point.
 * Returns { totalRoads: number } or throws on failure.
 */
async function fetchOsmRoadAccess(lat, lon) {
  const radius = 500; // metres — walkable catchment around property
  const query =
    `[out:json][timeout:20];` +
    `way(around:${radius},${lat},${lon})` +
    `["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"];` +
    `out count;`;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PropertyRiskAgent/1.0',
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Overpass API returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const total = parseInt(data?.elements?.[0]?.tags?.total ?? '0', 10);
  return { totalRoads: total };
}

/**
 * Convert state SAIDI to a 0–100 grid resilience score.
 * Score 100 = most reliable (SAIDI near 0); Score 0 = least reliable (SAIDI ≥ 300).
 */
function gridScoreFromSaidi(saidi) {
  const score = Math.round(100 - saidi / 3);
  return Math.min(100, Math.max(0, score));
}

/**
 * Convert road count to a 0–100 road accessibility score.
 * 0 roads → 10; each additional road adds 9 points; ≥10 roads → 100.
 */
function roadScoreFromCount(count) {
  const score = Math.round(Math.min(count, 10) * 9 + 10);
  return Math.min(100, Math.max(0, score));
}

/** Map a 0–100 road score to a letter grade. */
function roadGradeLabel(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/** GET /api/infrastructure?address=<address> */
export async function GET({ url }) {
  const address = url.searchParams.get('address')?.trim();

  if (!address) {
    return json({ error: 'Missing required query parameter: address' }, { status: 400 });
  }

  const cacheKey = address.toLowerCase().replace(/\s+/g, ' ');
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return json({ ...cached.data, cached: true });
  }

  try {
    const { lat, lon, state } = await geocodeAddress(address);

    // Grid resilience — static EIA lookup by state
    const saidi = state ? (STATE_SAIDI_2022[state] ?? NATIONAL_AVG_SAIDI) : NATIONAL_AVG_SAIDI;
    const gridResilienceScore = gridScoreFromSaidi(saidi);

    // Road access — live OSM Overpass query
    let roadAccessScore = 50;
    let totalRoadsNearby = null;
    let roadAccessGrade = 'N/A';
    let roadNote = null;

    try {
      const { totalRoads } = await fetchOsmRoadAccess(lat, lon);
      totalRoadsNearby = totalRoads;
      roadAccessScore = roadScoreFromCount(totalRoads);
      roadAccessGrade = roadGradeLabel(roadAccessScore);
    } catch (roadErr) {
      console.error('[/api/infrastructure] OSM road query failed:', roadErr.message);
      roadNote = roadErr.message;
    }

    // Composite infrastructure score (60 % grid, 40 % road)
    const infrastructureScore = Math.round(0.6 * gridResilienceScore + 0.4 * roadAccessScore);
    const severity =
      infrastructureScore >= 70 ? 'low' : infrastructureScore >= 40 ? 'medium' : 'high';
    const severityLabel =
      infrastructureScore >= 70 ? 'Favorable' : infrastructureScore >= 40 ? 'Moderate' : 'High Risk';

    const result = {
      address,
      lat,
      lon,
      state,
      infrastructureScore,
      severity,
      severityLabel,
      gridResilienceScore,
      gridSaidi: saidi,
      gridDataYear: 2022,
      roadAccessScore,
      roadAccessGrade,
      totalRoadsNearby,
      ...(roadNote ? { roadNote } : {}),
      nationalAvgSaidi: NATIONAL_AVG_SAIDI,
      sources:
        'EIA Form 861 2022 (grid resilience · SAIDI WO MED) · OpenStreetMap Overpass API (road access)',
      cached: false,
    };

    cache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return json(result);
  } catch (err) {
    console.error('[/api/infrastructure] Error:', err.message);
    return json({ error: err.message }, { status: 502 });
  }
}
