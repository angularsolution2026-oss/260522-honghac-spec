"""
One-time data conversion: 2830-polygon raw GeoJSON → 2449-lot full.json + index.json

Mirrors derive-lot-codes.ts logic in Python so we can produce the JSON artifacts
without bootstrapping a Node toolchain. Run once; thereafter the TS scripts take over.

Usage:
    cd <project-root>
    python scripts/_build-lots-from-raw.py
"""
import json
import re
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'geometry', '_raw-advisory-lots.geojson')
FULL_OUT = os.path.join(ROOT, 'data', 'geometry', 'hong-phat-lots-full.json')
INDEX_OUT = os.path.join(ROOT, 'data', 'geometry', 'hong-phat-lots-index.json')

with open(RAW, 'r', encoding='utf-8') as f:
    raw = json.load(f)

all_features = raw['features']
lot_features = [f for f in all_features if f['properties'].get('subZone') != 'project']
amenity_features = [f for f in all_features if f['properties'].get('subZone') == 'project']
print(f"Total features:    {len(all_features)}")
print(f"  Amenity excluded: {len(amenity_features)}")
print(f"  Lot features:     {len(lot_features)}")

SUBZONE_TO_SUBDIVISION = {
    'hong-phat': 'hong-phat', 'h2-3': 'hong-phat', 'h1-3': 'hong-phat',
    'f2-2': 'hong-phat', 'gcx2': 'hong-phat',
}
SUB_LABEL_VI = 'Hồng Phát'
SUB_LABEL_EN = 'Hong Phat'


def subdivision_of(sz):
    return SUBZONE_TO_SUBDIVISION.get(sz, 'hong-phat')


def derive_internal_id(legacy_code, legacy_feature_id, counter):
    m = re.match(r'^lot_(\d{5})$', legacy_code or '')
    if m:
        return legacy_code
    m2 = re.search(r'lot_(\d{5})', legacy_feature_id or '')
    if m2:
        return f"lot_{m2.group(1)}"
    cid = f"lot_{counter['next']:05d}"
    counter['next'] += 1
    return cid


def derive_public_code(subdivision, legacy_code, sub_zone, sequence):
    code = (legacy_code or '').strip()
    ma = re.match(r'^([A-Za-z]+\d+)\.(\d+)\.([A-Za-z])\.(\d+)$', code)
    if ma:
        block, blk_sub, row, lot = ma.groups()
        return f"{subdivision}/{block.lower()}-{blk_sub}-{row.lower()}-{lot}"
    mb = re.match(r'^([A-Za-z]+\d+)\.(\d+)$', code)
    if mb:
        block, lot = mb.groups()
        return f"{subdivision}/{block.lower()}-{lot}"
    return f"{subdivision}/{sub_zone}-{sequence:03d}"


def derive_display_label(subdivision, public_code):
    local = public_code.split('/')[-1]
    parts = local.split('-')
    if len(parts) == 4:
        block, sub, row, lot = parts
        vi = f"Lo {block.upper()}-{sub} - Hang {row.upper()} - So {lot} - {SUB_LABEL_VI}"
        en = f"Lot {block.upper()}-{sub} - Row {row.upper()} - #{lot} - {SUB_LABEL_EN}"
        vi = vi.replace('Lo', 'Lô').replace('Hang', 'Hàng').replace('So', 'Số')
        return (vi, en)
    if len(parts) == 2:
        block, lot = parts
        vi = f"Lô {block.upper()} · Số {lot} — {SUB_LABEL_VI}"
        en = f"Lot {block.upper()} · #{lot} — {SUB_LABEL_EN}"
        return (vi, en)
    if len(parts) == 3:
        a, b, seq = parts
        vi = f"Lô {a.upper()}-{b} · Vị trí {seq} — {SUB_LABEL_VI}"
        en = f"Lot {a.upper()}-{b} · Position {seq} — {SUB_LABEL_EN}"
        return (vi, en)
    return (f"Lô {local} — {SUB_LABEL_VI}", f"Lot {local} — {SUB_LABEL_EN}")


# Reformat display labels with proper Vietnamese + middle dot
def make_label_vi(parts):
    if len(parts) == 4:
        b, s, r, l = parts
        return f"Lô {b.upper()}-{s} · Hàng {r.upper()} · Số {l} — {SUB_LABEL_VI}"
    if len(parts) == 2:
        b, l = parts
        return f"Lô {b.upper()} · Số {l} — {SUB_LABEL_VI}"
    if len(parts) == 3:
        a, b, seq = parts
        return f"Lô {a.upper()}-{b} · Vị trí {seq} — {SUB_LABEL_VI}"
    return f"Lô {'-'.join(parts)} — {SUB_LABEL_VI}"


def make_label_en(parts):
    if len(parts) == 4:
        b, s, r, l = parts
        return f"Lot {b.upper()}-{s} · Row {r.upper()} · #{l} — {SUB_LABEL_EN}"
    if len(parts) == 2:
        b, l = parts
        return f"Lot {b.upper()} · #{l} — {SUB_LABEL_EN}"
    if len(parts) == 3:
        a, b, seq = parts
        return f"Lot {a.upper()}-{b} · Position {seq} — {SUB_LABEL_EN}"
    return f"Lot {'-'.join(parts)} — {SUB_LABEL_EN}"


def infer_kind(area, frontage):
    if area < 200:
        return 'townhouse-compact'
    if area < 290:
        return 'villa-song-lap' if frontage >= 8 else 'townhouse'
    if area < 336:
        return 'townhouse'
    if area < 420:
        return 'villa-don-lap' if frontage >= 12 else 'shophouse'
    return 'shophouse'


def orientation_of(deg):
    try:
        d = deg % 360
    except Exception:
        return 'N'
    if d < 22.5 or d >= 337.5:
        return 'N'
    if d < 67.5:
        return 'NE'
    if d < 112.5:
        return 'E'
    if d < 157.5:
        return 'SE'
    if d < 202.5:
        return 'S'
    if d < 247.5:
        return 'SW'
    if d < 292.5:
        return 'W'
    return 'NW'


def derive_tags(area, frontage, direction, status, sub_zone):
    tags = []
    if area < 200:
        tags.append('compact')
    elif area < 300:
        tags.append('medium')
    elif area < 450:
        tags.append('large')
    else:
        tags.append('extra-large')
    if frontage >= 10:
        tags.append('wide-frontage')
    if frontage >= 15:
        tags.append('villa-grade-frontage')
    o = orientation_of(direction)
    tags.append(f'face-{o.lower()}')
    if o in ('S', 'SE', 'SW'):
        tags.append('huong-tot')
    tags.append(f'status-{status}')
    tags.append(f'kind-{infer_kind(area, frontage)}')
    tags.append(f'block-{sub_zone}')
    return tags


def normalize_status(s):
    return s if s in ('available', 'reserved', 'sold') else 'available'


def centroid_of(coords):
    ring = coords[0]
    sx = sum(p[0] for p in ring[:-1])
    sy = sum(p[1] for p in ring[:-1])
    n = len(ring) - 1
    return [round(sx / n, 7), round(sy / n, 7)]


# Stable sort for deterministic sequence assignment
lot_features.sort(key=lambda f: (
    f['properties'].get('subZone', ''),
    f['properties'].get('legacyFeatureId', ''),
))

seq_counters = defaultdict(int)
id_counter = {'next': 1}

# Start fresh counter beyond max existing lot_NNNNN
max_existing = 0
for f in lot_features:
    m = re.match(r'^lot_(\d+)$', f['properties'].get('code', ''))
    if m:
        max_existing = max(max_existing, int(m.group(1)))
id_counter['next'] = max_existing + 1

lots_full = []
lots_index = []
status_dist = defaultdict(int)
subdivision_dist = defaultdict(int)
kind_dist = defaultdict(int)
subzone_dist = defaultdict(int)

for f in lot_features:
    p = f['properties']
    sub_zone = p.get('subZone', 'unknown')
    seq_counters[sub_zone] += 1
    sequence = seq_counters[sub_zone]

    subdivision = subdivision_of(sub_zone)
    internal_id = derive_internal_id(
        legacy_code=p.get('code', ''),
        legacy_feature_id=p.get('legacyFeatureId', ''),
        counter=id_counter,
    )
    public_code = derive_public_code(subdivision, p.get('code', ''), sub_zone, sequence)
    local_parts = public_code.split('/')[-1].split('-')
    label_vi = make_label_vi(local_parts)
    label_en = make_label_en(local_parts)

    area = float(p.get('areaM2', 0) or 0)
    frontage = float(p.get('frontageM', 0) or 0)
    direction = float(p.get('directionDeg', 0) or 0)
    status = normalize_status(p.get('legacyStatus'))
    tags = derive_tags(area, frontage, direction, status, sub_zone)
    kind = infer_kind(area, frontage)
    centroid = centroid_of(f['geometry']['coordinates'])

    lot = {
        'internal_id': internal_id,
        'official_lot_code': None,
        'current_geometry': f['geometry'],
        'display_source': 'internal',
        'listing': 'staging',
        'last_official_sync': None,
        'phase': 'hong-phat',
        'subdivision': subdivision,
        'status': status,
        'area_m2': area,
        'frontage_m': frontage,
        'direction_deg': direction,
        'orientation': orientation_of(direction),
        'kind': kind,
        'subZone': sub_zone,
        'code': p.get('code', ''),
        'legacy_feature_id': p.get('legacyFeatureId', ''),
        'coordinate_epoch': p.get('coordinateEpoch', 'legacy_api_offset_aligned'),
        'review_status': p.get('reviewStatus', 'imported'),
        'geometry_status': p.get('geometryStatus', 'unverified'),
        'public_code': public_code,
        'display_label_vi': label_vi,
        'display_label_en': label_en,
        'centroid': centroid,
        'tags': tags,
    }
    lots_full.append(lot)

    status_short = {'available': 'a', 'reserved': 'r', 'sold': 's'}.get(status, 'a')
    lots_index.append({
        'i': internal_id,
        'p': public_code,
        'c': centroid,
        'a': round(area, 1),
        's': status_short + 's',
        'z': sub_zone,
        'k': kind,
    })

    status_dist[status] += 1
    subdivision_dist[subdivision] += 1
    kind_dist[kind] += 1
    subzone_dist[sub_zone] += 1

# Compute bbox
all_lngs, all_lats = [], []
for lot in lots_full:
    for ring in lot['current_geometry']['coordinates']:
        for pt in ring:
            all_lngs.append(pt[0])
            all_lats.append(pt[1])
bbox = [
    round(min(all_lngs), 6), round(min(all_lats), 6),
    round(max(all_lngs), 6), round(max(all_lats), 6),
]

full_doc = {
    '_meta': {
        'purpose': 'Hong Phat lots - staging dataset (2830 polygons minus 381 amenity = 2449 lots)',
        'generated_at': '2026-05-22T00:00:00Z',
        'source': 'http://localhost:3000/tiles/advisory-lots.geojson',
        'source_tier': 'legacy_map_v2_internal',
        'feature_count': len(lots_full),
        'all_display_source': 'internal',
        'all_listing': 'staging',
        'coordinate_epoch_warning': 'All geometries are legacy_api_offset_aligned (+194m East, -114m North vs CDT canonical). Replace when 1/500 plan delivered.',
        'numbering_scheme': '4-tier - see ../NUMBERING-SCHEME.md',
        'bbox_4326': bbox,
        'status_distribution': dict(status_dist),
        'kind_distribution': dict(kind_dist),
        'subzone_distribution': dict(subzone_dist),
    },
    'lots': lots_full,
}
with open(FULL_OUT, 'w', encoding='utf-8') as f:
    json.dump(full_doc, f, ensure_ascii=False, separators=(',', ':'))

index_doc = {
    '_meta': {
        'purpose': 'LOD-optimized lot index - served at /tiles/advisory-manifest.json',
        'generated_at': '2026-05-22T00:00:00Z',
        'source': 'hong-phat-lots-full.json',
        'feature_count': len(lots_index),
        'bbox': bbox,
        'fields': {
            'i': 'internal_id',
            'p': 'public_code',
            'c': 'centroid [lng,lat]',
            'a': 'area m2',
            's': 'status+listing 2-char (as|rs|ss for staging)',
            'z': 'subZone',
            'k': 'kind',
        },
    },
    'lots': lots_index,
}
with open(INDEX_OUT, 'w', encoding='utf-8') as f:
    json.dump(index_doc, f, ensure_ascii=False, separators=(',', ':'))

# Report
full_size = os.path.getsize(FULL_OUT)
idx_size = os.path.getsize(INDEX_OUT)
print(f"\n[OK] hong-phat-lots-full.json   {full_size/1024/1024:.2f} MB   {len(lots_full)} lots")
print(f"[OK] hong-phat-lots-index.json  {idx_size/1024:.1f} KB    {len(lots_index)} entries")
print(f"\nStatus distribution:       {dict(status_dist)}")
print(f"Subdivision distribution:  {dict(subdivision_dist)}")
print(f"Kind distribution:         {dict(kind_dist)}")
print(f"SubZone distribution:      {dict(subzone_dist)}")
print(f"Sequence per subZone:      {dict(seq_counters)}")
print(f"BBox EPSG:4326:            {bbox}")
print(f"\nFirst 3 samples:")
for lot in lots_full[:3]:
    print(f"  {lot['internal_id']} | code={lot['code']!r:18s} -> {lot['public_code']}")
    print(f"    label_vi: {lot['display_label_vi']}")
print(f"\nSample with Pattern A (Hx.x.x.NN) — finding...")
for lot in lots_full:
    if re.match(r'^[A-Z]+\d+\.\d+\.[A-Za-z]\.\d+$', lot['code']):
        print(f"  {lot['internal_id']} | code={lot['code']!r:18s} -> {lot['public_code']}")
        print(f"    label_vi: {lot['display_label_vi']}")
        break
