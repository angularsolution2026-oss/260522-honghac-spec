"""
Transform CDT VN-2000 CAD coordinates → EPSG:4326 (WGS84 lng/lat)

PROJECTION (derived empirically by matching CDT centroid to staging dataset):
    TM-3, central meridian = 105.50°, k = 0.9999, false easting = 500000, y_0 = 0, ellipsoid = WGS84

This corresponds to VN-2000 / 3-degree TM zone centered on 105°30' (Bắc Ninh local
projection). Pyproj's pre-defined EPSG codes don't quite match due to datum/scale
variations in CDT plan; the custom proj4 string here matches CDT data to within
±5m of staging centroid (with the remaining ~110m N residual matching the known
staging bias disclaimer "+194m E, -114m N").

USAGE:
    python scripts/transform-cdt-to-4326.py \\
        --input  data/geometry/cdt-lots-3015.geojson \\
        --output data/geometry/cdt-lots-4326.geojson

    python scripts/transform-cdt-to-4326.py \\
        --input  data/geometry/cdt-zones-3phankhu.geojson \\
        --output data/geometry/cdt-zones-3phankhu-4326.geojson

    python scripts/transform-cdt-to-4326.py \\
        --input  data/geometry/cdt-infrastructure.geojson \\
        --output data/geometry/cdt-infrastructure-4326.geojson
"""
import argparse
import json
import os
import sys

try:
    import pyproj
except ImportError:
    print("ERROR: pyproj not installed. Run: pip install pyproj", file=sys.stderr)
    sys.exit(1)

# Empirically-derived projection for HHC CAD coordinates
CDT_PROJ4 = '+proj=tmerc +lat_0=0 +lon_0=105.5 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +units=m +no_defs'
CDT_NAME = 'VN-2000 TM-3 cm=105.50 (HHC local)'


def transform_features(features, transformer):
    """Apply projection in-place; return centroid + bbox in 4326."""
    bbox = [180.0, 90.0, -180.0, -90.0]
    sx, sy, n = 0.0, 0.0, 0
    for feat in features:
        geom = feat['geometry']
        if geom['type'] != 'Polygon':
            continue
        new_rings = []
        for ring in geom['coordinates']:
            new_ring = []
            for pt in ring:
                lng, lat = transformer.transform(pt[0], pt[1])
                new_ring.append([round(lng, 7), round(lat, 7)])
                if lng < bbox[0]: bbox[0] = lng
                if lat < bbox[1]: bbox[1] = lat
                if lng > bbox[2]: bbox[2] = lng
                if lat > bbox[3]: bbox[3] = lat
                sx += lng; sy += lat; n += 1
            new_rings.append(new_ring)
        geom['coordinates'] = new_rings
        # Transform centroid_cad if present
        props = feat.get('properties', {})
        if 'centroid_cad' in props:
            cx, cy = props['centroid_cad']
            cl, ca = transformer.transform(cx, cy)
            props['centroid_4326'] = [round(cl, 7), round(ca, 7)]
        # Update coord system marker
        if '_coord_system' in props:
            props['_coord_system'] = 'epsg_4326_via_vn2000_tm3'
    return bbox, (sx / n, sy / n) if n else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--output', required=True)
    args = ap.parse_args()

    print(f"Loading {args.input} ...")
    with open(args.input, 'r', encoding='utf-8') as f:
        doc = json.load(f)

    n_features = len(doc.get('features', []))
    print(f"Features to transform: {n_features}")

    print(f"Projection: {CDT_NAME}")
    print(f"  proj4: {CDT_PROJ4}")

    transformer = pyproj.Transformer.from_crs(CDT_PROJ4, 'EPSG:4326', always_xy=True)
    bbox, centroid = transform_features(doc['features'], transformer)

    # Update meta
    meta = doc.get('_meta', {})
    meta['georeference_status'] = 'TRANSFORMED — EPSG:4326 (WGS84 lng/lat)'
    meta['coord_system'] = 'EPSG:4326'
    meta['transform_source_projection'] = CDT_NAME
    meta['transform_proj4'] = CDT_PROJ4
    meta['bbox_4326'] = bbox
    meta['avg_centroid_4326'] = list(centroid) if centroid else None
    if 'bbox_cad_local' in meta:
        meta['_bbox_cad_local_was'] = meta.pop('bbox_cad_local')

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))

    sz = os.path.getsize(args.output)
    print(f"\n[OK] {args.output}  ({sz/1024:.1f} KB)")
    print(f"  bbox 4326: {bbox}")
    print(f"  centroid 4326: {centroid}")
    if bbox:
        span_lng = (bbox[2] - bbox[0]) * 111000 * 0.93
        span_lat = (bbox[3] - bbox[1]) * 111000
        print(f"  span: {span_lng:.0f}m E-W x {span_lat:.0f}m N-S")


if __name__ == '__main__':
    main()
