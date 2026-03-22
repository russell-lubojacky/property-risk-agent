// FEMA National Flood Hazard Layer (NFHL) API integration
// Geocodes a US address via Census Bureau, then queries the FEMA NFHL ArcGIS REST API.
// Results are cached in-memory by normalized address to avoid redundant API calls.

import { json } from '@sveltejs/kit';

/** @type {Map<string, {data: object, cachedAt: number}>} */
const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const FEMA_NFHL_URL =
  'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query';

const CENSUS_GEOCODER_URL =
  'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';

/** Human-readable description for FEMA flood zone codes. */
function zoneDescription(zone, subtype) {
  const z = (zone ?? '').toUpperCase().trim();
  const descriptions = {
    AE: 'Special Flood Hazard Area — 1% annual chance flood with Base Flood Elevation',
    A: 'Special Flood Hazard Area — 1% annual chance flood (no BFE determined)',
    AH: 'Special Flood Hazard Area — shallow flooding (1–3 ft ponding), with BFE',
    AO: 'Special Flood Hazard Area — shallow sheet-flow flooding (1–3 ft average depth)',
    AR: 'Special Flood Hazard Area — restoring levee system',
    'A99': 'Special Flood Hazard Area — protected by federal flood-control system under construction',
    VE: 'Coastal High Hazard Area — 1% annual chance coastal flood with wave action and BFE',
    V: 'Coastal High Hazard Area — 1% annual chance coastal flood (no BFE determined)',
    X: 'Minimal flood hazard — outside the 1% and 0.2% annual chance floodplains',
    D: 'Undetermined flood hazard',
  };
  return descriptions[z] ?? `Flood zone ${z}${subtype ? ` (${subtype})` : ''}`;
}

/**
 * Geocode a US address using the Census Bureau Geocoder.
 * Returns { lat, lon } or throws on failure.
 */
async function geocodeAddress(address) {
  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
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
  const matches = data?.result?.addressMatches;
  if (!matches || matches.length === 0) {
    throw new Error('Address not found by Census geocoder');
  }

  const { x: lon, y: lat } = matches[0].coordinates;
  return { lat, lon };
}

/**
 * Query the FEMA NFHL flood zone layer for a given lat/lon point.
 * Returns { zone, subtype, staticBFE, description } or throws on failure.
 */
async function queryFemaFloodZone(lat, lon) {
  const geometry = JSON.stringify({
    x: lon,
    y: lat,
    spatialReference: { wkid: 4326 },
  });

  const params = new URLSearchParams({
    geometry,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'FLD_ZONE,ZONE_SUBTY,STATIC_BFE',
    returnGeometry: 'false',
    f: 'json',
  });

  const res = await fetch(`${FEMA_NFHL_URL}?${params}`, {
    headers: { 'User-Agent': 'PropertyRiskAgent/1.0' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`FEMA NFHL API returned HTTP ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`FEMA NFHL API error: ${data.error.message}`);
  }

  const features = data?.features ?? [];
  if (features.length === 0) {
    // No flood zone record — treat as Zone X (minimal hazard)
    return {
      zone: 'X',
      subtype: null,
      staticBFE: null,
      description: zoneDescription('X', null),
    };
  }

  const attrs = features[0].attributes;
  const zone = attrs.FLD_ZONE ?? 'X';
  const subtype = attrs.ZONE_SUBTY || null;
  const rawBFE = attrs.STATIC_BFE;
  const staticBFE = rawBFE != null && rawBFE > 0 ? rawBFE : null;

  return {
    zone,
    subtype,
    staticBFE,
    description: zoneDescription(zone, subtype),
  };
}

/** GET /api/flood?address=<address> */
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
    const { lat, lon } = await geocodeAddress(address);
    const floodData = await queryFemaFloodZone(lat, lon);

    const result = {
      address,
      lat,
      lon,
      zone: floodData.zone,
      subtype: floodData.subtype,
      staticBFE: floodData.staticBFE,
      description: floodData.description,
      source: 'FEMA National Flood Hazard Layer',
      cached: false,
    };

    cache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return json(result);
  } catch (err) {
    console.error('[/api/flood] Error:', err.message);
    return json({ error: err.message }, { status: 502 });
  }
}
