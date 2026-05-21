"""
DXF → GeoJSON polygon extractor for HHXL - QH05.2

Reads the official 1/500 plan (in DXF form after ODA conversion from DWG)
and extracts every closed polyline as a GeoJSON Polygon feature, grouped
by AutoCAD layer.

PREREQUISITES
─────────────
1. Convert the source DWG to DXF (see data/geometry/DWG-IMPORT.md)
   Result expected at: HHXL - QH05.2.dxf

2. Install ezdxf (already installed):
   pip install ezdxf>=1.4

USAGE
─────
    python scripts/dxf-to-geojson.py "HHXL - QH05.2.dxf" \\
        --out data/geometry/_raw-cdt-plan.geojson \\
        --report data/geometry/_cdt-plan-layers.json

The --report flag emits a layer inventory (entity counts per layer) so we
can identify which layers hold lot boundaries vs road centrelines vs amenity
polygons vs annotations.

COORDINATE SYSTEM CAVEAT
────────────────────────
DXF coordinates are in the drawing's *local CAD units* — typically VN-2000
or a local survey grid in meters, NOT EPSG:4326 lng/lat.

Output GeoJSON has coordinates in CAD units. Georeferencing (CAD → 4326)
requires either:
  (a) Surveyor-supplied affine transform matrix
  (b) ≥ 3 control points with known (CAD_x, CAD_y) ↔ (lng, lat) pairs
  (c) Embedded geo-spatial info in the DXF (rare for VN survey plans)

Output _raw-cdt-plan.geojson will carry property `_coord_system: "cad_local"`
to flag that downstream consumers must transform before merging with
existing 4326 datasets.
"""
import argparse
import json
import os
import sys
from collections import Counter, defaultdict

try:
    import ezdxf
    from ezdxf.math import Vec3
except ImportError:
    print("ERROR: ezdxf not installed. Run: pip install ezdxf>=1.4", file=sys.stderr)
    sys.exit(1)


def coerce_2d_ring(points):
    """Convert a sequence of points (2D or 3D, tuples or Vec3) to GeoJSON 2D ring.

    Closes the ring if not already closed."""
    ring = []
    for p in points:
        if isinstance(p, Vec3):
            ring.append([round(p.x, 4), round(p.y, 4)])
        elif len(p) >= 2:
            ring.append([round(float(p[0]), 4), round(float(p[1]), 4)])
    if len(ring) >= 3 and ring[0] != ring[-1]:
        ring.append(ring[0])
    return ring


def extract_lwpolyline(entity):
    """LWPOLYLINE → ring of [x, y] (drops bulge for now — straight-line approx)."""
    pts = [(p[0], p[1]) for p in entity.get_points('xy')]
    return coerce_2d_ring(pts), entity.closed


def extract_polyline(entity):
    """Legacy POLYLINE entity (vertex sub-entities)."""
    pts = [(v.dxf.location.x, v.dxf.location.y) for v in entity.vertices]
    return coerce_2d_ring(pts), entity.is_closed


def extract_hatch_boundary(entity):
    """HATCH entities expose boundary paths — extract first polyline path."""
    rings = []
    for path in entity.paths:
        # Polyline path
        if hasattr(path, 'vertices'):
            ring = coerce_2d_ring(path.vertices)
            if len(ring) >= 4:
                rings.append(ring)
    return rings


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dxf', help='Path to source DXF file')
    ap.add_argument('--out', required=True, help='Output GeoJSON path')
    ap.add_argument('--report', help='Optional layer inventory JSON path')
    ap.add_argument('--min-vertices', type=int, default=3,
                    help='Skip rings with fewer than N vertices (default 3)')
    args = ap.parse_args()

    if not os.path.isfile(args.dxf):
        print(f"ERROR: DXF not found: {args.dxf}", file=sys.stderr)
        sys.exit(2)

    print(f"Reading {args.dxf} ...")
    try:
        doc = ezdxf.readfile(args.dxf)
    except Exception as e:
        print(f"ERROR: ezdxf.readfile failed: {e}", file=sys.stderr)
        print("If this is a DWG file, convert to DXF first using ODA File Converter.",
              file=sys.stderr)
        sys.exit(3)

    msp = doc.modelspace()

    layer_entity_counts = defaultdict(Counter)
    features = []
    total_polygons = 0
    total_open_polylines = 0
    total_skipped = 0

    for entity in msp:
        kind = entity.dxftype()
        layer = entity.dxf.layer if hasattr(entity.dxf, 'layer') else '?'
        layer_entity_counts[layer][kind] += 1

        ring = None
        closed = False
        try:
            if kind == 'LWPOLYLINE':
                ring, closed = extract_lwpolyline(entity)
            elif kind == 'POLYLINE':
                ring, closed = extract_polyline(entity)
            elif kind == 'HATCH':
                # HATCH may have multiple boundary rings
                for sub_ring in extract_hatch_boundary(entity):
                    if len(sub_ring) >= args.min_vertices + 1:
                        features.append({
                            'type': 'Feature',
                            'properties': {
                                'layer': layer,
                                'source_entity': 'HATCH',
                                '_coord_system': 'cad_local',
                            },
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [sub_ring],
                            },
                        })
                        total_polygons += 1
                continue
            elif kind in ('CIRCLE', 'ELLIPSE', 'ARC'):
                # Approximate curves to polygons (32 segments)
                from ezdxf.math import ConstructionCircle
                if kind == 'CIRCLE':
                    cx, cy = entity.dxf.center.x, entity.dxf.center.y
                    r = entity.dxf.radius
                    import math
                    ring = [
                        [round(cx + r * math.cos(2 * math.pi * i / 32), 4),
                         round(cy + r * math.sin(2 * math.pi * i / 32), 4)]
                        for i in range(32)
                    ]
                    ring.append(ring[0])
                    closed = True
                else:
                    continue
            else:
                continue
        except Exception as ex:
            total_skipped += 1
            continue

        if ring is None:
            continue
        if len(ring) < args.min_vertices + 1:
            total_skipped += 1
            continue
        if not closed:
            total_open_polylines += 1
            continue

        features.append({
            'type': 'Feature',
            'properties': {
                'layer': layer,
                'source_entity': kind,
                '_coord_system': 'cad_local',
            },
            'geometry': {
                'type': 'Polygon',
                'coordinates': [ring],
            },
        })
        total_polygons += 1

    # Compute bbox in CAD units
    if features:
        xs = [pt[0] for f in features for pt in f['geometry']['coordinates'][0]]
        ys = [pt[1] for f in features for pt in f['geometry']['coordinates'][0]]
        bbox = [min(xs), min(ys), max(xs), max(ys)]
    else:
        bbox = None

    out = {
        '_meta': {
            'source_dxf': os.path.basename(args.dxf),
            'extractor': 'scripts/dxf-to-geojson.py',
            'ezdxf_version': ezdxf.__version__,
            'feature_count': len(features),
            'total_polygons': total_polygons,
            'open_polylines_skipped': total_open_polylines,
            'errors_skipped': total_skipped,
            'bbox_cad_local': bbox,
            'coord_system': 'cad_local',
            'georeference_status': 'PENDING — apply CAD→EPSG:4326 transform before use',
        },
        'type': 'FeatureCollection',
        'features': features,
    }

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f"\n[OK] Wrote {args.out}")
    print(f"  Features:           {len(features)}")
    print(f"  Closed polygons:    {total_polygons}")
    print(f"  Open polylines:     {total_open_polylines} (skipped — not polygons)")
    print(f"  Errors:             {total_skipped}")
    print(f"  BBox (CAD units):   {bbox}")

    if args.report:
        report = {
            'source': os.path.basename(args.dxf),
            'layers': {
                layer: dict(counts)
                for layer, counts in sorted(
                    layer_entity_counts.items(),
                    key=lambda kv: -sum(kv[1].values()),
                )
            },
        }
        with open(args.report, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"  Layer report:       {args.report}")
        print(f"\n  Top 10 layers by entity count:")
        for layer, counts in list(report['layers'].items())[:10]:
            total = sum(counts.values())
            kinds_str = ', '.join(f"{k}={v}" for k, v in counts.items())
            print(f"    {layer:40s} {total:6d}  ({kinds_str})")


if __name__ == '__main__':
    main()
