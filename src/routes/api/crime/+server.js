// Crime Statistics API — FBI Crime Data Explorer (CDE) integration
//
// Data provider: FBI Uniform Crime Reporting (UCR) Program via Crime Data Explorer
//   API base URL : https://api.usa.gov/crime/fbi/cde/
//   Registration : https://api.data.gov/signup/ (free, instant)
//   Env variable : FBI_UCR_API_KEY
//
// Refresh cadence: Annual. FBI publishes the previous calendar year's estimates
//   roughly 12–18 months after the reference year end (e.g. 2022 data ≈ late 2023).
//
// Methodology:
//   1. Geocode the address via Census Bureau Geocoder (geography endpoint) to obtain
//      the 5-digit county FIPS code.
//   2. Query FBI CDE /estimate/county/{fips} for violent-crime and property-crime
//      estimated counts and resident population.
//   3. Derive rates per 100 000 residents and normalize to a 0–100 crime index score
//      anchored to the 2022 national average violent crime rate (380.7 per 100 k).
//      Score 50 ≈ national average; score 100 ≥ 2× national average.
//   4. Cache results for 7 days to respect API rate limits.

import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {Map<string, {data: object, cachedAt: number}>} */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Upper bound on the number of cached entries to avoid unbounded memory growth.
const MAX_CACHE_SIZE = 1000;

// How often to run background cleanup of expired / excess cache entries.
const CACHE_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map();

function cleanupCache() {
  const now = Date.now();

  // Remove entries that have exceeded their TTL.
  for (const [key, value] of cache) {
    if (!value || typeof value.cachedAt !== 'number') {
      cache.delete(key);
      continue;
    }

    if (now - value.cachedAt > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }

  // Enforce a maximum cache size by evicting the oldest entries.
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
    const excess = cache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < excess; i += 1) {
      const [oldestKey] = entries[i];
      cache.delete(oldestKey);
    }
  }
}

// Periodically clean up the cache in long-running processes.
if (typeof setInterval === 'function') {
  const interval = setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL_MS);
  // In Node.js, avoid keeping the event loop alive solely for cache cleanup.
  if (typeof interval.unref === 'function') {
    interval.unref();
  }
}
const CENSUS_GEOCODER_URL =
  'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
const FBI_CDE_BASE_URL = 'https://api.usa.gov/crime/fbi/cde';

// FBI UCR 2022 national average violent crime rate per 100 000 residents.
const NATIONAL_AVG_VIOLENT_RATE = 380.7;

// Violent crime rate that maps to a score of 100 (2× the national average).
const SCORE_CEILING_RATE = NATIONAL_AVG_VIOLENT_RATE * 2; // ≈ 761.4

/**
 * Geocode a US address using the Census Bureau Geography endpoint.
 * Returns { lat, lon, fips5, countyName } or throws on failure.
 */
async function geocodeWithFips(address) {
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
  const county = match.geographies?.Counties?.[0];
  if (!county) {
    throw new Error('Could not determine county for this address');
  }

  const fips5 = `${county.STATE}${county.COUNTY}`;
  return { lat, lon, fips5, countyName: county.NAME };
}

/**
 * Query the FBI Crime Data Explorer for violent-crime and property-crime
 * estimated counts for a given county FIPS code.
 * Returns { violentRate, propertyRate, year, population } or throws on failure.
 */
async function queryFbiCrime(fips5, apiKey) {
  const year = 2022;
  const qs = `year=${year}&API_KEY=${apiKey}`;

  const [violentRes, propertyRes] = await Promise.all([
    fetch(`${FBI_CDE_BASE_URL}/estimate/county/${fips5}?variable=violent-crime&${qs}`, {
      headers: { 'User-Agent': 'PropertyRiskAgent/1.0' },
      signal: AbortSignal.timeout(15_000),
    }),
    fetch(`${FBI_CDE_BASE_URL}/estimate/county/${fips5}?variable=property-crime&${qs}`, {
      headers: { 'User-Agent': 'PropertyRiskAgent/1.0' },
      signal: AbortSignal.timeout(15_000),
    }),
  ]);

  if (!violentRes.ok) {
    throw new Error(`FBI CDE API returned HTTP ${violentRes.status} for violent-crime`);
  }
  if (!propertyRes.ok) {
    throw new Error(`FBI CDE API returned HTTP ${propertyRes.status} for property-crime`);
  }

  const [violentData, propertyData] = await Promise.all([
    violentRes.json(),
    propertyRes.json(),
  ]);

  const violentRecord = violentData?.results?.[0];
  const propertyRecord = propertyData?.results?.[0];

  if (!violentRecord) {
    throw new Error('No violent crime data available for this county');
  }

  const population = violentRecord.population ?? propertyRecord?.population ?? 1;
  const violentCount = violentRecord['violent-crime'] ?? violentRecord.value ?? 0;
  const propertyCount = propertyRecord?.['property-crime'] ?? propertyRecord?.value ?? 0;

  const violentRate = (violentCount / population) * 100_000;
  const propertyRate = (propertyCount / population) * 100_000;

  return { violentRate, propertyRate, year, population };
}

/**
 * Normalize a violent crime rate (per 100 000) to a 0–100 crime index score.
 * Score 0 = minimal crime; score 50 ≈ national average; score 100 = very high risk.
 */
function normalizeToScore(violentRate) {
  if (violentRate <= 0) return 0;
  const raw = Math.round((violentRate / SCORE_CEILING_RATE) * 100);
  return Math.min(100, Math.max(0, raw));
}

/** GET /api/crime?address=<address> */
export async function GET({ url }) {
  const address = url.searchParams.get('address')?.trim();

  if (!address) {
    return json({ error: 'Missing required query parameter: address' }, { status: 400 });
  }

  const apiKey = env.FBI_UCR_API_KEY;
  if (!apiKey) {
    return json(
      {
        error:
          'FBI_UCR_API_KEY is not configured. Register for a free key at https://api.data.gov/signup/ and set it as an environment variable.',
      },
      { status: 503 },
    );
  }

  const cacheKey = address.toLowerCase().replace(/\s+/g, ' ');
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return json({ ...cached.data, cached: true });
  }

  try {
    const { lat, lon, fips5, countyName } = await geocodeWithFips(address);
    const { violentRate, propertyRate, year, population } = await queryFbiCrime(fips5, apiKey);

    const crimeScore = normalizeToScore(violentRate);
    const severity = crimeScore >= 70 ? 'high' : crimeScore >= 40 ? 'medium' : 'low';
    const severityLabel = crimeScore >= 70 ? 'High Risk' : crimeScore >= 40 ? 'Moderate' : 'Low Risk';

    const result = {
      address,
      lat,
      lon,
      countyFips: fips5,
      countyName,
      crimeScore,
      severity,
      severityLabel,
      violentCrimeRate: Math.round(violentRate * 10) / 10,
      propertyCrimeRate: Math.round(propertyRate * 10) / 10,
      nationalAvgViolentRate: NATIONAL_AVG_VIOLENT_RATE,
      dataYear: year,
      population,
      source: 'FBI Crime Data Explorer (CDE) — Uniform Crime Reporting Program',
      refreshCadence: 'Annual (data typically released 12–18 months after reference year)',
      cached: false,
    };

    cache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return json(result);
  } catch (err) {
    console.error('[/api/crime] Error:', err.message);
    return json({ error: err.message }, { status: 502 });
  }
}
