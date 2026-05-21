"""
DXF → GeoJSON polygon extractor (recursive, INSERT-aware)

Reads HHXL - QH05.2.dxf (or any DXF) and extracts EVERY closed polyline as
a GeoJSON Polygon feature, including geometry nested inside INSERT block
references. This is the correct path for CDT plans where lot boundaries
are stored inside block definitions (e.g. `nen xr - 20220315 - PMH`,
`2021.10 - HHXL- CONCEPT`).

ENTITIES PROCESSED
──────────────────
  LWPOLYLINE, POLYLINE     → if closed → Polygon
  HATCH                    → each path → Polygon
  CIRCLE, ELLIPSE          → approximated as 32-segment Polygon
  SOLID, 3DFACE, TRACE     → 4-vertex Polygon
  INSERT                   → recursively expanded via virtual_entities()

EACH FEATURE'S PROPERTIES
─────────────────────────
  layer            : final AutoCAD layer name (after INSERT inheritance)
  source_entity    : entity type (LWPOLYLINE, HATCH, SOLID, etc.)
  source_block     : top-level block name if from a nested INSERT, else "<modelspace>"
  _coord_system    : "cad_local" (VN-2000 or local CAD units, NOT EPSG:4326)
  area_cad         : polygon area in CAD units squared
  vertex_count     : number of vertices in outer ring

USAGE
─────
    python scripts/dxf-to-geojson.py "HHXL - QH05.2.dxf" \\
        --out data/geometry/_raw-cdt-plan.geojson \\
        --report data/geometry/_cdt-plan-layers.json

OUTPUT FILES
────────────
  --out      : GeoJSON FeatureCollection with all extracted polygons
  --report   : JSON inventory grouped by (layer, source_block, entity_type)

PERFORMANCE
───────────
  ~83 MB DXF with 237 blocks + 1085 modelspace INSERTs typically completes
  in 15-90 seconds. ezdxf streams entities lazily; memory peak ~500 MB.
"""
import argparse
import json
import math
import os
import sys
import warnings
from collections import Counter, defaultdict

# Suppress ezdxf's noisy "ACAD_PROXY_OBJECT ignored" warnings during virtual_entities()
warnings.filterwarnings('ignore')

try:
    import ezdxf
    from ezdxf.math import Vec3
except ImportError:
    print("ERROR: ezdxf not installed. Run: pip install ezdxf>=1.4", file=sys.stderr)
    sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# Ring builders
# ─────────────────────────────────────────────────────────────────────────────

def _round_pt(p):
    if isinstance(p, Vec3):
        return [round(p.x, 4), round(p.y, 4)]
    if hasattr(p, 'x') and hasattr(p, 'y'):
        return [round(p.x, 4), round(p.y, 4)]
    return [round(float(p[0]), 4), round(float(p[1]), 4)]


def _close_ring(ring):
    if len(ring) >= 3 and ring[0] != ring[-1]:
        ring.append(list(ring[0]))
    return ring


def _ring_area(ring):
    """Shoelace area in CAD units²."""
    n = len(ring) - 1  # last == first
    a = 0.0
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2.0


def _approx_circle(cx, cy, r, segments=32):
    ring = []
    for i in range(segments):
        t = 2 * math.pi * i / segments
        ring.append([round(cx + r * math.cos(t), 4), round(cy + r * math.sin(t), 4)])
    ring.append(list(ring[0]))
    return ring


def _approx_ellipse(entity, segments=32):
    """Approximate an ELLIPSE entity to a closed ring."""
    try:
        cx, cy = entity.dxf.center.x, entity.dxf.center.y
        mx, my = entity.dxf.major_axis.x, entity.dxf.major_axis.y
        ratio = entity.dxf.ratio
        a_len = math.sqrt(mx * mx + my * my)
        b_len = a_len * ratio
        rot = math.atan2(my, mx)
        ring = []
        for i in range(segments):
            t = 2 * math.pi * i / segments
            x = a_len * math.cos(t)
            y = b_len * math.sin(t)
            xr = x * math.cos(rot) - y * math.sin(rot) + cx
            yr = x * math.sin(rot) + y * math.cos(rot) + cy
            ring.append([round(xr, 4), round(yr, 4)])
        ring.append(list(ring[0]))
        return ring
    except Exception:
        return None


def _extract_lwpolyline(entity):
    pts = [(p[0], p[1]) for p in entity.get_points('xy')]
    if len(pts) < 3:
        return None, False
    ring = [_round_pt(p) for p in pts]
    return _close_ring(ring), bool(getattr(entity, 'closed', False))


def _extract_polyline(entity):
    pts = []
    for v in entity.vertices:
        loc = v.dxf.location
        pts.append([round(loc.x, 4), round(loc.y, 4)])
    if len(pts) < 3:
        return None, False
    is_closed = entity.is_closed if hasattr(entity, 'is_closed') else False
    return _close_ring(pts), is_closed


def _extract_hatch_paths(entity):
    """HATCH entities expose boundary paths. Each polyline path → ring."""
    rings = []
    for path in entity.paths:
        if hasattr(path, 'vertices'):
            pts = []
            for v in path.vertices:
                if hasattr(v, 'x'):
                    pts.append([round(v.x, 4), round(v.y, 4)])
                else:
                    pts.append([round(float(v[0]), 4), round(float(v[1]), 4)])
            if len(pts) >= 3:
                rings.append(_close_ring(pts))
        elif hasattr(path, 'control_points'):
            # Edge path with splines/arcs — approximate with control points
            pts = [[round(p[0], 4), round(p[1], 4)] for p in path.control_points if len(p) >= 2]
            if len(pts) >= 3:
                rings.append(_close_ring(pts))
    return rings


def _extract_solid(entity):
    """SOLID, TRACE, 3DFACE — 4 vertices forming a quadrilateral."""
    try:
        v0 = entity.dxf.vtx0
        v1 = entity.dxf.vtx1
        v2 = entity.dxf.vtx2
        v3 = entity.dxf.vtx3
        # SOLID winding is 0-1-3-2 (NOT 0-1-2-3)
        ring = [_round_pt(v0), _round_pt(v1), _round_pt(v3), _round_pt(v2)]
        return _close_ring(ring)
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Recursive entity walker
# ─────────────────────────────────────────────────────────────────────────────

def _walk_entities(container, source_block_name, polygons, counter):
    """Yield polygons from container (modelspace OR exploded INSERT).

    Recursively explodes any INSERT encountered."""
    for entity in container:
        kind = entity.dxftype()
        layer = getattr(entity.dxf, 'layer', '?') if hasattr(entity, 'dxf') else '?'

        if kind == 'INSERT':
            try:
                for ve in entity.virtual_entities():
                    _walk_entities([ve], entity.dxf.name, polygons, counter)
            except Exception:
                counter['insert_errors'] += 1
            continue

        try:
            if kind == 'LWPOLYLINE':
                ring, closed = _extract_lwpolyline(entity)
                if ring and closed:
                    polygons.append({
                        'ring': ring, 'kind': kind, 'layer': layer,
                        'block': source_block_name,
                    })
                elif ring:
                    counter['open_polylines'] += 1
            elif kind == 'POLYLINE':
                ring, closed = _extract_polyline(entity)
                if ring and closed:
                    polygons.append({
                        'ring': ring, 'kind': kind, 'layer': layer,
                        'block': source_block_name,
                    })
                elif ring:
                    counter['open_polylines'] += 1
            elif kind == 'HATCH':
                for ring in _extract_hatch_paths(entity):
                    polygons.append({
                        'ring': ring, 'kind': kind, 'layer': layer,
                        'block': source_block_name,
                    })
            elif kind == 'CIRCLE':
                cx, cy = entity.dxf.center.x, entity.dxf.center.y
                ring = _approx_circle(cx, cy, entity.dxf.radius)
                polygons.append({
                    'ring': ring, 'kind': kind, 'layer': layer,
                    'block': source_block_name,
                })
            elif kind == 'ELLIPSE':
                ring = _approx_ellipse(entity)
                if ring:
                    polygons.append({
                        'ring': ring, 'kind': kind, 'layer': layer,
                        'block': source_block_name,
                    })
            elif kind in ('SOLID', 'TRACE', '3DFACE'):
                ring = _extract_solid(entity)
                if ring:
                    polygons.append({
                        'ring': ring, 'kind': kind, 'layer': layer,
                        'block': source_block_name,
                    })
        except Exception:
            counter['extraction_errors'] += 1


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dxf')
    ap.add_argument('--out', required=True)
    ap.add_argument('--report', help='Optional inventory JSON path')
    ap.add_argument('--min-area', type=float, default=0.0,
                    help='Skip polygons with CAD-area below this threshold')
    ap.add_argument('--min-vertices', type=int, default=3,
                    help='Skip rings with fewer than N unique vertices')
    args = ap.parse_args()

    if not os.path.isfile(args.dxf):
        print(f"ERROR: DXF not found: {args.dxf}", file=sys.stderr)
        sys.exit(2)

    print(f"Reading {args.dxf} ...")
    try:
        doc = ezdxf.readfile(args.dxf)
    except Exception as e:
        print(f"ERROR: ezdxf.readfile failed: {e}", file=sys.stderr)
        sys.exit(3)

    msp = doc.modelspace()
    polygons = []
    counter = Counter()

    print(f"Walking modelspace (recursive, INSERT-aware)...")
    _walk_entities(list(msp), '<modelspace>', polygons, counter)
    print(f"  Raw polygons collected: {len(polygons)}")
    print(f"  Open polylines skipped: {counter['open_polylines']}")
    print(f"  INSERT explode errors: {counter['insert_errors']}")
    print(f"  Extraction errors: {counter['extraction_errors']}")

    # Filter min vertices + min area
    filtered = []
    for p in polygons:
        if len(p['ring']) < args.min_vertices + 1:
            continue
        area = _ring_area(p['ring'])
        if area < args.min_area:
            continue
        p['area_cad'] = round(area, 2)
        filtered.append(p)
    print(f"  After filters (min_vertices={args.min_vertices}, min_area={args.min_area}): {len(filtered)}")

    # Build features
    features = []
    bbox = [math.inf, math.inf, -math.inf, -math.inf]
    layer_block_kind_counts = defaultdict(lambda: defaultdict(Counter))

    for p in filtered:
        features.append({
            'type': 'Feature',
            'properties': {
                'layer': p['layer'],
                'source_block': p['block'],
                'source_entity': p['kind'],
                'area_cad': p['area_cad'],
                'vertex_count': len(p['ring']) - 1,
                '_coord_system': 'cad_local',
            },
            'geometry': {'type': 'Polygon', 'coordinates': [p['ring']]},
        })
        layer_block_kind_counts[p['layer']][p['block']][p['kind']] += 1
        for pt in p['ring']:
            if pt[0] < bbox[0]: bbox[0] = pt[0]
            if pt[1] < bbox[1]: bbox[1] = pt[1]
            if pt[0] > bbox[2]: bbox[2] = pt[0]
            if pt[1] > bbox[3]: bbox[3] = pt[1]

    out = {
        '_meta': {
            'source_dxf': os.path.basename(args.dxf),
            'extractor': 'scripts/dxf-to-geojson.py',
            'ezdxf_version': ezdxf.__version__,
            'feature_count': len(features),
            'open_polylines_skipped': counter['open_polylines'],
            'insert_explode_errors': counter['insert_errors'],
            'extraction_errors': counter['extraction_errors'],
            'min_vertices_filter': args.min_vertices,
            'min_area_filter': args.min_area,
            'bbox_cad_local': bbox if bbox[0] != math.inf else None,
            'coord_system': 'cad_local',
            'georeference_status': 'PENDING — apply CAD→EPSG:4326 transform before use',
        },
        'type': 'FeatureCollection',
        'features': features,
    }

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f"\n[OK] {args.out}")
    print(f"  features={len(features)} bbox_cad={bbox}")

    if args.report:
        # Build layer x block x kind report
        report_layers = {}
        for layer, block_dict in layer_block_kind_counts.items():
            total = sum(sum(c.values()) for c in block_dict.values())
            report_layers[layer] = {
                'total': total,
                'by_block': {b: dict(c) for b, c in block_dict.items()},
            }
        report = {
            'source_dxf': os.path.basename(args.dxf),
            'total_features': len(features),
            'layers': dict(sorted(report_layers.items(), key=lambda kv: -kv[1]['total'])),
        }
        with open(args.report, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"  Report: {args.report}")
        print(f"\n  Top 15 layers by polygon count:")
        for layer, info in list(report['layers'].items())[:15]:
            safe = layer.encode('ascii', 'replace').decode('ascii')
            print(f"    {safe:45s} {info['total']:6d}")


if __name__ == '__main__':
    main()
