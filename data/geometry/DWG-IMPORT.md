# DWG Import — `HHXL - QH05.2.dwg`

**File:** `HHXL - QH05.2.dwg` (12.7 MB, AutoCAD 2007/2008/2009 format)
**Status:** ⏸ Pending conversion → DXF → GeoJSON
**Source:** Chủ đầu tư (Phú Mỹ Hưng × Nomura) — official 1/500 plan
**Sensitivity:** **CDT intellectual property — do NOT commit to public GitHub.** File already excluded via `.gitignore`.

---

## Why we need to convert

The runtime project's current 2830 polygons (`_raw-advisory-lots.geojson`) are **staging data with `+194m E, −114m N` offset** vs CDT canonical coordinates. The DWG plan is the source of truth. Converting it lets us:

1. Verify polygon geometry of all 1.074 lot Hồng Phát
2. Extract real subdivision boundaries (replace 4-corner bbox placeholders)
3. Compute correct CAD → EPSG:4326 transform
4. Identify amenity polygons (parks, roads, schools, retail) for separate seeding
5. Map legacy `subZone` labels (h2-3, f2-2, gcx2, h1-3) to official phân khu names

---

## Conversion pipeline

```
HHXL - QH05.2.dwg
       │
       │  [Step 1]  ODA File Converter (DWG → DXF)
       ▼
HHXL - QH05.2.dxf
       │
       │  [Step 2]  scripts/dxf-to-geojson.py (DXF → GeoJSON in CAD units)
       ▼
data/geometry/_raw-cdt-plan.geojson
       │
       │  [Step 3]  Apply CAD → EPSG:4326 affine transform
       ▼
data/geometry/cdt-plan-4326.geojson
       │
       │  [Step 4]  Cross-reference with hong-phat-lots-full.json,
       │           flip display_source: "internal" → "official"
       ▼
data/geometry/hong-phat-lots-full.json (updated)
```

---

## Step 1 — Convert DWG → DXF

### Option A — ODA File Converter (recommended, free, ~30 MB)

1. Download from https://www.opendesign.com/guestfiles/oda_file_converter
2. Install (Windows / macOS / Linux)
3. Launch ODA File Converter
4. Configure:
   - **Input folder:** `C:\Users\Kieu Oanh\Desktop\260521`
   - **Output folder:** `C:\Users\Kieu Oanh\Desktop\260521` (same dir is OK)
   - **Output version:** `ACAD2018` (latest stable)
   - **Output file format:** `DXF` (NOT DWG)
   - **Input file filter:** `*.DWG`
   - Check ✅ **Recurse Folders** (off if only this file)
   - Check ✅ **Audit each file**
5. Click **Start**
6. Result: `HHXL - QH05.2.dxf` produced in the same folder

### Option B — DWG TrueView (Autodesk, free)

1. Download https://www.autodesk.com/viewers (DWG TrueView)
2. Install
3. Open `HHXL - QH05.2.dwg` in TrueView
4. File → Save As → choose "AutoCAD 2018 DXF (*.dxf)" → save as `HHXL - QH05.2.dxf`

### Option C — If you have AutoCAD / BricsCAD

Open the DWG, then `DXFOUT` command, save as `HHXL - QH05.2.dxf`.

---

## Step 2 — Extract polygons from DXF

```bash
cd "C:\Users\Kieu Oanh\Desktop\260521"

python scripts/dxf-to-geojson.py "HHXL - QH05.2.dxf" \
  --out data/geometry/_raw-cdt-plan.geojson \
  --report data/geometry/_cdt-plan-layers.json
```

**Expected output:**
- `_raw-cdt-plan.geojson` — every closed polyline/hatch as a GeoJSON polygon, grouped by AutoCAD layer
- `_cdt-plan-layers.json` — layer inventory (entity counts per layer)

The script logs top 10 layers by entity count so we can identify:
- Which layer holds **lot boundaries** (likely 1000+ polygons named `LOT_*` or `LO_DAT` or similar)
- Which layer holds **road centerlines** (usually `ROAD_*` or `GIAO_THONG`)
- Which layer holds **subdivision boundaries** (usually `PHAN_KHU_*` or `BLOCK_*`)
- Which layer holds **amenities** (parks, schools — usually `TIEN_ICH_*`)

---

## Step 3 — CAD → EPSG:4326 georeferencing

DXF coordinates are in **local CAD units** (typically VN-2000 projection in meters), NOT lng/lat.

To transform, we need either:
- **Affine matrix** from CDT survey team (preferred)
- **3+ control points** with known (CAD_x, CAD_y) ↔ (lng, lat) pairs we can compute manually

### Manual control point method (fallback)

1. Open the DXF in any CAD viewer
2. Pick 3 distinct landmarks (e.g., 3 building corners) visible on Google Maps satellite imagery
3. For each: read CAD coords + read lng/lat from Google Maps
4. Feed to a small affine solver script (to be written: `scripts/solve-cad-transform.py`)
5. Output: 6-parameter affine `[a, b, c, d, e, f]` such that
   ```
   lng = a · cad_x + b · cad_y + c
   lat = d · cad_x + e · cad_y + f
   ```
6. Apply to `_raw-cdt-plan.geojson` → write `cdt-plan-4326.geojson`

### CDT-supplied method (preferred)

If CDT provides the projection metadata directly:
- **VN-2000 / TM-3 Bắc Ninh** (EPSG:9210 or local custom) → use `pyproj` for transformation
- One-line conversion in `pyproj` once SRID confirmed

---

## Step 4 — Reconcile with existing staging data

After georeferencing:

1. **Spatial join** `_raw-cdt-plan.geojson` (official) ↔ `hong-phat-lots-full.json` (staging)
2. For each staging lot, find the official polygon with highest IoU (intersection-over-union)
3. **If IoU ≥ 0.8:** flip
   - `display_source: "internal" → "official"`
   - `official_geometry: <official polygon>`
   - `last_official_sync: <timestamp>`
   - `coordinate_epoch: "cdt_canonical_2026"`
4. **If IoU < 0.8:** flag for manual review in `_reconciliation-mismatches.json`
5. **Lots in official plan with no staging match:** add as new entries (likely future phases)
6. **Staging lots with no official match:** mark `display_source: "internal-only"`, possibly retire from public display

Script to write: `scripts/reconcile-lots.py` (depends on `shapely` — `pip install shapely`).

---

## Security note

`HHXL - QH05.2.dwg` is **CDT intellectual property**. It is:
- Added to `.gitignore` (will NOT be pushed to public GitHub)
- Kept on local filesystem only
- Should NOT be uploaded to any cloud converter (online converters retain copies)

If sharing with team:
- Use private channel (Signal, encrypted email, internal SharePoint)
- Or share the **derived GeoJSON** (`cdt-plan-4326.geojson`) — that's transformed data, not the raw plan

---

## Status checklist

- [x] Install ODA File Converter (or DWG TrueView) — done by user
- [x] Convert DWG → DXF: `HHXL - QH05.2.dxf` (83 MB, AC1032 / AutoCAD 2018)
- [x] Run `scripts/dxf-to-geojson.py` (INSERT-aware recursive) → 6934 polygons extracted
- [x] Identify lot layers — found inside block `2021.10 - HHXL- CONCEPT`:
  - `bo bt`   → 1245 villa-don-lap
  - `bo btsl` → 332 villa-song-lap
  - `bo lk`   → 811 townhouse
  - `bo sh`   → 627 shophouse
  - **Total: 3015 lots** (covers all 3 phân khu, not just Hồng Phát)
- [x] Filter to clean datasets → `cdt-lots-3015.geojson`, `cdt-zones-3phankhu.geojson`, `cdt-infrastructure.geojson`
- [ ] Obtain CAD→4326 transform (CDT or manual control points)
- [ ] Apply transform → `cdt-plan-4326.geojson`
- [ ] Run `scripts/reconcile-lots.py` → update `hong-phat-lots-full.json` with `display_source: "official"`
- [ ] Regenerate `hong-phat-lots-index.json` via `scripts/build-lots-index.mjs`
- [ ] Re-generate SEO metadata with new `indexable: true` for matched lots
- [ ] Update `data/README.md` Current Status table

## Verified findings from QH05.2

**CAD coordinate system:** VN-2000 (likely zone 105°30' = Bắc Ninh local), units in meters
**Lot-only bbox:** `[552118, 2323897, 559318, 2325552]` → 7.2km E-W × 1.66km N-S
**3015 lot polygons vs 2449 staging:** CDT plan covers full HHC (all 3 phân khu), staging is current-release subset only

**Lot product mix (CDT plan):**

| Product | Count | p50 area | Range |
|---|---|---|---|
| villa-don-lap | 1245 | 330 m² | 242–798 m² |
| villa-song-lap | 332 | 190 m² | 167–330 m² |
| townhouse | 811 | 120 m² | 111–293 m² |
| shophouse | 627 | 120 m² | 111–361 m² |

**8 polygons in "RANH 3 ZONE" layer** — likely subdivision boundaries + sub-zones (3 largest = 71 ha combined, matches main phân khu scale).
