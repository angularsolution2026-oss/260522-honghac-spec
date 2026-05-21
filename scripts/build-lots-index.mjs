#!/usr/bin/env node
/**
 * Generate hong-phat-lots-index.json from hong-phat-lots-full.json
 *
 * Lightweight LOD-optimized manifest cho macro-close / micro rendering.
 * Target size: < 500 KB cho 2449 lots.
 *
 * Usage:
 *   node scripts/build-lots-index.mjs
 *   node scripts/build-lots-index.mjs --pretty   # debug-readable output
 *
 * Source field → compact field mapping:
 *   internal_id   → i
 *   public_code   → p
 *   centroid      → c
 *   area_m2       → a
 *   status+listing→ s ("as"|"rs"|"ss" for staging; "ap"|"rp"|"sp" for public)
 *   subZone       → z
 *   kind          → k
 *
 * Run as Payload afterChange hook on lots collection để re-build incrementally.
 * Standalone re-build mất ~50ms cho 2449 entries trên Node 20.
 */

import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FULL = resolve(ROOT, 'data/geometry/hong-phat-lots-full.json');
const INDEX = resolve(ROOT, 'data/geometry/hong-phat-lots-index.json');

const PRETTY = process.argv.includes('--pretty');
const SIZE_BUDGET_KB = 500;

const STATUS_TO_SHORT = { available: 'a', reserved: 'r', sold: 's' };
const LISTING_TO_SHORT = { staging: 's', public: 'p' };

function statusListingCode(status, listing) {
  const s = STATUS_TO_SHORT[status] ?? 'a';
  const l = LISTING_TO_SHORT[listing] ?? 's';
  return s + l;
}

function computeBbox(entries) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const entry of entries) {
    const [lng, lat] = entry.c;
    if (lng < w) w = lng;
    if (lng > e) e = lng;
    if (lat < s) s = lat;
    if (lat > n) n = lat;
  }
  return [
    Number(w.toFixed(6)),
    Number(s.toFixed(6)),
    Number(e.toFixed(6)),
    Number(n.toFixed(6)),
  ];
}

async function main() {
  const t0 = Date.now();
  const raw = await readFile(FULL, 'utf-8');
  const doc = JSON.parse(raw);
  const lots = doc.lots ?? [];

  if (!Array.isArray(lots) || lots.length === 0) {
    throw new Error(`No lots found in ${FULL}`);
  }

  const indexEntries = lots.map((lot) => ({
    i: lot.internal_id,
    p: lot.public_code,
    c: lot.centroid,
    a: Math.round(lot.area_m2 * 10) / 10,
    s: statusListingCode(lot.status, lot.listing),
    z: lot.subZone,
    k: lot.kind,
  }));

  const bbox = computeBbox(indexEntries);

  const output = {
    _meta: {
      purpose: 'LOD-optimized lot index — served at /tiles/advisory-manifest.json',
      generated_at: new Date().toISOString(),
      source: 'hong-phat-lots-full.json',
      generator: 'scripts/build-lots-index.mjs',
      feature_count: indexEntries.length,
      bbox,
      fields: {
        i: 'internal_id',
        p: 'public_code',
        c: 'centroid [lng,lat]',
        a: 'area m²',
        s: 'status+listing 2-char (as|rs|ss for staging, ap|rp|sp for public)',
        z: 'subZone',
        k: 'kind',
      },
    },
    lots: indexEntries,
  };

  const json = PRETTY
    ? JSON.stringify(output, null, 2)
    : JSON.stringify(output);

  await writeFile(INDEX, json, 'utf-8');
  const st = await stat(INDEX);
  const sizeKb = st.size / 1024;
  const elapsed = Date.now() - t0;

  console.log(`✓ Wrote ${INDEX}`);
  console.log(`  ${indexEntries.length} entries · ${sizeKb.toFixed(1)} KB · ${elapsed}ms`);
  console.log(`  bbox: [${bbox.join(', ')}]`);

  if (sizeKb > SIZE_BUDGET_KB) {
    console.warn(`  ⚠ Size ${sizeKb.toFixed(1)} KB exceeds budget ${SIZE_BUDGET_KB} KB`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ Within budget (${SIZE_BUDGET_KB} KB)`);
  }
}

main().catch((err) => {
  console.error('✗ build-lots-index failed:', err);
  process.exit(1);
});
