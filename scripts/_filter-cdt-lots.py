"""
Filter _raw-cdt-plan.geojson → 3 clean GeoJSON files:

1. cdt-lots-3015.geojson         — 3015 lot polygons với product type tag
2. cdt-zones-3phankhu.geojson    — 8 polygons trong layer "RANH 3 ZONE"
3. cdt-infrastructure.geojson    — Road + Sidewalk + Setback polygons

Coordinates remain in CAD VN-2000 (col 0=easting m, col 1=northing m).
Apply CAD→EPSG:4326 transform downstream before merging with staging data.
"""
import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data/geometry/_raw-cdt-plan.geojson')

with open(RAW, encoding='utf-8') as f:
    raw = json.load(f)

LOT_LAYER_TO_KIND = {
    '2021.10 - HHXL- CONCEPT$0$1-bo bt':   'villa-don-lap',
    '2021.10 - HHXL- CONCEPT$0$1-bo btsl': 'villa-song-lap',
    '2021.10 - HHXL- CONCEPT$0$1-bo lk':   'townhouse',
    '2021.10 - HHXL- CONCEPT$0$1-bo sh':   'shophouse',
}
ZONE_LAYER = '2021.10 - HHXL- CONCEPT$0$2-RANH 3 ZONE'
INFRA_LAYERS = {
    '2021.10 - HHXL- CONCEPT$0$0-Road':     'road',
    '2021.10 - HHXL- CONCEPT$0$0-Sidewalk': 'sidewalk',
    '2021.10 - HHXL- CONCEPT$0$0-Setback':  'setback',
}

lots = []
zones = []
infras = []
lot_id = 0

for feat in raw['features']:
    layer = feat['properties']['layer']
    if layer in LOT_LAYER_TO_KIND:
        lot_id += 1
        kind = LOT_LAYER_TO_KIND[layer]
        coords = feat['geometry']['coordinates']
        # Compute centroid in CAD units (planar approximation)
        ring = coords[0]
        n = len(ring) - 1
        cx = sum(p[0] for p in ring[:-1]) / n
        cy = sum(p[1] for p in ring[:-1]) / n
        lots.append({
            'type': 'Feature',
            'properties': {
                'cdt_id': f'cdt_lot_{lot_id:05d}',
                'kind': kind,
                'area_cad_m2': feat['properties']['area_cad'],
                'vertex_count': feat['properties']['vertex_count'],
                'centroid_cad': [round(cx, 3), round(cy, 3)],
                '_coord_system': 'vn2000_local',
                '_source_layer': layer,
            },
            'geometry': feat['geometry'],
        })
    elif layer == ZONE_LAYER:
        zones.append({
            'type': 'Feature',
            'properties': {
                'kind': 'subdivision-zone',
                'area_cad_m2': feat['properties']['area_cad'],
                '_coord_system': 'vn2000_local',
            },
            'geometry': feat['geometry'],
        })
    elif layer in INFRA_LAYERS:
        infras.append({
            'type': 'Feature',
            'properties': {
                'kind': INFRA_LAYERS[layer],
                'area_cad_m2': feat['properties']['area_cad'],
                '_coord_system': 'vn2000_local',
            },
            'geometry': feat['geometry'],
        })

# Compute bboxes
def bbox_of(feats):
    xs, ys = [], []
    for f in feats:
        for pt in f['geometry']['coordinates'][0]:
            xs.append(pt[0]); ys.append(pt[1])
    if not xs:
        return None
    return [min(xs), min(ys), max(xs), max(ys)]


def write(path, features, kind_summary):
    bbox = bbox_of(features)
    doc = {
        '_meta': {
            'source_dxf': 'HHXL - QH05.2.dxf',
            'source_dxf_provenance': 'CDT Phu My Hung x Nomura, official 1/500 plan',
            'feature_count': len(features),
            'kind_summary': kind_summary,
            'bbox_cad_local': bbox,
            'coord_system': 'vn2000_local',
            'georeference_status': 'PENDING — VN-2000 CAD coords; apply transform before merge with EPSG:4326 datasets',
            'transform_hint': 'Likely VN-2000 / 3-degree zone 105°30 (Bắc Ninh local). Use pyproj with EPSG:9210 or surveyor-supplied transform.',
        },
        'type': 'FeatureCollection',
        'features': features,
    }
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
    sz = os.path.getsize(path)
    print(f"[OK] {os.path.relpath(path, ROOT):60s} {sz/1024:8.1f} KB  {len(features):5d} features")


# Build kind summaries
lot_kind_summary = defaultdict(int)
for l in lots: lot_kind_summary[l['properties']['kind']] += 1
infra_kind_summary = defaultdict(int)
for i in infras: infra_kind_summary[i['properties']['kind']] += 1

write(
    os.path.join(ROOT, 'data/geometry/cdt-lots-3015.geojson'),
    lots,
    dict(lot_kind_summary),
)
write(
    os.path.join(ROOT, 'data/geometry/cdt-zones-3phankhu.geojson'),
    zones,
    {'subdivision-zone': len(zones)},
)
write(
    os.path.join(ROOT, 'data/geometry/cdt-infrastructure.geojson'),
    infras,
    dict(infra_kind_summary),
)

print(f"\nLot counts by kind:")
for k, v in sorted(lot_kind_summary.items()):
    print(f"  {k:18s} {v:5d}")
print(f"\nZones: {len(zones)}")
print(f"Infrastructure:")
for k, v in sorted(infra_kind_summary.items()):
    print(f"  {k:10s} {v:5d}")
