"""
Generate data/seo/lot-seo-metadata.json with 5 real sample SEO entries
sourced from hong-phat-lots-full.json — one per kind for coverage.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FULL = os.path.join(ROOT, 'data', 'geometry', 'hong-phat-lots-full.json')
SEO_OUT = os.path.join(ROOT, 'data', 'seo', 'lot-seo-metadata.json')

with open(FULL, 'r', encoding='utf-8') as f:
    full = json.load(f)

lots = full['lots']

# Find 5 representative samples — one per kind, prefer status=available
samples_by_kind = {}
kinds_wanted = ['villa-don-lap', 'villa-song-lap', 'shophouse', 'townhouse', 'townhouse-compact']
for kind in kinds_wanted:
    candidates = [
        l for l in lots
        if l['kind'] == kind and l['status'] == 'available' and l['public_code'].count('-') >= 3
    ]
    if not candidates:
        candidates = [l for l in lots if l['kind'] == kind]
    if candidates:
        # Prefer "Pattern A" public_code (has block-sub-row-lot)
        ranked = sorted(
            candidates,
            key=lambda l: (
                -l['public_code'].count('-'),
                'huong-tot' not in l['tags'],
                l['internal_id'],
            ),
        )
        samples_by_kind[kind] = ranked[0]

KIND_LABEL_VI = {
    'villa-don-lap': 'Biệt thự đơn lập',
    'villa-song-lap': 'Biệt thự song lập',
    'shophouse': 'Shophouse',
    'townhouse': 'Nhà phố liền kề',
    'townhouse-compact': 'Nhà phố compact',
}
KIND_LABEL_EN = {
    'villa-don-lap': 'Detached villa',
    'villa-song-lap': 'Duplex villa',
    'shophouse': 'Shophouse',
    'townhouse': 'Townhouse',
    'townhouse-compact': 'Compact townhouse',
}
ORIENT_VI = {
    'N': 'Bắc', 'NE': 'Đông Bắc', 'E': 'Đông', 'SE': 'Đông Nam',
    'S': 'Nam', 'SW': 'Tây Nam', 'W': 'Tây', 'NW': 'Tây Bắc',
}


def build_sample(lot):
    kind = lot['kind']
    kind_vi = KIND_LABEL_VI.get(kind, kind)
    kind_en = KIND_LABEL_EN.get(kind, kind)
    area = lot['area_m2']
    area_label = f"{area:.0f}m²" if area == int(area) else f"{area:.1f}m²"
    orient = lot['orientation']
    orient_vi = ORIENT_VI.get(orient, orient)
    public = lot['public_code']
    slug_only = public.split('/')[-1]
    park_tag = 'view-cong-vien' in lot['tags']
    huong_tot = 'huong-tot' in lot['tags']
    is_indexable = (
        lot['listing'] == 'public'
        and lot['status'] != 'sold'
        and lot['display_source'] == 'official'
    )
    long_tail = [
        f"{kind_vi.lower()} {area_label} hướng {orient_vi.lower()} Bắc Ninh",
        f"mua {kind_vi.lower()} {slug_only} Hồng Hạc City có sổ hồng",
        f"{kind_vi.lower()} block {lot['subZone']} Hồng Phát",
    ]
    if huong_tot:
        long_tail.append(f"{kind_vi.lower()} hướng tốt Hồng Phát {area_label}")
    if park_tag:
        long_tail.append(f"{kind_vi.lower()} view công viên Hồng Phát")
    title = f"{kind_vi} {slug_only.upper()} {area_label} — Hồng Phát"
    if len(title) > 60:
        title = f"{kind_vi} {area_label} — Hồng Phát"
    description = (
        f"Lô {slug_only} phân khu Hồng Phát, diện tích {area_label}, "
        f"hướng {orient_vi}. Khám phá vị trí trên sa bàn tương tác Hồng Hạc City."
    )
    if len(description) > 155:
        description = description[:152] + '...'
    h1 = f"{kind_vi} {slug_only.upper()} {area_label} — Phân khu Hồng Phát"
    return {
        'internal_id': lot['internal_id'],
        'slug': slug_only,
        'canonical_url': f"https://bacninhhonghaccity.vn/sa-ban/hong-phat/lo/{slug_only}",
        'indexable': is_indexable,
        '_indexable_reason': (
            'Tier=public + status!=sold + source=official'
            if is_indexable
            else f"listing={lot['listing']}, status={lot['status']}, source={lot['display_source']} — noindex utility URL until CDT publishes"
        ),
        'title': title,
        'description': description,
        'h1': h1,
        'og_image_url': f"https://cdn.bacninhhonghaccity.vn/og/lots/{lot['internal_id']}.jpg",
        'primary_keyword': f"{kind_vi.lower()} {slug_only.upper()} Hồng Phát",
        'secondary_keywords': [
            f"{kind_vi.lower()} {area_label} Bắc Ninh",
            f"{slug_only.upper()} Hồng Hạc City giá",
            f"{kind_vi.lower()} sổ hồng từng căn Bắc Ninh",
        ],
        'long_tail_keywords': long_tail,
        'jsonld': {
            '@context': 'https://schema.org',
            '@type': 'Place',
            'name': f"Lô {slug_only.upper()} {area_label} — Phân khu Hồng Phát",
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': 'Phường Song Liễu',
                'addressRegion': 'Bắc Ninh',
                'addressCountry': 'VN',
            },
            'geo': {
                '@type': 'GeoCoordinates',
                'latitude': lot['centroid'][1],
                'longitude': lot['centroid'][0],
            },
        },
        'breadcrumbs': [
            {'name': 'Trang chủ', 'url': '/'},
            {'name': 'Sa bàn', 'url': '/sa-ban'},
            {'name': 'Hồng Phát', 'url': '/sa-ban/hong-phat'},
            {'name': f"{kind_vi} {slug_only.upper()}",
             'url': f"/sa-ban/hong-phat/lo/{slug_only}"},
        ],
        'internal_links': [
            {'url': '/sa-ban/hong-phat',
             'anchor': 'Xem trên sa bàn tương tác', 'priority': 'P0'},
            {'url': f"/sa-ban/hong-phat?subZone={lot['subZone']}",
             'anchor': f"Các lô khác block {lot['subZone'].upper()}",
             'priority': 'P1'},
            {'url': f"/sa-ban/hong-phat?kind={kind}",
             'anchor': f"Các {kind_vi} khác trong Hồng Phát",
             'priority': 'P1'},
            {'url': '/phap-ly/so-hong',
             'anchor': '100% sổ hồng từng căn', 'priority': 'P0'},
        ],
        'body_blocks': [
            {'kind': 'specs', 'data': {
                'area_m2': area,
                'frontage_m': lot['frontage_m'],
                'orientation': orient,
                'kind': kind,
                'sku': slug_only.upper(),
                'subZone': lot['subZone'],
            }},
            {'kind': 'location', 'nearby_amenities': [
                {'name': 'Công viên trung tâm', 'distance_m': 'TODO_compute_from_geometry'},
                {'name': 'Trường liên cấp', 'distance_m': 'TODO_compute_from_geometry'},
                {'name': 'Trung tâm thương mại', 'distance_m': 'TODO_compute_from_geometry'},
            ]},
            {'kind': 'lifestyle_match', 'personas': (
                ['dau-tu'] if kind == 'shophouse'
                else ['gia-dinh', 'o-thuc'] if 'villa' in kind
                else ['o-thuc']
            )},
            {'kind': 'financing', 'ltv_max': 0.75, 'promo_months': 18,
             'subsidy_months': 12, 'subsidy_pct': 3.0},
            {'kind': 'evidence',
             'doc_kinds': ['so-hong', 'quy-hoach-1-500', 'gpxd']},
        ],
        'last_generated_at': '2026-05-22T00:00:00Z',
    }


# Build samples
samples = [build_sample(samples_by_kind[k]) for k in kinds_wanted if k in samples_by_kind]

seo_doc = {
    '_meta': {
        'purpose': 'Programmatic SEO metadata - generate ~2449 /sa-ban/hong-phat/lo/{slug} pages',
        'schema': 'LotSeoMetadata (see ../types/honghac.ts)',
        'expected_page_count_when_full': 2449,
        'current_count': 0,
        'sample_count': len(samples),
        'source_data': 'data/geometry/hong-phat-lots-full.json',
        'status': 'TEMPLATE READY - data array empty; samples populated for QA reference',
        'indexability_rules': {
            'indexable_when_ALL': [
                'listing === "public"',
                'status !== "sold"',
                'display_source === "official"',
            ],
            'currently_indexable': 0,
            'reason': 'All 2449 lots are listing=staging until CDT 1/500 plan delivered',
        },
        'title_template': '{kind_label} {sku} {area_label} - Hong Phat',
        'description_template': 'Lo {slug} phan khu Hong Phat, dien tich {area_label}, huong {orientation_label}. Kham pha vi tri tren sa ban tuong tac Hong Hac City.',
        'keyword_templates': {
            'primary': '{kind_label} {sku} Hong Phat Hong Hac City',
            'secondary': [
                '{kind_label} {area_label} Bac Ninh',
                '{sku} Hong Hac City gia',
                '{kind_label} so hong tung can Bac Ninh',
            ],
            'long_tail_patterns': [
                '{kind_label} lo goc phan khu Hong Phat',
                '{kind_label} view cong vien Hong Phat {area_label}',
                '{kind_label} view mat nuoc Hong Hac City',
                '{kind_label} {area_label} huong {orientation_label} Bac Ninh',
                'Mua {kind_label} {sku} Hong Hac City co so hong',
                '{kind_label} block {subZone} Hong Phat',
            ],
        },
        'jsonld_schema': 'Place when staging; RealEstateListing when public+price; Product when public+no-price',
        'internal_link_strategy': {
            'from_lot_page': [
                {'to': '/sa-ban/hong-phat', 'anchor_pattern': 'Xem tren sa ban tuong tac', 'priority': 'P0'},
                {'to': '/sa-ban/hong-phat?subZone={subZone}', 'anchor_pattern': 'Cac lo khac block {subZone}', 'priority': 'P1'},
                {'to': '/sa-ban/hong-phat?kind={kind}', 'anchor_pattern': 'Cac {kind_label} khac', 'priority': 'P1'},
                {'to': '/phap-ly/so-hong', 'anchor_pattern': '100% so hong tung can', 'priority': 'P0'},
            ],
        },
        'generation_pipeline': [
            'Step 1: Read lots from data/geometry/hong-phat-lots-full.json',
            'Step 2: For each lot run scripts/generate-lot-seo.mjs (TBD)',
            'Step 3: Emit per-lot MDX or DB record in pages collection',
            'Step 4: Update sitemap-sa-ban.xml (only indexable=true entries)',
            'Step 5: Build-time validate uniqueness of titles + canonical URLs',
        ],
        'kind_label_map': {
            'villa-don-lap': 'Biet thu don lap',
            'villa-song-lap': 'Biet thu song lap',
            'shophouse': 'Shophouse',
            'townhouse': 'Nha pho lien ke',
            'townhouse-compact': 'Nha pho compact',
        },
        'orientation_label_map': {
            'N': 'Bac', 'NE': 'Dong Bac', 'E': 'Dong', 'SE': 'Dong Nam',
            'S': 'Nam', 'SW': 'Tay Nam', 'W': 'Tay', 'NW': 'Tay Bac',
        },
    },
    'pages': [],
    'samples': samples,
}

with open(SEO_OUT, 'w', encoding='utf-8') as f:
    json.dump(seo_doc, f, ensure_ascii=False, indent=2)

import os as _os
sz = _os.path.getsize(SEO_OUT)
print(f"[OK] {SEO_OUT}")
print(f"  Size: {sz/1024:.1f} KB")
print(f"  Samples: {len(samples)}")
for s in samples:
    print(f"    - {s['internal_id']} | {s['slug']} | indexable={s['indexable']}")
