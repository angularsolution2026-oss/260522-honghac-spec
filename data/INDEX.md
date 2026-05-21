# DATA INDEX — Verified facts from 3 reference sites
**Crawl date:** 2026-05-21
**Method:** WebFetch (AI-processed markdown — not raw HTML, no screenshots)
**Coverage:** 8 pages across 3 domains
**Limitations:** Some sub-pages not crawled (360° tour, full 9-page news pagination, individual project pages on phumyhung.vn). Re-run with deeper crawl if needed.

## Files in this folder

### honghacphumyhung.vn/
- [01-homepage.md](honghacphumyhung/01-homepage.md) — Homepage: specs, location, subdivisions, contacts, distances
- [02-ve-chung-toi.md](honghacphumyhung/02-ve-chung-toi.md) — About: 7S framework detail, mission/vision, Lawrence S. Ting quote
- [03-tin-tuc.md](honghacphumyhung/03-tin-tuc.md) — News listing (9 articles, 9 pages pagination)
- [04-lien-he.md](honghacphumyhung/04-lien-he.md) — Contact: 4 office addresses, form gaps
- [05-article-standard-chartered.md](honghacphumyhung/05-article-standard-chartered.md) — Financing article with SC rates

### hongphat (subdivision)
- [01-overview.md](hongphat/01-overview.md) — Hồng Phát: 1.074 lots, 323-căn current breakdown, product SKUs (VILLA-A/B/C/D, SD-A/B, SH-A-G1.1 etc.), French neoclassical architecture

### phumyhung.vn/
- [01-homepage.md](phumyhung/01-homepage.md) — PMH parent site
- [02-gioi-thieu.md](phumyhung/02-gioi-thieu.md) — Foundation: 1993, Decision 749/TTg, SOM master plan, Lawrence S. Ting
- [03-du-an-portfolio.md](phumyhung/03-du-an-portfolio.md) — 20 PMH projects (7 active, 13 delivered)

---

# 🔥 CRITICAL CORRECTIONS TO `000-spec-v2.md`

The following facts in v2 are **WRONG or INCOMPLETE** — they were inferred. Real values from official sources:

## C1 — Developer attribution (MAJOR ERROR)
- **v2 says:** "phát triển bởi Phú Mỹ Hưng"
- **Reality:** **Co-developed by PMH + Nomura Real Estate Development (Japan)** — explicit "đồng chủ đầu tư" announced 20/12/2025.
- **Fix:** Update all references; brand badge in header must include both logos; add `developer.coDeveloper` field to Payload schema; `/kham-pha-do-thi/pmh-legacy` becomes `/kham-pha-do-thi/pmh-nomura-legacy`.

## C2 — Location precision (ERROR)
- **v2 says:** "Thuận Thành, Bắc Ninh" with coords `[106.0653, 21.0285]`
- **Reality:** **Phường Song Liễu, Tỉnh Bắc Ninh** (Phường Song Liễu is in Thuận Thành historically, but official address says "Phường" directly)
- **Fix:** Use "Phường Song Liễu, T. Bắc Ninh" in addresses; verify exact coords with Google Maps link `https://maps.app.goo.gl/gmdHomzDsijESLSS7`.

## C3 — Project specs (MISSING FACTS)
v2 has only "197.76 ha". Reality also includes:
| Metric | Official value |
|---|---|
| Mật độ xây dựng | **27,9%** |
| Quy mô dân số | **27.700** |
| Cây xanh + mặt nước | **19,6%** |
| Loại sản phẩm | Nhà phố liền kề, biệt thự song lập, biệt thự đơn lập |
| Project value | **~1 tỷ USD** (per Dân Trí 04/2026) |
| Tiền sử dụng đất | **1.400 tỷ VND** |

→ These should appear on `/` hero block + JSON-LD `numberOfResidents` / `landArea`.

## C4 — 7S Framework (MISSING)
v2 doesn't mention 7S at all. Reality: this is the official platform's IA backbone. Must integrate:
- S1 Sustainability · S2 Smart Planning · S3 Service · S4 Standards · S5 Safety · S6 Scarcity · S7 Society
- → Becomes a content cluster at `/kham-pha-do-thi/triet-ly-7s/{s1...s7}` (7 pages)
- → Each S = E-E-A-T anchor for cluster pages

## C5 — Hồng Phát breakdown (MAJOR DATA UPGRADE)
v2 had only "Phase 1 ~few hundred lots". Reality:
- **3 tiểu khu**, total **1.074 products**
- Current visible inventory (probably tiểu khu 1):
  - 17 biệt thự đơn lập (5 SKU types VILLA-A/A1/B/C/D)
  - 42 biệt thự song lập (2 types SD-A/B)
  - 170 shophouse (13 SKUs SH-A/A1-A4/A-G1/A-G1.1/A-G2/B/B1/B-G1/B-G2/C)
  - 94 townhouse (7 SKUs TH-A/A1/A2/A-G1/A-G2/B/B-G2)
- Area ranges: TH 295.87–336.01 m² · SH 382.22–775.36 m² · BTSL ~256–285 m² · BTĐL ~325–418 m²
- **Mật độ XD Hồng Phát = 51,9%** (high — đây không phải khu thưa)
- Architecture: **Tân cổ điển Pháp**
- Form sở hữu: **Sở hữu lâu dài**
- **100% đã có sổ hồng từng căn** ← HUGE trust differentiator

→ Postgres `lots` table needs to hold all 1074 entries. Seed must include real SKU codes.

## C6 — Financing structure (MISSING — biggest CRO miss)
v2's finance tools didn't model the ACTUAL HHC promo. Reality:
- Pre-handover (until ~T6/2027): **0% lãi suất + ân hạn nợ gốc**
- 12 months post-handover: **CDT hỗ trợ 3%/năm** for up to **75% LTV**
- Standard Chartered fixed-rate:
  - 2-year: 6.9% Y1 / 7.3% Y2 (effective 3.9% / 4.3% sau subsidy)
  - 3-year: 6.9% / 7.3% / 7.4% (effective 3.9% / 4.3% / 4.4%)

→ The amortize function's **defaults must use these real numbers**. The "Sample loan" pre-filled on /sa-ban must show: 75% LTV, 25-year tenor, 2-year promo at 6.9%→7.3% with 3% subsidy → reverting to floating after Y2.

## C7 — Handover timeline (MISSING)
- **Dự kiến bàn giao: T6/2027**
→ Update timeline component on homepage and `/tien-do` to reference this exact date.

## C8 — SOM master plan credit (MISSING — major E-E-A-T)
PMH's HCMC project was master-planned by **Skidmore, Owings & Merrill (USA)**. This is a globally-recognized firm.
→ Cite in `/kham-pha-do-thi/pmh-legacy` for authority signaling.

## C9 — PMH legacy specs (UPGRADE editorial credibility)
- PMH HCMC: 2,600 ha total, NVL Boulevard 17.8 km × 120 m wide
- Founded **19/05/1993**, Decision 749/TTg dated 08/12/1994
- Zone A (TT đô thị) = 433 ha
- Founder quote (Lawrence S. Ting) used as masthead on `/kham-pha-do-thi/`

## C10 — Real news cadence (SEO content seed)
News categories from official: **Tin dự án | Tin thị trường**
9 articles in last 6 months. We should match cadence (1–2 articles/month) on our `/tien-do` and a separate `/tin-tuc` we'd add.

## C11 — Phone numbers (CORRECTED)
- HCM HQ: **(028) 3874-8888**
- HN: **(024) 3936-2640** (alt newer HN office Tầng 8, Tòa nhà TNR, 54A Nguyễn Chí Thanh)
- Bắc Ninh project site: **(0222) 3616 888**
- Use these verbatim in Footer + JSON-LD `Organization.contactPoint`.

## C12 — Subdivisions taglines (USE OFFICIAL COPY)
- **Hồng Phát** — KHỞI NGUỒN THỊNH VƯỢNG
- **Hồng Thịnh** — TIẾP MẠCH PHỒN VINH
- **Hồng Phúc** — VỮNG BỀN HẠNH PHÚC

→ Don't invent new taglines; align with official.

## C13 — Form UX (OPPORTUNITY, not correction)
- Official site uses one big "ĐĂNG KÝ" button — violates luxury UX rules from `000-chat.md §13`
- Official site **lacks visible PDPL consent checkbox** + cookie banner
- Our site can outperform here by implementing the multi-step soft-lead funnel from spec §8.3

## C14 — Sales Gallery is physical (NEW lead path)
- Sales Gallery exists at Bắc Ninh project site
- → Our `/tu-van/dat-lich-tham-quan` must integrate with their booking flow (or coordinate via Telegram alert)

## C15 — "Phố Xuân Hồng Hạc City" check-in installations
- Hồng Hạc Thịnh Vượng / Bộ Số 2026 / Phi Mã Tiến Vinh
- → Lifestyle imagery section + UGC reposting opportunity

## C16 — Social media handles (USE THESE, not fabricated)
- FB: facebook.com/honghaccity.official
- YT: youtube.com/@honghaccityofficial
- Zalo: zalo.me/3268698206670405210

## C17 — Triton Crown reference (NEW comparable)
- New PMH project HCMC, groundbreaking 20/05/2026
- Use in `/tiem-nang` to demonstrate active pipeline

---

# Items to update in spec v3

1. Re-write §0 Executive Summary: include Nomura + 1 tỷ USD + 100% sổ hồng
2. Re-write §3 VP: add SC financing + sổ hồng as moat layers
3. Update §4 IA: add `/kham-pha-do-thi/triet-ly-7s/*` cluster (7 sub-pages)
4. Update §5.1 hero: real specs (27.9% / 27.700 / 19.6%)
5. **Major rewrite of §7 Financial Tools:** defaults must match real HHC offer (0% promo + 3% subsidy + SC fixed rates)
6. Update §10 Trust: "100% sổ hồng" + SOM credential + Decision 749/TTg + Lawrence S. Ting quote
7. Update §14.1 domain types: Lot SKU code patterns (VILLA-*, SD-*, SH-*, TH-*)
8. Update §14.2 Postgres: seed will be 1074 lots with real SKU codes
9. Update §15 Deployment: real `bacninhhonghaccity.vn` references → I should ask if this is still their URL or if it's a separate site

---

# What we still don't know (next crawl scope)
- Pricing per SKU (CDT keeps private — likely needs in-person Sales Gallery)
- Exact polygon geometry for 3 subdivisions + 1074 lots (would need PDF site plan or paid GIS data)
- English-language version (https://honghacphumyhung.vn/en/) — for our /en/ locale strings
- Hồng Thịnh + Hồng Phúc detail pages (may not exist yet on official site)
- Privacy policy + Terms text (official site lacks visible /privacy)
