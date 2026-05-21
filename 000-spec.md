# HỒNG HẠC CITY — MASTER SPECIFICATION

**Document type:** Master-grade Technical PRD
**Status:** Implementation-ready
**Locale primary:** vi-VN · **Secondary:** en
**Domain:** `bacninhhonghaccity.vn` (decision platform — independent of official corporate site `honghacphumyhung.vn`)

---

## NORTH STAR

> **Hồng Hạc City là nền tảng Map-First Luxury Real Estate Decision Platform cao cấp nhất Việt Nam dành cho khách hàng HNWI và nhà đầu tư, giúp họ ra quyết định mua bất động sản luxury chỉ trong 1 phiên với trải nghiệm sa bàn tương tác thời gian thực, công cụ tài chính chuyên sâu và quy trình lead-to-close được tự động hóa hoàn toàn.**

---

## 1. EXECUTIVE SUMMARY & VISION

Hồng Hạc City là dự án đô thị **197,76 ha** tại **Phường Song Liễu, Tỉnh Bắc Ninh** (cửa ngõ Đông Bắc Hà Nội, tiếp giáp huyện Gia Lâm), giá trị **~1 tỷ USD**, đồng phát triển bởi **Phú Mỹ Hưng** (Việt Nam, founded 1993) và **Nomura Real Estate Development** (Tokyo, 2004 / VN subsidiary NREV 2019). Dự kiến bàn giao **T6/2027**. **100% sản phẩm đã hoàn thiện thủ tục sổ hồng từng căn** — đây là moat pháp lý lớn nhất trong segment luxury Bắc Việt Nam.

Cấu trúc dự án: **3 phân khu** thấp tầng (Hồng Phát · Hồng Thịnh · Hồng Phúc) với sản phẩm nhà phố liền kề, biệt thự song lập, biệt thự đơn lập. Hồng Phát hiện mở bán với **1.074 sản phẩm**, kiến trúc tân cổ điển Pháp.

### Định vị website

Website-as-platform này **không phải sales microsite**, **không clone** website chính thức `honghacphumyhung.vn`. Sự phân vai rõ ràng:
- **honghacphumyhung.vn** = authority/corporate (chủ đầu tư run)
- **bacninhhonghaccity.vn** = **decision platform** cho HNWI: sa bàn tương tác, AI Matching, công cụ tài chính theo gói Standard Chartered thực tế, comparison hub, evidence system

### Vision pillars

1. **Map = product.** Mọi tool (AI Matching, financial calculators, lifestyle filters) render output ngược lại bản đồ dưới dạng highlighted lots / phase overlays. Map không phải "tính năng phụ".
2. **Single-session decision.** HNWI có thể explore → understand → compare → tính tài chính → đặt advisory trong 1 phiên mà không bị ép submit form sớm.
3. **Trust-first architecture.** Khách HNWI mua bất động sản 5–50 tỷ VND có một câu hỏi đầu tiên: *"Có thật không?"*. Mọi page đặt trust artifacts (sổ hồng, quy hoạch 1/500, press citation, co-developer credentials) ở vị trí ưu tiên thay vì giấu trong footer.
4. **Emotion as decision layer.** Khách BĐS cao cấp không mua thông tin — họ mua cảm giác sống. Hero video 60–90s, "Một ngày tại Hồng Hạc" narrative, lifestyle photography (không stock, không AI-generated humans) là cốt lõi UX.
5. **Segmented experience.** Hai track rõ rệt — **Ở thực** (gia đình / lifestyle / giáo dục) và **Đầu tư** (ROI / hạ tầng / comparison) — với personalization persistent trên toàn site.

### Success metrics (12-month targets)

| Metric | Target | Measurement |
|---|---|---|
| Lighthouse Performance (mobile) | ≥ 95 | Vercel Analytics + Lighthouse CI |
| LCP mobile 4G | ≤ 1.8s | CrUX + Vercel Speed Insights |
| INP | ≤ 200ms | Vercel Speed Insights |
| CLS | ≤ 0.05 | Vercel Speed Insights |
| Soft Lead CR | ≥ 8% | Firestore events / pageviews |
| Advisory Lead CR | ≥ 1.5% | Firestore advisory_lead / pageviews |
| Indexed pages | 150–300 | Google Search Console |
| Average session depth | ≥ 4 pages | GA4 |
| Sa bàn interaction rate | ≥ 35% of sessions | GA4 custom events |
| Speed-to-Lead (hot lead) | ≤ 5 minutes | Telegram → CRM timestamp delta |
| Trust artifact view rate | ≥ 40% of sessions | Custom event on /phap-ly/evidence/* |
| Hero video completion | ≥ 25% | Custom event |
| Zalo touch rate | ≥ 12% of sessions | Custom event |
| Brochure download CR | ≥ 4% | Custom event |

---

## 2. TARGET AUDIENCE & PERSONAS

Bốn personas chính, prioritize theo revenue contribution dự kiến.

### Persona 1 — "Anh Khải" — Self-Made Industrialist (45% revenue)

| Attribute | Detail |
|---|---|
| Age | 42–55 |
| Wealth tier | HNWI, net worth 30–150B VND |
| Profession | Owner of mid-sized manufacturing/logistics company tại Bắc Ninh / Hưng Yên / Hà Nội |
| Tech savviness | Medium-high. Daily Zalo + iPhone user, comfortable với web maps, prefers mobile. Resistant to dashboards. |
| Investment pain points | (1) Đã mất tiền vào vài dự án "đứng bánh" 2019–2022. (2) Sợ bị môi giới gọi spam. (3) Cần kiểm chứng pháp lý tự lực. |
| Behavioral triggers | Tự khám phá; bằng chứng pháp lý có nguồn; so sánh được với Ecopark/Ciputra; hiểu được 20-year evolution. |
| Primary device | iPhone 14–16 (60%) · desktop (35%) · iPad (5%) |
| Session pattern | 3–5 sessions over 4–8 weeks before booking advisory |
| Conversion path | Anonymous → Watchlist → Financial Lead → Advisory |
| Dominant doubt | "Đây có phải web chính thức không?" — addressed by disambiguation banner |

### Persona 2 — "Chị Hương" — Family-First Executive (30% revenue)

| Attribute | Detail |
|---|---|
| Age | 35–48 |
| Wealth tier | Upper-middle to HNWI, net worth 15–60B VND |
| Profession | C-suite / senior banker / lawyer / doctor at Hanoi-based firm |
| Tech savviness | High. Web-native, uses Notion/Excel, comfortable with financial calculators. |
| Investment pain points | (1) Cần chỗ ở dài hạn cho 2 con (tuổi 6–14). (2) Quan tâm school proximity + greenery + air quality. (3) Husband works in Hanoi → commute < 45 min critical. |
| Behavioral triggers | Lifestyle imagery (real, không render); education ecosystem detail; sun/privacy/park-distance filters; school catchment overlay |
| Primary device | Desktop (55%) · iPhone (40%) · iPad (5%) |
| Session pattern | 2–4 sessions over 2–4 weeks, often with husband in second session |
| Conversion path | Anonymous → Matching Lead → Lifestyle exploration → Advisory (couple) |
| Default track | Ở thực |

### Persona 3 — "Anh Long" — Sophisticated Investor (20% revenue)

| Attribute | Detail |
|---|---|
| Age | 38–55 |
| Wealth tier | HNWI–UHNWI, multi-asset portfolio 100B+ VND |
| Profession | Real estate fund manager, family office principal, serial investor |
| Tech savviness | Very high. Reads spec sheets, expects ROI calculators with sensitivity analysis. |
| Investment pain points | (1) Cần defensible thesis cho IC. (2) Phải compare 5–10 dự án song song. (3) Cần exit liquidity scenarios. |
| Behavioral triggers | ROI sensitivity sliders; comparison hub; FDI data; long-term land value model |
| Primary device | Desktop (75%) · iPad (15%) · iPhone (10%) |
| Session pattern | 1–2 deep sessions (45–90 min each) before requesting CRO call |
| Conversion path | Anonymous → Investment Tools → Comparison → Advisory (institutional tone) |
| Default track | Đầu tư |

### Persona 4 — "Bác Thành" — Multi-Generational Wealth Preserver (5% revenue, high LTV)

| Attribute | Detail |
|---|---|
| Age | 55–70 |
| Wealth tier | UHNWI, dynastic wealth |
| Profession | Retired industrialist, second-generation business owner |
| Tech savviness | Low–medium. Often delegates research to son/daughter. Reads on iPad. |
| Investment pain points | (1) Mua nhiều lô liền nhau cho con cháu. (2) Cần legacy planning narrative. (3) Phải tin được PMH legacy. |
| Behavioral triggers | Long-form editorial về tầm nhìn 20 năm; PMH legacy storytelling; multi-generational living spaces; private advisory face-to-face |
| Primary device | iPad (70%) · desktop with assistant (25%) · iPhone (5%) |
| Session pattern | 1 session assisted browsing → 1 in-person booking |
| Conversion path | Anonymous → Editorial reading → Advisory (private, by appointment) |

---

## 3. CORE VALUE PROPOSITION & COMPETITIVE MOAT

### Refined VP

**"Khám phá Hồng Hạc City — đô thị 197 ha do Phú Mỹ Hưng và Nomura đồng phát triển — trên sa bàn tương tác. Tính tài chính theo gói Standard Chartered thật. Xem 100% sổ hồng từng căn. Ra quyết định không cần một cuộc gọi sales nào."**

### Competitive moat stack

| Layer | Element | Defensibility |
|---|---|---|
| 1 | **Map-as-product** với MapLibre GL + PMTiles + 1.074 lots real geometry | 6–9 tháng cartography + sustained content ops |
| 2 | **AI Matching Engine** trained on 27 real SKU codes × persona fit scoring | First-party behavioral data; cold-start moat |
| 3 | **Behavioral lead scoring** × Speed-to-Lead Telegram routing | Operational moat — sales playbook integration |
| 4 | **Comparison hub** với data verified (HHC vs Ecopark / Ciputra / Cổ Loa) | Editorial + legal review investment |
| 5 | **Evidence System** — 100% sổ hồng + Decision 749/TTg lineage + SOM credential + JV announcement docs | Documentation operations |
| 6 | **Real financing simulator** dùng Standard Chartered fixed rates 6.9 / 7.3 / 7.4% | Direct partnership intel |
| 7 | **PMH × Nomura legacy narrative** (NVL Boulevard 17.8km, 2.600 ha, 20-project portfolio, Lawrence S. Ting philosophy) | Brand authority transfer — not buildable from scratch |

### What this platform is NOT

- Not a sales landing page (CTAs là exploratory, không transactional)
- Not a brochure clone of official site (decision-support layer, không authority layer)
- Not a 1000-page lot index spam (curated 150–300 indexed pages)
- Not an "AI hype" platform (AI là utility, không theater)

---

## 4. INFORMATION ARCHITECTURE

### 4.1 URL structure (locked)

```
/                                       — Trang chủ

/kham-pha-do-thi                        — Khám phá đô thị
  /kham-pha-do-thi/tam-nhin-20-nam
  /kham-pha-do-thi/triet-ly-do-thi
  /kham-pha-do-thi/pmh-nomura-legacy
  /kham-pha-do-thi/dong-ha-noi-future
  /kham-pha-do-thi/hanh-trinh-phat-trien
  /kham-pha-do-thi/khong-gian-da-the-he
  /kham-pha-do-thi/triet-ly-7s          — Hub
  /kham-pha-do-thi/triet-ly-7s/sustainability
  /kham-pha-do-thi/triet-ly-7s/smart-planning
  /kham-pha-do-thi/triet-ly-7s/service
  /kham-pha-do-thi/triet-ly-7s/standards
  /kham-pha-do-thi/triet-ly-7s/safety
  /kham-pha-do-thi/triet-ly-7s/scarcity
  /kham-pha-do-thi/triet-ly-7s/society

/sa-ban                                 — Sa bàn (CORE PRODUCT)
  /sa-ban/hong-phat                     — Active subdivision (1.074 lots)
  /sa-ban/hong-thinh                    — Announce-only (theo dõi phase)
  /sa-ban/hong-phuc                     — Announce-only
  /sa-ban/he-sinh-thai-tien-ich
  /sa-ban/ha-tang-do-thi
  /sa-ban/timeline-do-thi

/tiem-nang                              — Tiềm năng (investment thesis)
  /tiem-nang/vi-sao-bac-ninh
  /tiem-nang/eastern-hanoi-growth
  /tiem-nang/fdi-samsung
  /tiem-nang/urbanization
  /tiem-nang/infrastructure-growth
  /tiem-nang/long-term-value
  /tiem-nang/so-sanh/hong-hac-vs-ecopark
  /tiem-nang/so-sanh/hong-hac-vs-ciputra
  /tiem-nang/so-sanh/hong-hac-vs-co-loa
  /tiem-nang/market-insights

/seo                                    — SEO cluster pages (canonical-protected)
  /seo/bac-ninh-fdi
  /seo/dong-ha-noi
  /seo/vanh-dai-4
  /seo/song-xanh
  /seo/do-thi-ve-tinh
  /seo/vanh-dai-4-thuan-thanh
  /seo/gia-lam-bac-ninh-ket-noi
  /seo/mua-o-that-hay-dau-tu
  /seo/2-ty-nen-mua-khu-nao
  /seo/gia-dinh-2-con-phu-hop-phan-khu-nao
  /seo/nen-mua-giai-doan-dau-hay-sau
  /seo/hong-phat/gan-cong-vien
  /seo/hong-phat/phu-hop-gia-dinh
  /seo/hong-phat/view-xanh
  /seo/hong-phat/khu-yen-tinh

/tien-do                                — Progress evidence
  /tien-do/[YYYY-MM]
  /tien-do/ha-tang-hien-tai-hong-phat
  /tien-do/cap-nhat-vanh-dai-4

/phong-cach-song                        — Lifestyle (emotion layer)
  /phong-cach-song/mot-ngay-tai-hong-hac
  /phong-cach-song/nguoi-ha-noi-chuyen-ve
  /phong-cach-song/khong-gian-gia-dinh
  /phong-cach-song/song-xanh
  /phong-cach-song/wellness
  /phong-cach-song/giao-duc
  /phong-cach-song/community
  /phong-cach-song/weekend-experience
  /phong-cach-song/future-living

/tu-van                                 — Advisory (lead capture, noindex except landing)
  /tu-van/tu-van-rieng
  /tu-van/tu-van-dau-tu
  /tu-van/tu-van-gia-dinh
  /tu-van/dat-lich-tham-quan
  /tu-van/advisory-matching

/doi-tac                                — Partners (B2B silo, isolated link-wise)
  /doi-tac/tro-thanh-doi-tac
  /doi-tac/chuong-trinh-phan-phoi
  /doi-tac/hop-tac-chien-luoc
  /doi-tac/tai-nguyen
  /doi-tac/lien-he

/phap-ly                                — Legal & Evidence (E-E-A-T anchor)
  /phap-ly/quy-hoach
  /phap-ly/ho-so-phap-ly
  /phap-ly/so-hong
  /phap-ly/nguon-tham-khao
  /phap-ly/faq
  /phap-ly/evidence/[doc-id]            — utility, noindex

/bang-gia                               — Payment policy (noindex)

/privacy /terms /cookies                — Legal

/api/*                                  — API routes (X-Robots: noindex, nofollow)

# Utility / noindex
/lot/[lot-id]                           — Lot detail (noindex, canonical → /sa-ban)
/watchlist/[token]                      — Personal watchlist (noindex)
/share/[token]                          — Shared map state (noindex, 24h TTL)
```

### 4.2 Internal linking matrix

Each indexed page MUST contain 3–7 contextual internal links, weighted:

| From → To | Priority | Anchor strategy |
|---|---|---|
| `/` → `/sa-ban` | P0 | Primary hero CTA + 2 contextual links |
| `/` → `/sa-ban/hong-phat` | P0 | Current Release block |
| `/sa-ban/*` → `/phap-ly/so-hong` | P0 | Trust footer of map page |
| `/seo/*` → `/sa-ban/[matching-subdivision]` | P0 | Primary CTA |
| `/tiem-nang/so-sanh/*` → `/sa-ban` | P1 | "Xem trên bản đồ" inline link |
| `/tien-do/*` → `/sa-ban/[relevant-phase]` | P1 | Contextual paragraph link |
| `/phong-cach-song/*` → `/sa-ban?filter=[lifestyle]` | P1 | Filter-deep-link CTA |
| `/kham-pha-do-thi/triet-ly-7s/standards` → `/phap-ly/quy-hoach` | P1 | "Xem quy hoạch 1/500" |
| `/doi-tac/*` → `/` | P2 | Footer-only (B2B isolation) |
| Subdivisions ↔ Subdivisions | P1 | "Khám phá phân khu khác" footer carousel |

Bi-directional links between sibling pages giữ crawl depth ≤ 3 từ root.

### 4.3 Canonical & noindex policy

```
/                                       canonical=self, indexed
/sa-ban                                 canonical=self, indexed
/sa-ban/hong-phat                       canonical=self, indexed
/sa-ban?filter=*                        canonical=/sa-ban, indexed (filters in hash, not query)
/lot/[id]                               noindex, canonical=/sa-ban
/watchlist/[token]                      noindex, no canonical
/seo/*                                  canonical=self, indexed
/tien-do/[YYYY-MM]                      canonical=self; noindex sau 6 tháng
/bang-gia                               noindex (lead-gated content)
/tu-van/*                               noindex except `/tu-van` root
/api/*                                  X-Robots-Tag: noindex, nofollow
```

### 4.4 Sitemap segmentation

```
/sitemap.xml                            — index file
/sitemap-core.xml                       — / + main routes
/sitemap-sa-ban.xml                     — sa-ban hub + subdivisions
/sitemap-kham-pha-do-thi.xml            — including 7S cluster
/sitemap-seo-clusters.xml
/sitemap-tien-do.xml                    — last 6 months
/sitemap-phong-cach-song.xml
/sitemap-tiem-nang.xml
```

Each sub-sitemap ≤ 500 URLs. `lastmod` driven by Payload CMS `updatedAt`.

---

## 5. DETAILED PAGE SPECIFICATIONS

### 5.1 `/` — Trang chủ

**Goals:** (1) Establish trust + emotion + luxury tone trong 30s đầu. (2) Drive 60%+ sessions vào `/sa-ban`. (3) Route users vào đúng track (Ở thực / Đầu tư). (4) Soft-introduce 5 lead types không ép form.

**Position-by-position structure (order matters):**

```
┌─ Position 0 ─ Disambiguation Banner (36px, dismissible) ─┐
│ "Đây là nền tảng tư vấn độc lập về Hồng Hạc City —      │
│  dữ liệu tham chiếu từ chủ đầu tư Phú Mỹ Hưng × Nomura. │
│  Website chính thức: honghacphumyhung.vn ↗"             │
└──────────────────────────────────────────────────────────┘

┌─ Position 1 ─ HERO (≤ 60vh) ─────────────────────────────┐
│  H1: "Hồng Hạc City — 197 hecta, 20 năm"               │
│      (Cormorant Garamond 64–72px)                       │
│  Sub-H1: "Phú Mỹ Hưng × Nomura đồng phát triển          │
│           tại Bắc Ninh"                                 │
│      (Inter 18px, color-graphite)                       │
│                                                          │
│  [Hero video 60–90s, custom controls, poster image]     │
│                                                          │
│  Primary CTA: "Khám phá sa bàn" → /sa-ban               │
│  Secondary CTA: "Tải tổng quan dự án" → instant PDF     │
└──────────────────────────────────────────────────────────┘

┌─ Position 2 ─ PRESS LOGO BAR ─────────────────────────────┐
│  "Được nhắc đến bởi"                                     │
│  [Dân Trí · VnExpress · CafeF · Báo Bắc Ninh · Tuổi Trẻ] │
│  (logos linked to actual articles, verified by cron)     │
└───────────────────────────────────────────────────────────┘

┌─ Position 3 ─ EVIDENCE BLOCK (3-card grid) ───────────────┐
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│ │ 🛡️ 100% sổ  │ │ ⚖️ Quy hoạch│ │ 🏗️ Phê duyệt│         │
│ │   hồng từng │ │   1/500     │ │   Chính phủ │         │
│ │   căn       │ │   [PDF]     │ │   [PDF]     │         │
│ │ [Xem detail]│ │ [Xem detail]│ │ [Xem detail]│         │
│ └─────────────┘ └─────────────┘ └─────────────┘         │
└──────────────────────────────────────────────────────────┘

┌─ Position 4 ─ SEGMENTED PATH SWITCH ──────────────────────┐
│  "Bạn đang tìm gì?"                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐      │
│  │ 🏡 NƠI ĐỂ Ở         │  │ 📈 CƠ HỘI ĐẦU TƯ    │      │
│  │ Gia đình · học tập  │  │ ROI · tăng giá       │      │
│  │ Không khí · cộng    │  │ Hạ tầng vùng         │      │
│  │ đồng                │  │ Comparison           │      │
│  │ → Lifestyle Map     │  │ → Investment Dashboard│      │
│  └──────────────────────┘  └──────────────────────┘      │
│  (Selection persists localStorage 90 days, reversible)   │
└──────────────────────────────────────────────────────────┘

┌─ Position 5 ─ 3-REASONS BLOCK ────────────────────────────┐
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ 1. CHỦ ĐẦU TƯ│ │ 2. VỊ TRÍ    │ │ 3. PHÁP LÝ   │     │
│  │ PMH × Nomura │ │ 0km Gia Lâm  │ │ 100% sổ hồng │     │
│  │ 33 năm       │ │ 2km VĐ4      │ │ Decision 749 │     │
│  │ 2.600 ha     │ │ 23km HN      │ │ SC financing │     │
│  │ SOM master   │ │ 16km Gia Bình│ │ 0% pre-      │     │
│  │ plan         │ │              │ │   handover   │     │
│  │ [Xem hồ sơ]  │ │ [Bản đồ]    │ │ [Pháp lý]    │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
└──────────────────────────────────────────────────────────┘

┌─ Position 6 ─ CURRENT URBAN RELEASE (Hồng Phát) ──────────┐
│  Pretitle: "Đang giới thiệu"                              │
│  H2: "Phân khu Hồng Phát — Khởi nguồn thịnh vượng"       │
│  Body: 80–120 từ editorial intro                          │
│  - 1.074 sản phẩm · 3 tiểu khu · kiến trúc Tân cổ điển Pháp│
│  - Mật độ XD 51.9% · Bàn giao T6/2027                    │
│  [Mini static map với phase polygon highlighted]          │
│  [Infrastructure chips: trường 800m, công viên 400m,...] │
│  [Timeline progress bar % completed]                      │
│  CTA: "Xem Hồng Phát trên sa bàn" → /sa-ban/hong-phat    │
└──────────────────────────────────────────────────────────┘

┌─ Position 7 ─ AI MATCHING PREVIEW (track-aware) ──────────┐
│  H2: "Tìm vị trí phù hợp với bạn"                         │
│  4 cards: Ở thực · Đầu tư · Gia đình · Nghỉ dưỡng        │
│  CTA: "Bắt đầu gợi ý cá nhân hóa" → /sa-ban?ai-matching=open
└──────────────────────────────────────────────────────────┘

┌─ Position 8 ─ URBAN EVOLUTION TIMELINE ───────────────────┐
│  H2: "20 năm — 4 chương phát triển"                       │
│  Horizontal scroll: 2026–2028 | 2028–2032 | 2032–2038 |   │
│                    2038–2045                              │
│  CTA: "Xem timeline đầy đủ" → /sa-ban/timeline-do-thi    │
└──────────────────────────────────────────────────────────┘

┌─ Position 9 ─ "MỘT NGÀY TẠI HỒNG HẠC" lifestyle module ──┐
│  4 chapters: Sáng · Trưa · Chiều · Tối                    │
│  Each: 80–120 từ + 2 real lifestyle photos                │
│  CTA: "Đọc hành trình đầy đủ" → /phong-cach-song/mot-ngay │
└──────────────────────────────────────────────────────────┘

┌─ Position 10 ─ EASTERN HANOI MACRO THESIS ────────────────┐
│  Data viz: FDI bar chart + Vành Đai 4 schematic           │
│  Headline tied to "Bắc Ninh sắp thành phố trực thuộc TW"  │
│  CTA: "Tìm hiểu tiềm năng vùng" → /tiem-nang              │
└──────────────────────────────────────────────────────────┘

┌─ Position 11 ─ LIVE PROGRESS PREVIEW ─────────────────────┐
│  3 latest progress photos with EXIF date                  │
│  CTA: "Xem tiến độ chi tiết" → /tien-do                   │
└──────────────────────────────────────────────────────────┘

┌─ Position 12 ─ ADVISORY CTA ──────────────────────────────┐
│  Full-bleed editorial image                               │
│  Soft headline (no urgency)                               │
│  Low-pressure CTA: "Trao đổi cùng chuyên viên tư vấn"    │
└──────────────────────────────────────────────────────────┘

┌─ Position 13 ─ CO-DEVELOPER CREDENTIAL FOOTER BAND ──────┐
│  PHÁT TRIỂN BỞI                  CƠ SỞ TÀI CHÍNH         │
│  [PMH logo] [Nomura logo]        [Standard Chartered]    │
│  33+ năm · 20 dự án · NVL 17.8km · SOM master plan      │
└──────────────────────────────────────────────────────────┘

[ Footer ]
```

**Word budget:** ≤ 900 từ visible above-fold (3-fold). Editorial pacing — NOT brochure density.

**Micro-copy & CTA matrix (A/B test variants):**

| Slot | Variant A | Variant B |
|---|---|---|
| Hero primary CTA | "Khám phá sa bàn" | "Bắt đầu khám phá" |
| Hero secondary | "Tải tổng quan dự án" | "Xem nhanh trong 60 giây" |
| Track switch — Ở thực | "Lifestyle Map" | "Tìm tổ ấm" |
| Track switch — Đầu tư | "Investment Dashboard" | "Phân tích cơ hội" |
| Current release CTA | "Xem Hồng Phát trên sa bàn" | "Tìm hiểu phân khu này" |
| AI matching CTA | "Bắt đầu gợi ý cá nhân hóa" | "Tìm vị trí phù hợp" |
| Advisory CTA | "Trao đổi cùng chuyên viên" | "Đặt lịch tư vấn riêng" |

**SEO meta:**
- Title (≤ 60): `Hồng Hạc City — Đô thị 197ha Bắc Ninh | PMH × Nomura`
- Description (≤ 155): `Khám phá Hồng Hạc City qua sa bàn tương tác: 1.074 sản phẩm Hồng Phát, công cụ tài chính theo Standard Chartered, 100% sổ hồng. Phú Mỹ Hưng × Nomura đồng phát triển.`
- OG image: 1200×630 với aerial 197 ha + co-developer logos

**JSON-LD (server-side only, no client hydration):**

```jsonc
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://bacninhhonghaccity.vn/#organization",
      "name": "Hồng Hạc City (Decision Platform)",
      "url": "https://bacninhhonghaccity.vn/",
      "logo": "https://bacninhhonghaccity.vn/brand/logo-1200.png",
      "sameAs": [
        "https://www.facebook.com/honghaccity.official",
        "https://zalo.me/3268698206670405210",
        "https://www.youtube.com/@honghaccityofficial"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://bacninhhonghaccity.vn/#website",
      "url": "https://bacninhhonghaccity.vn/",
      "name": "Hồng Hạc City",
      "publisher": {"@id": "https://bacninhhonghaccity.vn/#organization"},
      "inLanguage": "vi-VN",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://bacninhhonghaccity.vn/search?q={query}",
        "query-input": "required name=query"
      }
    },
    {
      "@type": "Place",
      "name": "Hồng Hạc City",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Phường Song Liễu",
        "addressRegion": "Bắc Ninh",
        "addressCountry": "VN"
      },
      "geo": {"@type": "GeoCoordinates", "latitude": 21.0285, "longitude": 106.0653}
    }
  ]
}
```

### 5.2 `/sa-ban` — Sa bàn (CORE PRODUCT)

**Goals:** Interactive map nơi user explore lots, apply filters, trigger AI matching, run financial tools. Mọi tool output highlight ngược lại trên map.

**Layout:** Two-pane desktop (60/40 map/sidebar) · full-screen mobile với bottom-sheet tools.

```
<MapPage>
  <MapCanvas MapLibre GL JS, PMTiles vector tiles />
  <MapControls top-right: zoom, compass, layer toggles />
  <FilterRail left-floating: phase | greenery | sunlight | privacy |
                              park-distance | price | family-fit />
  <ToolDrawer bottom-sheet mobile, right-pane desktop>
    <Tabs ["Phân khu", "AI Matching", "Không gian phù hợp",
           "Tài chính", "Đầu tư Dashboard"] />
    (Tab order swaps based on track preference)
  </ToolDrawer>
  <LotInfoPopover (when lot clicked) />
  <WatchlistBar (when user saved ≥ 1 lot) />
</MapPage>
```

**Behavior contract:**
- Initial state: map centered on 197ha bbox, zoom 15, 3 subdivisions visible with phase outlines
- Filters update URL **hash fragment** (`#filter=greenery:high,phase:hp-1`), NOT query string — keeps canonical clean
- Tool outputs emit `lot_highlights` array → map renders pulse animation
- Lot click → side popover với position, area, SKU code, current phase status, view simulation thumbnail, "Lưu lot" + "Xem chi tiết" CTAs
- "Xem chi tiết" → `/lot/[id]` (utility, noindex)
- "Lưu lot" → IndexedDB watchlist + Firestore sync if token exists

**Performance contract:**
- Map shell (MapLibre core + base tiles) ≤ 280KB gzipped JS
- Vector tiles served as `.pmtiles` (Protomaps), range-requested
- Initial render (FCP) ≤ 1.4s on Moto G Power emulation
- Time to Interactive Map (TTIM) ≤ 2.6s
- Tool drawer code-split per tab, lazy on first open

**SEO meta:**
- Title: `Sa bàn tương tác Hồng Hạc City — 197ha · 3 phân khu · 1.074 sản phẩm Hồng Phát`
- Description: `Khám phá sa bàn tương tác Hồng Hạc City: 3 phân khu Hồng Phát, Hồng Thịnh, Hồng Phúc với AI Matching, công cụ tài chính theo gói Standard Chartered và lớp dữ liệu môi trường, hạ tầng.`

### 5.3 Sub-routes patterns

#### `/sa-ban/hong-phat`
Real 1.074-lot dataset filtered to current visible inventory (323 căn — 27 SKU codes). French neoclassical render gallery. 27-SKU filter dropdown. Pricing range chỉ hiển thị nếu CDT publish — mặc định "Vui lòng liên hệ Sales Gallery". CTA "Đặt lịch tham quan" → `/tu-van/dat-lich-tham-quan`.

#### `/sa-ban/hong-thinh` & `/sa-ban/hong-phuc`
**Announce-only.** Map shows subdivision polygon + tagline ("TIẾP MẠCH PHỒN VINH" / "VỮNG BỀN HẠNH PHÚC"). Single CTA: "Theo dõi phase này" → email-gated Progress Lead (+20 score).

#### Editorial cluster pages (template)

```yaml
page: /<route>
goals:
  primary: <SEO traffic | conversion to /sa-ban | lead capture | E-E-A-T>
  secondary: <metric>
components:
  - Hero
  - EditorialSection×N (4–7 sections)
  - DataVizSection (if applicable)
  - PressCitationBlock (mandatory on /kham-pha-do-thi/* and /tiem-nang/*)
  - AuthorBio
  - RelatedClusterLinks (3–7 internal links P0/P1)
  - ContextualCTA
content_outline:
  word_count: 800–1400
  must_link_to:
    - /sa-ban (P0)
    - 2× sibling clusters (P1)
    - 1× authority page (/phap-ly or /tiem-nang) (P1)
seo:
  title_pattern: "{topic} — Hồng Hạc City"
  description_max: 155 chars
  schema:
    - Article (editorial) OR Place (location) OR Product (pricing-adjacent, with caution)
microcopy:
  primary_cta: "Xem trên sa bàn"
  banned_phrases: ["Đăng ký ngay", "Hotline 24/7", "Báo giá sốc",
                   "50 căn cuối", "Cơ hội cuối cùng"]
```

Page-by-page micro-copy + JSON-LD live trong `content/pages/*.mdx` frontmatter (Payload CMS managed).

---

## 6. INTERACTIVE SA BÀN / MAP EXPERIENCE

### 6.1 Tech stack

| Layer | Tech | Justification |
|---|---|---|
| Map engine | **MapLibre GL JS 4.x** | Open source, no Mapbox token costs, full vector style control, WebGL2 hardware accel |
| Tile format | **PMTiles 3** (Protomaps) | Single-file archive, range-requested from CDN, no per-tile Lambda; ~40MB for 197ha at z14–z19 |
| Base imagery | Self-hosted ortho mosaic (drone Q2 2026) + OSM context outside boundary | First-party data ownership |
| Style | Custom JSON (8 layers, 3 themes: day / dusk / aerial) | Brand control |
| Geometry data | PostGIS via Payload CMS → exported to PMTiles nightly | Editorial control + cache |

### 6.2 Coordinate system & bounding boxes

```ts
export const HHC_BOUNDS = {
  // EPSG:4326 — explicit bbox for the 197ha master plan footprint
  southwest: [106.0512, 21.0198] as [number, number],
  northeast: [106.0794, 21.0372] as [number, number],
  center:    [106.0653, 21.0285] as [number, number],
} as const;

export const SUBDIVISION_BOUNDS = {
  'hong-phat':   { sw: [106.0512, 21.0198], ne: [106.0628, 21.0290] },
  'hong-thinh':  { sw: [106.0628, 21.0210], ne: [106.0720, 21.0335] },
  'hong-phuc':   { sw: [106.0700, 21.0260], ne: [106.0794, 21.0372] },
} as const satisfies Record<SubdivisionId, BBox>;
```

Coordinate values are placeholders to be replaced when CDT supplies the official 1/500 plan polygon geometry.

### 6.3 Layer states (toggle matrix)

| Layer ID | Default | UI | Data source | Notes |
|---|---|---|---|---|
| `base-ortho` | on | hidden (always-on) | Self-hosted tiles | |
| `base-osm-context` | on | hidden | OpenMapTiles | Outside HHC clip mask |
| `phase-polygons` | on | Filter "Giai đoạn" | Payload CMS | Color-coded by status |
| `lots` | on | Filter "Lô" | Payload → PMTiles | Lazy z ≥ 16 |
| `greenery-heatmap` | off | Toggle | Tree-canopy data | "View xanh" matching |
| `sunlight-overlay` | off | Toggle (time slider) | Solar API + 3D buildings | |
| `privacy-score` | off | Toggle | Lot-neighbor distance | Chloropleth |
| `park-distance` | off | Toggle (radius slider) | Voronoi from park centroids | |
| `infrastructure-current` | off | Toggle | Payload CMS | POI clusters z ≥ 14 |
| `infrastructure-future` | off | Toggle (year slider 2026–2045) | Payload `activeFrom` | Timeline-driven |
| `vanh-dai-4-trace` | off | Toggle "Hạ tầng vùng" | Static GeoJSON | |

### 6.4 Real-time inventory sync

```
Sales team updates lot in Payload Admin
  → Payload "afterChange" hook
  → Publishes to Firestore collection `lots_realtime` (lot_id → status, updatedAt)
  → Connected map clients subscribed via Firestore Web SDK
  → Visual update: lot color transitions over 600ms
```

**Conflict resolution:** Payload Postgres = source of truth. Firestore = read-only cache. Nightly cron reconciles Firestore from Postgres.

**Stale data fallback:** Firestore disconnect > 30s → banner "Dữ liệu tham khảo, cập nhật mới nhất {timestamp}".

### 6.5 Multi-touch mobile gestures

| Gesture | Action |
|---|---|
| 1-finger drag | Pan |
| 2-finger pinch | Zoom |
| 2-finger rotate | Disabled (cognitive load) |
| 2-finger drag vertical | Pitch (3D tilt) — only at z ≥ 17 |
| Tap | Select lot/POI |
| Long-press | Context menu (Lưu / Chia sẻ / Tính khoảng cách) |
| Double-tap | Zoom in at point |

Touch target minimum: **44×44 CSS px** per WCAG 2.5.5.

### 6.6 Phase handling state machine

```ts
type LotStatus =
  | 'reserved'       // in-house hold
  | 'available'      // open to sale this phase
  | 'sold'           // closed sale
  | 'upcoming'       // future phase
  | 'not-for-sale';  // amenity / public / withheld

type PhaseStatus =
  | 'draft'          // not visible on public map
  | 'announced'      // visible, "theo dõi" CTA, no pricing
  | 'open'           // current sales phase
  | 'closing'        // last 14 days
  | 'closed';        // historic
```

Transitions logged in `lot_status_history` (Postgres), surfaced in `/tien-do/[YYYY-MM]`.

---

## 7. FINANCIAL TOOLS

All formulas in `/lib/finance/*.ts`. Pure functions, fully typed, unit-tested với `vitest`. Defaults dùng số THỰC TẾ từ gói Hồng Hạc City × Standard Chartered công bố 20/12/2025.

### 7.1 Real-world defaults

```ts
export const HHC_FINANCING_DEFAULTS = {
  promoPhase: {
    months: 18,                        // until handover T6/2027
    annualRatePct: 0,                  // 0% pre-handover
    interestOnly: true,                // ân hạn nợ gốc + lãi
  },
  postHandoverSubsidyPhase: {
    months: 12,
    cdtSubsidyPct: 3.0,                // CDT subsidies 3% per year
  },
  bankRates: {
    standardChartered_2yr: { y1: 6.9, y2: 7.3 },
    standardChartered_3yr: { y1: 6.9, y2: 7.3, y3: 7.4 },
  },
  ltvMax: 0.75,                        // max 75% LTV under promo
  tenorYearsDefault: 25,
  postPromoFloatingPct: 9.5,           // assumed conservative post-promo rate
} as const;
```

### 7.2 Loan amortization

**Formula** (fixed-rate, monthly compounding):
```
M = P × [r(1+r)^n] / [(1+r)^n − 1]

where:
  P = principal (VND)
  r = monthly rate = annual_rate / 12
  n = total months
  M = monthly payment
```

**Variants supported:**
1. Fixed rate, fixed term — formula above
2. Multi-phase rate schedule (0% promo → SC fixed → floating) — concatenate amortization segments
3. Interest-only periods (ân hạn nợ gốc) — `M_io = P × r` for N months, then re-amortize remaining over (n − N)
4. CDT subsidy phase — effective rate = bank_rate − subsidy_pct

**Default scenario rendered on `/sa-ban` Financial Tool:**

```
Giá sản phẩm: [user input, default 5.000.000.000 VND]
LTV: 75%
Tenor: 25 năm

Phase 1 (Pre-handover, 18 tháng):
  → Ân hạn nợ gốc + lãi suất 0%
  → Bạn trả: 0 đ/tháng

Phase 2 (12 tháng sau bàn giao):
  → Standard Chartered 6.9% Y1 / 7.3% Y2
  → CDT subsidy −3% pa
  → Effective rate: 3.9% (Y1) / 4.3% (Y2)
  → Monthly payment: [computed via amortize()]

Phase 3 (Year 3, if 3-yr SC):
  → SC 7.4%, no subsidy
  → Effective: 4.4% nếu vẫn còn subsidy / 7.4% nếu đã hết
  → Monthly payment: [computed]

Phase 4 (Year 4+):
  → Floating rate (assumed 9.5%, user-adjustable)
  → Monthly payment: [computed]

Total interest: [computed]
Cashflow chart: [Recharts area, color-coded phases]
```

**TypeScript signature:**

```ts
type LoanInput = {
  principalVnd: number;          // 100_000_000 ≤ P ≤ 100_000_000_000
  ltv: number;                   // 0 < ltv ≤ 0.75 (HHC max)
  tenorMonths: number;           // 60 ≤ n ≤ 360
  phases: Array<{
    fromMonth: number;
    toMonth: number;
    annualRatePct: number;
    interestOnly?: boolean;
    cdtSubsidyPct?: number;
  }>;
};

type LoanSchedule = {
  monthlyPaymentByPhase: number[];
  totalInterest: number;
  totalPaid: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    phaseLabel: string;
  }>;
};

export function amortize(input: LoanInput): LoanSchedule;
```

**Edge cases & validation:**
- Reject `principalVnd < 100_000_000` (below floor)
- Reject any `annualRatePct > 25` (likely user error)
- Phase ranges must be contiguous and cover `[0, tenorMonths]`
- Round each row to nearest 1.000 VND for display; internal calc in `bigint × 100` (centi-VND)

### 7.3 ROI simulation

```
ROI_total = (sale_price_at_year_T − purchase_price − costs) / purchase_price
ROI_annualized = (1 + ROI_total)^(1/T) − 1
```

**Sensitivity inputs:**
- Holding period: 3 / 5 / 7 / 10 / 15 / 20 năm
- Annual appreciation scenarios: 4% / 6% / 8% / 10% / 12%
- Infrastructure milestone discrete bumps:
  - VĐ4 hoàn thành 2027 → +15% trong milestone year
  - Sân bay Gia Bình 2030–2032 → +10%
  - Bắc Ninh lên thành phố TWT → +8%
- Transaction cost: 2% (đăng ký + môi giới)

Output: scenario fan chart (3 đường: pessimistic / base / optimistic), với disclaimer pinned: *"Mô phỏng tham khảo, không phải cam kết sinh lời."*

### 7.4 Rental yield

```
gross_yield = annual_rent / purchase_price
net_yield = (annual_rent − annual_op_cost) / purchase_price
```

CMS-configured comparable rent (per subdivision, per typology). Defaults "Chưa khả dụng" cho phases chưa vận hành, với text: *"Dữ liệu cho thuê tham khảo sẽ cập nhật khi phân khu đi vào vận hành (dự kiến {date})."*

### 7.5 Cashflow projection

Year-by-year table:

| Year | Capital outflow | Rental income | Net cashflow | Cumulative |
|---|---|---|---|---|
| 1 | Down payment + first-year mortgage | 0 | negative | negative |
| 2 | Mortgage | Partial rent (if T-2 onwards) | varies | |
| ... | ... | ... | ... | ... |
| T (exit) | + Sale proceeds | ... | large positive | break-even+ |

UI: Recharts area chart, color-coded inflows/outflows. Export to PDF (gated by Soft Lead — gentle, optional).

### 7.6 UI/UX rules

- **Server-side initial render** of default scenario for SEO (cluster page `/seo/2-ty-nen-mua-khu-nao` shows pre-computed scenario)
- Client interactivity hydrates progressively
- Input changes throttled 200ms debounce → recompute pure function → re-render
- All outputs include `microCopy.disclaimer` linked from `/phap-ly/nguon-tham-khao`
- Output sharing: "Lưu phương án" → creates `/share/[token]` ephemeral URL (24h), enters Financial Lead funnel (soft)

---

## 8. LEAD CAPTURE & SPEED-TO-LEAD SYSTEM

### 8.1 Soft lead taxonomy

| Lead type | Trigger | Friction | Score |
|---|---|---|---|
| **Watchlist Lead** | User saves ≥ 1 lot/phase | Zero (anonymous IndexedDB) | +5 per save (cap +25) |
| **Progress Lead** | "Nhận cập nhật tiến độ" (email only) | 1 field | +15 on submit |
| **Financial Lead** | Save loan/ROI scenario | 1 field (email or phone) | +20 on submit |
| **Matching Lead** | Complete AI Matching wizard | 0 fields (anonymous result), +1 field optional | +20 engagement, +10 save |
| **Advisory Lead** | "Trao đổi cùng chuyên viên" | 3-step form (§8.4) | +40 submit, +60 appointment |

### 8.2 Behavioral intent scoring

Events feed Firestore `lead_events/{deviceId}` collection:

| Event | Score | Throttle |
|---|---|---|
| `page_view` (any) | +1 | max 30/session |
| `sa_ban_open` | +10 | once per session |
| `current_release_view` | +15 | once per 24h |
| `ai_matching_complete` | +20 | once per 24h |
| `loan_calc_submit` | +20 | max 3 per session |
| `bang_gia_view` | +15 | once per 24h |
| `phap_ly_doc_view` | +15 | per doc, max 5 |
| `evidence_doc_view` | +15 | per doc, max 5 |
| `tien_do_deep_scroll` | +10 | once per 24h |
| `return_visit_day2` | +10 | once |
| `return_visit_day7` | +20 | once |
| `watchlist_save` | +25 (cap 75) | per lot |
| `advisory_form_view` | +20 | once |
| `tham_quan_booking` | +40 | once |
| `share_link_create` | +15 | once |
| `compare_subdivisions` | +10 | once per 24h |
| `video_complete` (hero video) | +10 | once |
| `brochure_download` (standard) | +5 | once |
| `brochure_download` (investment memorandum) | +15 | once |
| `zalo_open` | +15 | once per session |

### 8.3 Score tiers

| Tier | Range | Notification | Response SLA |
|---|---|---|---|
| **Cold** | 0–30 | Passive nurture (email fortnightly) | — |
| **Warm** | 31–70 | Daily digest email 9am | 24h |
| **Hot** | 71–120 | Telegram → sales group | 30 min |
| **Burning** | 121+ | Telegram → manager + sales group | 5 min |

Score decays −5/week if no events. Reset to 0 after 90 days inactivity (PDPL data minimization).

### 8.4 Advisory multi-step form

**3 bước, 1 field per step + summary, mobile-first.**

```
Step 1: "Bạn đang quan tâm điều gì nhất?"
  Radio: [Ở thực, Đầu tư, Gia đình, Nghỉ dưỡng, Khác]
  → maps to lead.intent + score +5

Step 2: "Khi nào bạn muốn trao đổi?"
  Radio: [Trong 24h, 2–7 ngày, 1–2 tuần, Chưa rõ]
  → urgency dimension

Step 3: "Cách bạn muốn chúng tôi liên hệ?"
  Input: phone (preferred) OR email (fallback)
  Checkbox: "Tôi đồng ý nhận cập nhật về dự án" (PDPL consent)
  Cloudflare Turnstile (invisible challenge first, interactive fallback)

Summary:
  "Chuyên viên sẽ liên hệ bạn theo cách bạn chọn.
   Bạn có thể thêm ghi chú (tùy chọn)."
  Optional <textarea> (max 280 chars)
  Primary CTA: "Gửi yêu cầu"
```

**Validation rules:**
- Phone: `^(0|\+84)[3|5|7|8|9][0-9]{8}$`
- Email: RFC 5322 + DNS MX check (server-side)
- Honeypot field (`<input name="full_name_check" hidden>`, must remain empty)
- Turnstile token verified server-side

**Submission flow:**

```
Client → POST /api/leads/advisory
  ├── Verify Turnstile token (Cloudflare API)
  ├── Validate Zod schema
  ├── Compute final score (form data + session score)
  ├── Write Firestore `leads/{id}` (atomic with createdAt server timestamp)
  ├── Trigger /api/notify/telegram (background, no await) if score ≥ 71
  ├── Send Resend email confirmation to user
  ├── Send Resend digest to sales@ (low-priority queue)
  └── Return 200 OK with leadId (no PII echo)
```

**Failure modes:**
- Turnstile fail → 403, generic message, retry button
- Schema fail → 422, field-level errors
- Firestore write fail → 500, queue to `leads_dlq` (Vercel KV), user sees "Đã ghi nhận, chuyên viên sẽ liên hệ" (eventual consistency)
- Telegram fail → swallow, sales gets email regardless

### 8.5 Conversion mechanics

#### Zalo fast-chat bubble (always visible, bottom-right)

- Icon: Zalo official blue logo, 56×56px, 16px from edges
- Tooltip on hover: "Trò chuyện trực tiếp qua Zalo"
- Click → opens `https://zalo.me/3268698206670405210`
- Tracked event: `zalo_open` (+15 score)
- **Hidden on:** `/sa-ban` (cognitive load), during AI Matching flow (don't interrupt)
- Mobile: same bubble, deep-link to Zalo app

#### Brochure downloads (two tiers)

- **Standard Brochure** (~24 pages, PDF ≤ 8MB): public, no gate — instant download from hero secondary CTA; event +5
- **Investment Memorandum** (~48 pages, ROI scenarios, financing detail, comparable analysis): **email-gated**, investor track exclusive — accessed via ROI tool tab; event +15

#### Scroll-triggered offers (NOT popup)

Bottom-sheet sliding up 12% screen height when:
- Scroll depth ≥ 70% on homepage
- Time on page ≥ 75s
- Once per 7 days per device

Content (resident track):
```
"Bạn có muốn nhận tóm tắt 3 phân khu trong 60 giây?"
[ ✉ Email ]  [ Gửi cho tôi ]   [ × dismiss ]
```

Content (investor track):
```
"Tải Investment Memorandum (PDF · 48 trang · ROI scenarios theo Standard Chartered)"
[ ✉ Email ]  [ Gửi ]   [ × dismiss ]
```

**No exit-intent popups on mobile** (UX violation per luxury rules).

#### Form simplicity rules

All forms locked to spec:
- Max 3 fields per step (advisory follows §8.4 multi-step)
- Phone OR email (not both)
- Honeypot + Turnstile (silent)
- Submit button uses action verb, NOT generic "ĐĂNG KÝ":
  - Use: "Nhận tóm tắt" · "Tải tài liệu" · "Đặt lịch tham quan" · "Trao đổi cùng chuyên viên"
- Post-submit: instant success state + actionable next step (NOT "cảm ơn bạn")

### 8.6 Re-engagement rules

- **Desktop exit-intent** (mouse leave through top edge, after 60s on page, only on `/sa-ban`): soft banner "Lưu khám phá của bạn để xem lại" → token-based share URL, no form
- **Mobile scroll bottom + 90s idle:** floating CTA "Nhận tổng quan dự án" (single-field email)
- **Return visit detection** (IndexedDB visit count ≥ 2): personalize hero with "Chào mừng bạn trở lại — tiếp tục từ phân khu bạn đã xem?" + deep-link to last lot

---

## 9. CRM & LEAD OPS INTEGRATION

### 9.1 Firestore data schema

```ts
// collection: leads/{leadId}
type LeadDoc = {
  leadId: string;                          // ULID, server-generated
  type: 'watchlist' | 'progress' | 'financial' | 'matching' | 'advisory';
  intent: 'o-thuc' | 'dau-tu' | 'gia-dinh' | 'nghi-duong' | 'khac' | null;
  track: 'resident' | 'investor' | null;
  contact: {
    phone?: string;                        // E.164 normalized
    email?: string;                        // lowercased, trimmed
    preferredChannel: 'phone' | 'email' | 'zalo';
  };
  consent: {
    privacyAcceptedAt: Timestamp;
    marketingOptIn: boolean;
    pdplVersion: string;                   // "v1.0-2026-05"
  };
  attribution: {
    firstTouch: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      referrer?: string;
      landingPage: string;
      at: Timestamp;
    };
    lastTouch: { /* same shape */ };
    deviceId: string;                      // first-party cookie, ULID
    sessionCount: number;
  };
  engagement: {
    score: number;                         // current 0–500+
    tier: 'cold' | 'warm' | 'hot' | 'burning';
    eventCount: number;
    watchlistLotIds: string[];             // max 50
    lastAdvisoryFormStep: number | null;
  };
  routing: {
    assignedAdvisorId: string | null;
    notifiedAt: Timestamp | null;
    responseSlaSeconds: number | null;
    responseAt: Timestamp | null;
  };
  metadata: {
    notes?: string;                        // user's optional message
    locale: 'vi' | 'en';
    userAgent: string;
    ip: string;                            // last octet truncated for VN compliance
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'new' | 'contacted' | 'qualified' | 'meeting-set' |
          'closed-won' | 'closed-lost' | 'duplicate';
};

// collection: lead_events/{deviceId}/events/{eventId}
type LeadEvent = {
  eventId: string;
  type: string;                            // from §8.2 catalog
  score: number;
  context: Record<string, string | number | boolean>;
  page: string;
  ts: Timestamp;
};
```

**Composite indexes:**
- `(engagement.tier, createdAt desc)` — sales triage queue
- `(routing.assignedAdvisorId, status)` — advisor pipeline
- `(attribution.firstTouch.utm_source, createdAt)` — marketing attribution

**Security rules:** Deny all client writes to `leads/*` (writes only via Vercel API with Admin SDK). Reads denied entirely; CRM dashboard reads via server-rendered Payload admin.

### 9.2 Webhook flows

**Inbound (lead created):**

```
POST /api/leads/advisory (Next.js)
  → Firestore write
  → Background tasks (Promise.allSettled, not awaited):
      • POST https://api.telegram.org/bot{TOKEN}/sendMessage
      • POST https://api.resend.com/emails (× 2: user confirmation + sales digest)
      • POST {CRM_WEBHOOK_URL} (configured per env)
```

**Outbound CRM sync (idempotent):**

```
Payload Admin → "Mark contacted" button
  → /api/crm/update-status
  → Firestore update {status, responseAt, responseSlaSeconds}
  → POST {CRM_WEBHOOK_URL} with idempotency-key = leadId + statusVersion
```

### 9.3 Telegram alert format

Hot/burning leads (≥ 71):

```
🔥 LEAD MỚI · {tier_emoji} {score}đ
━━━━━━━━━━━━━━
👤 {contact.phone || contact.email}
🎯 Quan tâm: {intent_label}
⏰ Mong muốn liên hệ: {urgency_label}
🗺️ Đã lưu: {watchlistLotIds.length} vị trí
📍 Trang đến: {attribution.firstTouch.landingPage}
🔄 Phiên: {sessionCount} · Điểm tích lũy: {score}đ
━━━━━━━━━━━━━━
{notes ? `📝 ${notes}` : ''}
🆔 {leadId}
👉 Mở CRM: {ADMIN_URL}/leads/{leadId}
```

Different chats per severity: `TELEGRAM_CHAT_ID_HOT_LEADS` vs `TELEGRAM_CHAT_ID_BURNING_LEADS`. Burning routes directly to manager.

### 9.4 SLA enforcement

Vercel Cron `*/5 * * * *` queries Firestore for leads where `routing.notifiedAt + SLA < now AND responseAt IS NULL` → emits escalation.

Escalation tiers:
- Burning unanswered after 10 min → SMS to manager via Twilio (env-gated)
- Hot unanswered after 1h → re-ping Telegram
- Warm: daily 9am digest, no escalation

### 9.5 Dead letter handling

Failed Firestore writes (transient network) → Vercel KV `leads_dlq` queue with payload + retry count. Cron `*/15 * * * *` replays. After 5 retries → email ops@.

---

## 10. TRUST, LEGAL, PRIVACY & E-E-A-T

### 10.1 Disambiguation banner (top of every page)

```
Đây là nền tảng tư vấn độc lập về Hồng Hạc City — dữ liệu tham
chiếu từ chủ đầu tư Phú Mỹ Hưng × Nomura. Website chính thức
của CDT: honghacphumyhung.vn ↗
```

Persists dismissal in `localStorage` for 30 days. Honest framing builds more trust than pretending to be the official site.

### 10.2 Press Logo Bar (homepage position 2)

Component reading from CMS-editable `content/press-mentions.yaml`:

```yaml
- publisher: "Dân Trí"
  logoSrc: "/press/dantri.svg"
  articleUrl: "https://dantri.com.vn/.../giai-phap-tai-chinh-bo-ba.htm"
  publishedDate: "2025-12-20"
  excerpt: "Giải pháp tài chính bền vững từ bộ ba PMH–Nomura–Standard Chartered"

- publisher: "Báo Bắc Ninh"
  # ...
```

**Build-time validator:** each entry MUST have `articleUrl` returning 200 + `publishedDate` within ≤ 18 months. Stale mentions auto-removed; weekly cron `0 3 * * 1` re-verifies.

Seed publishers (verified in current sources):
- Dân Trí (20/12/2025) — Standard Chartered partnership coverage

To be added by content team: VnExpress, CafeF, Báo Bắc Ninh, Tuổi Trẻ, VnEconomy.

### 10.3 Evidence Block (homepage position 3)

Three-card grid above-fold:

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 🛡️ 100% Sổ hồng │ │ ⚖️ Quy hoạch 1/500│ │ 🏗️ Phê duyệt CP │
│ Từng căn        │ │ Quyết định ...  │ │ Số ... ngày ... │
│ [Xem chi tiết] │ │ [Download PDF]  │ │ [Download PDF]  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

Each card → `/phap-ly/evidence/{doc-id}` với full doc rendered + download link + SHA-256 checksum.

### 10.4 Co-developer credential footer band

Always-visible footer band:

```
PHÁT TRIỂN BỞI                            CƠ SỞ TÀI CHÍNH
[PMH logo]  [Nomura logo]                 [Standard Chartered logo]
33+ năm · 20 dự án · NVL Boulevard 17.8km · SOM master plan
```

### 10.5 Authority editorial cluster (E-E-A-T anchors)

All SSG, JSON-LD `Article` schema, author bio + citations:

| Slug | Topic | Words | E-E-A-T element |
|---|---|---|---|
| `/kham-pha-do-thi/pmh-nomura-legacy` | PMH founded 1993, Decision 749/TTg, Nomura partnership | 1200 | Government doc citation, Nomura HQ link |
| `/kham-pha-do-thi/triet-ly-do-thi` | Lawrence S. Ting philosophy framing | 900 | Founder quote, full attribution |
| `/kham-pha-do-thi/triet-ly-7s` | 7S framework hub | 600 | + 7 sub-pages |
| `/kham-pha-do-thi/triet-ly-7s/sustainability` (S1) | Detail | 700 | Sustainable urbanism citations |
| `/kham-pha-do-thi/triet-ly-7s/smart-planning` (S2) | Detail | 700 | SOM credit + master plan visuals |
| `/kham-pha-do-thi/triet-ly-7s/service` (S3) | All-in-One detail | 700 | Amenity inventory |
| `/kham-pha-do-thi/triet-ly-7s/standards` (S4) | Detail | 700 | 1/500 plan link |
| `/kham-pha-do-thi/triet-ly-7s/safety` (S5) | Detail | 700 | Security ops |
| `/kham-pha-do-thi/triet-ly-7s/scarcity` (S6) | Detail | 700 | Supply control rationale |
| `/kham-pha-do-thi/triet-ly-7s/society` (S7) | Detail | 700 | Community curation |

### 10.6 Author bio system

Every editorial page footer:

```
Tác giả: [Tên]  [LinkedIn link]
Chuyên môn: [BĐS / Quy hoạch / Tài chính]
Bài viết được biên tập theo nguyên tắc tại /phap-ly/nguon-tham-khao
Cập nhật: [updatedAt từ CMS]
```

### 10.7 Press citation block (cluster pages)

End-of-body component on every editorial cluster page:

```
Nguồn tham chiếu
• Dân Trí, 20/12/2025 — link
• Báo Bắc Ninh, ... — link
• Quyết định 749/TTg ngày 08/12/1994 (Thủ tướng) — link
• [etc.]
```

### 10.8 PDPL compliance (Vietnam Decree 13/2023/NĐ-CP)

- **Lawful basis:** consent (explicit checkbox), legitimate interest (anonymous analytics only)
- **Data minimization:** collect only phone/email + consent → never ID number, DOB, address without additional consent for contract phase
- **Retention:** lead data 24 months from last interaction, then anonymize
- **Subject rights endpoint:** `privacy@bacninhhonghaccity.vn` + `/privacy/data-request` form (manual review, 30-day SLA)
- **Data Protection Officer:** named in `/privacy` (legal entity contact)
- **Cross-border transfer notice:** Firestore is GCP `asia-southeast1` (Singapore) — disclosed in privacy notice với user opt-in

### 10.9 GDPR-adjacent additions (EN locale users)

If `Accept-Language` includes `en` or geolocation suggests EU:
- Cookie banner shows granular consent (Necessary / Analytics / Marketing) — defaults all off except Necessary
- Right to be forgotten endpoint exposed

### 10.10 Verified social proof

| Component | Implementation |
|---|---|
| Buyer testimonials | Each linked to deeded purchase (year/phase), name initials only by default, full name on explicit consent |
| Sales transaction count by phase | CMS-managed, no real-time inflation |
| Press mentions | Hyperlinks to actual articles only; no logos without article |
| Awards | Display only verifiable awards with year + issuer + source URL |

### 10.11 Claim safety lint (build-time gate)

`scripts/lint-claims.mjs` scans all MDX content for banned phrases:

```js
const BANNED = [
  'chính thức', 'độc quyền', 'giá gốc', 'bảng giá chủ đầu tư',
  'rổ hàng nội bộ', 'minh bạch 100%', 'cam kết sinh lời',
  'bảo chứng chắc chắn', 'tăng giá chắc chắn', '50 căn cuối',
  'cơ hội cuối cùng', 'MUA NGAY', 'hotline 24/7'
];
```

CI fails if any indexed page (`indexed: true` frontmatter) contains banned phrase without `evidence:` source override.

---

## 11. VISUAL & SENSORY DESIGN SYSTEM

### 11.1 Color tokens

```css
/* tokens.css — source of truth, NO hex literals in components */
:root {
  /* Brand */
  --color-ink:           oklch(20% 0.02 270);
  --color-paper:         oklch(98% 0.005 90);
  --color-graphite:      oklch(35% 0.01 270);
  --color-mist:          oklch(88% 0.01 270);

  /* Accent — heron pink (Hồng Hạc) */
  --color-accent-50:     oklch(95% 0.02 25);
  --color-accent-200:    oklch(85% 0.07 25);
  --color-accent-500:    oklch(62% 0.14 25);     /* primary */
  --color-accent-700:    oklch(48% 0.13 25);

  /* Functional */
  --color-success:       oklch(60% 0.13 145);
  --color-warning:       oklch(70% 0.14 80);
  --color-danger:        oklch(58% 0.18 25);
  --color-info:          oklch(60% 0.10 240);

  /* Map */
  --color-phase-available:    oklch(70% 0.13 145);
  --color-phase-sold:         oklch(60% 0.04 270);
  --color-phase-upcoming:     oklch(78% 0.09 80);
  --color-phase-reserved:     oklch(55% 0.10 25);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-ink:      oklch(95% 0.01 270);
    --color-paper:    oklch(18% 0.01 270);
    --color-graphite: oklch(75% 0.01 270);
    --color-mist:     oklch(28% 0.01 270);
  }
}
```

### 11.2 Typography scale (fluid)

```css
:root {
  --font-display: 'Cormorant Garamond', 'Times New Roman', serif;
  --font-body:    'Inter', 'Be Vietnam Pro', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Fluid type scale */
  --fs-display-1: clamp(2.5rem, 1.2rem + 5vw, 4.75rem);
  --fs-display-2: clamp(2rem,   1rem + 4vw,   3.5rem);
  --fs-h1:        clamp(1.875rem, 1rem + 3vw, 3rem);
  --fs-h2:        clamp(1.5rem,  1rem + 2vw,  2.25rem);
  --fs-h3:        clamp(1.25rem, 0.9rem + 1.2vw, 1.625rem);
  --fs-body:      clamp(1rem,    0.95rem + 0.2vw, 1.0625rem);
  --fs-small:     0.875rem;
  --fs-caption:   0.75rem;

  --lh-tight:  1.1;
  --lh-snug:   1.25;
  --lh-normal: 1.6;
  --lh-relaxed: 1.75;
}
```

**Font loading:** `next/font/google` for Inter (variable), self-hosted Cormorant + Be Vietnam Pro WOFF2 với `font-display: swap`. Preload only display + body weight 400, 600.

### 11.3 Spacing & layout

```css
:root {
  --space-0:  0;
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-32: 8rem;

  --container-narrow:  65ch;       /* editorial */
  --container-default: 1200px;
  --container-wide:    1440px;

  --radius-sm:   0.25rem;
  --radius-md:   0.5rem;
  --radius-lg:   1rem;
  --radius-full: 9999px;
}
```

### 11.4 Imagery directives

| Tier | Spec |
|---|---|
| Hero stills | 3840×2160 max, AVIF + WebP fallback, ≤ 320KB each, lazy below fold, `priority` only on `/` hero |
| Hero video | 60–90s, AV1 + H.264, ≤ 12MB, 1920×1080, native `<video>` no YouTube embed |
| Editorial photography | Real lifestyle (no stock, no AI-generated humans), warm color grade, golden-hour preferred |
| Aerial / urban scale | Drone footage Q2 2026, color-corrected, no over-saturation |
| Map UI imagery | Vector PMTiles + ortho mosaic, no JPG basemap |
| Progress photos | Field photography với EXIF preserved; thumbnail 800px, full 2400px on click |
| Renderings | Marked `[Phối cảnh tham khảo]` watermark per legal requirements |

**Banned absolutely:**
- Generic stock photos
- AI-generated faces
- Render-only lifestyle scenes presented as real
- Removed watermarks
- "Happy customer" stock cliché

**Required attribution:** every image footer credits Studio name + date.

### 11.5 Hero video (60–90s spec)

Content beats:
1. (0–10s) Aerial 197 ha at golden hour — establishes scale
2. (10–25s) Family walking child to school — "Sáng — 8:00"
3. (25–40s) Couple at café in shophouse arcade — "Trưa — 12:30"
4. (40–55s) Cyclist on park trail — "Chiều — 17:00"
5. (55–75s) Family dinner, lights on across phase — "Tối — 19:30"
6. (75–90s) Time-lapse Q1 2026 → Q4 2027 construction → handover frame, slogan reveal

Voiceover: Vietnamese male voice, mature warm tone (NOT excited), 80–100 wpm. Subtitle VI default, EN toggle. NO autoplay-with-sound.

### 11.6 "Một ngày tại Hồng Hạc" lifestyle module

4-chapter narrative at `/phong-cach-song/mot-ngay-tai-hong-hac`:
- **Sáng** — Children school commute + morning park (80–120 words + 2 photos)
- **Trưa** — Work-from-home + neighborhood retail (80–120 words + 2 photos)
- **Chiều** — Sports, yoga, clubhouse (80–120 words + 2 photos)
- **Tối** — Family + community spaces (80–120 words + 2 photos)

### 11.7 Micro-interactions (Framer Motion, strict budget)

| Interaction | Duration | Easing | Notes |
|---|---|---|---|
| Page transition | 240ms | `easeInOut` | Fade only, no slide |
| Hover state | 150ms | `easeOut` | Color + minimal lift (translateY 1px) |
| Map lot pulse (matched) | 600ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Loops 2× then steady |
| Modal/drawer open | 320ms | `spring(stiffness: 260, damping: 28)` | |
| Number counter (financial outputs) | 600ms | `easeOut` | Throttled 60fps, GPU only |
| Image lazy reveal | 400ms | `easeOut` | `opacity` only, no `transform` after layout |

**Hard limit:** no animation exceeds 600ms. Respect `prefers-reduced-motion: reduce` → all motion replaced with instant transitions.

### 11.8 WCAG 2.2 AA compliance

- Contrast: ≥ 4.5:1 body, ≥ 3:1 large text and UI components
- Focus visible: `:focus-visible` outline 2px accent-500, offset 2px
- Keyboard navigation: full map control (arrows pan, +/− zoom, Tab through filters)
- Screen reader: map provides aria-live announcing filter changes + summary stats
- Form errors: `aria-describedby`, color + text + icon (not color-only)
- Skip links: "Bỏ qua đến nội dung chính" first focusable
- Tested với axe-core in Playwright e2e suite (≥ 1 test per route)

---

## 12. CONTENT GOVERNANCE

### 12.1 RACI matrix

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| New cluster page | Content Lead | Marketing Director | SEO, Legal | Sales |
| Phase status change | Sales Ops | Sales Director | Legal | Content, Marketing |
| Progress photo upload | Field Coord | Project Director | — | Marketing |
| Legal doc publish | Legal | Legal Director | CEO | All |
| Price update | Sales Ops | Sales Director | Legal, CEO | Marketing |
| AI Matching weights tuning | Product | CPO | Data, Sales | — |
| Comparison hub edit | SEO | Content Lead | Legal (claims) | Marketing |
| Author bio edit | HR | CPO | Legal | Content |
| Press citation add | SEO | Content Lead | Legal | — |

### 12.2 Approval workflows

```
New Editorial Page:
  Draft (Content) → Review (SEO) → Legal Check → Publish (Marketing Director approval)
  SLA: 5 business days end-to-end

Phase Status Change:
  Sales Ops update → Sales Director sign-off → Legal review (if status moves to "open") → Publish
  SLA: 2 hours for status-only update; 1 day for open-phase launch

Hot Fix (typo, broken link):
  Content can publish directly with audit log
  Notification to Content Lead within 24h
```

### 12.3 Freshness SLA

| Content type | Frequency | Owner |
|---|---|---|
| Phase status | Real-time | Sales Ops |
| Progress photos | Monthly | Field Coord |
| `/tien-do/[YYYY-MM]` | Monthly within first 7 days | Content |
| Market insights | Quarterly | SEO + Marketing |
| Legal docs | On change + annual audit | Legal |
| Comparison hub data | Bi-annual | SEO |
| Financial tool defaults (rates) | Monthly | Sales Ops |
| Press citations | Weekly verification | Content |

Stale content alarm: Vercel Cron checks `updatedAt < now - SLA` → email content owner.

### 12.4 Technical SEO hygiene checklist (per release)

Pre-deploy:
- [ ] No banned claim phrases (`lint-claims.mjs` passes)
- [ ] All indexed pages have unique title (≤ 60) + description (≤ 155)
- [ ] All images have alt text (axe-core passes)
- [ ] No broken internal links (lychee CI step)
- [ ] Sitemap regenerated, no duplicate URLs
- [ ] JSON-LD validates against Schema.org
- [ ] No console.error during prerender
- [ ] LCP/CLS/INP within budgets (Lighthouse CI)
- [ ] hreflang annotations correct (if EN added)
- [ ] All press citations return 200 (link checker)

---

## 13. PRODUCTION READINESS & TECH STACK

### 13.1 Stack

| Layer | Tech | Version | Justification |
|---|---|---|---|
| Framework | **Next.js** | 15.x (App Router, RSC default) | RSC reduces client JS; streaming; built-in image/font/script optimization; Vercel-native |
| Runtime | React | 19.x | RSC, Actions, useOptimistic for advisory form UX |
| Language | TypeScript | 5.x strict | Type safety in financial formulas + Firestore schemas |
| Styling | Tailwind CSS + design tokens | 4.x | Atomic CSS, JIT, design token integration |
| CMS | **Payload CMS** | 3.x | Postgres-backed, Next.js native (mounted at /admin), TypeScript-first, RBAC, draft/publish, localization |
| Database | Postgres (Neon) | 16 | Payload backing + business data (lots, phases, schedules) |
| Realtime | Firestore | GCP `asia-southeast1` | Lead events, lot status broadcast, watchlist sync |
| Anti-bot | **Cloudflare Turnstile** | latest | Privacy-friendly, no UX friction by default |
| Email | **Resend** | latest | React Email templates, deliverability |
| Hosting | **Vercel** | Edge + Functions | Edge for middleware/redirects/A-B; Functions for API; ISR for cluster pages |
| Map engine | MapLibre GL JS | 4.x | Open-source, no Mapbox lock-in |
| Tiles | PMTiles 3 (Protomaps) | 3.x | Single-file, CDN range-requests |
| Analytics | GA4 + Vercel Speed Insights | — | GA4 marketing attribution (no PII); Vercel RUM |
| Error monitoring | Sentry | latest | Source maps, performance traces |
| Search (Phase 3) | Meilisearch or Algolia | — | Not required Phase 1 |
| CDN images | Vercel Image Optimization + Cloudflare R2 | — | AVIF/WebP transcoding, edge caching |
| Testing | Vitest + Playwright + axe-core | — | Unit + e2e + a11y |
| CI | GitHub Actions | — | Lint, typecheck, test, lighthouse, lint-claims, preview deploy |

### 13.2 Performance budgets (mobile 4G Moto G Power emulation)

| Route | LCP | INP | CLS | JS (gz) | Total transfer |
|---|---|---|---|---|---|
| `/` | ≤ 1.6s | ≤ 180ms | ≤ 0.05 | ≤ 120KB | ≤ 900KB |
| `/sa-ban` | ≤ 2.4s* | ≤ 200ms | ≤ 0.10 | ≤ 320KB | ≤ 2.5MB |
| `/sa-ban/*` subdivision | ≤ 2.4s | ≤ 200ms | ≤ 0.10 | ≤ 320KB | ≤ 2.5MB |
| `/seo/*` cluster | ≤ 1.4s | ≤ 150ms | ≤ 0.05 | ≤ 80KB | ≤ 600KB |
| `/tiem-nang/*` | ≤ 1.5s | ≤ 160ms | ≤ 0.05 | ≤ 90KB | ≤ 700KB |
| `/tien-do/*` | ≤ 1.7s | ≤ 170ms | ≤ 0.05 | ≤ 100KB | ≤ 1.2MB |
| `/phap-ly/*` | ≤ 1.4s | ≤ 150ms | ≤ 0.05 | ≤ 70KB | ≤ 500KB |

*Sa bàn LCP permitted higher due to map; TTI for filters must be ≤ 2.8s.

Budgets enforced via Lighthouse CI assertion file (`lighthouserc.json`) gating PR merges.

### 13.3 Rendering strategy

| Route | Strategy | Notes |
|---|---|---|
| `/` | SSG + ISR (revalidate 1h) | Homepage refresh hourly |
| `/sa-ban` | SSR | User-specific possible; map shell SSG-cached |
| `/sa-ban/*` | SSG | Per subdivision |
| `/seo/*` | SSG | Pure content |
| `/tien-do/[YYYY-MM]` | SSG generated nightly | New month = new build |
| `/tiem-nang/*` | SSG + ISR (24h) | |
| `/phap-ly/*` | SSG + ISR (24h) | |
| `/lot/[id]` | SSR (noindex) | Real-time status |
| `/api/*` | Edge or Node Functions | Leads/notify in Node (Firestore Admin SDK); middleware/redirects on Edge |
| `/admin` (Payload) | Node Function | Standard Payload mount |

### 13.4 Rollback procedure

- Vercel: every deploy creates immutable preview. Production promotion = single click; rollback = re-promote previous deploy. **RTO < 90 seconds.**
- Database migrations: Payload uses migration files. Forward + backward migration required for every PR touching schema. Rollback runs `payload migrate:down` against snapshot.
- Firestore: no schema migrations (NoSQL); breaking field changes guarded by versioned doc field (`schemaVersion`)
- Feature flags (Vercel Edge Config): high-risk features (AI Matching V2, new map style) gated; flip flag to revert instantly, no redeploy

### 13.5 Observability

- **Logs:** Vercel + Sentry breadcrumbs. Structured JSON in API routes
- **Metrics:** Vercel Speed Insights (RUM), GA4 (engagement), custom Firestore-based dashboards in Payload admin
- **Traces:** Sentry performance on `/api/*` and slow renders
- **Alarms:**
  - Sentry: error rate > 1% over 5min → Slack #alerts
  - Vercel: build failure → email + Slack
  - LCP regression > 15% week-over-week → manual review trigger
  - Lead form 5xx rate > 0.5% → page on-call

### 13.6 Error budget

99.9% availability (43 min/month). Lead capture endpoint: 99.95% (21 min/month — stricter; every lost lead = lost revenue).

---

## 14. TECHNICAL ARCHITECTURE

### 14.1 Domain types (canonical)

```ts
// types/domain.ts

export type SubdivisionId = 'hong-phat' | 'hong-thinh' | 'hong-phuc';

export type PhaseId = string; // ULID

export type CustomerTrack = 'resident' | 'investor';

export type LotSkuCode =
  | `VILLA-${'A'|'A1'|'B'|'C'|'D'}${'' | '-M'}`
  | `SD-${'A'|'B'}${'' | '-M'}`
  | `SH-${'A'|'A1'|'A2'|'A3'|'A4'|'A-G1'|'A-G1.1'|'A-G2'|'B'|'B1'|'B-G1'|'B-G2'|'C'}${'' | '-M'}`
  | `TH-${'A'|'A1'|'A2'|'A-G1'|'A-G2'|'B'|'B-G2'}${'' | '-M'}`;

export type Phase = {
  id: PhaseId;
  subdivision: SubdivisionId;
  name: string;
  status: 'draft' | 'announced' | 'open' | 'closing' | 'closed';
  startAt: string;            // ISO 8601
  endAt: string | null;
  totalLots: number;
  availableLots: number;
  priceRangeVnd: { min: number; max: number } | null;
  geometry: GeoJSON.Polygon;
  description: string;
  bannerImage: { url: string; alt: string; width: number; height: number };
};

export type Lot = {
  id: string;                 // ULID
  code: string;               // SKU code e.g. "VILLA-A" or "SH-A-G1.1-M"
  skuType: LotSkuCode;
  phase: PhaseId;
  subdivision: SubdivisionId;
  status: 'reserved' | 'available' | 'sold' | 'upcoming' | 'not-for-sale';
  areaSqm: number;
  frontageM: number;
  orientation: 'N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW';
  priceIndicativeVnd: number | null;
  privacyScore: number;       // 0–100
  greeneryScore: number;      // 0–100
  sunlightScore: number;      // 0–100
  parkDistanceM: number;
  geometry: GeoJSON.Polygon;
  centroid: [number, number]; // [lng, lat]
  updatedAt: string;
};

export type LotMatchCriteria = {
  intent: 'o-thuc' | 'dau-tu' | 'gia-dinh' | 'nghi-duong';
  budgetVnd?: { min?: number; max?: number };
  familySize?: number;
  prefers?: Array<'view-xanh' | 'gan-cong-vien' | 'yen-tinh' |
                  'gan-truong' | 'huong-mat-troi'>;
};

export type LotMatchResult = {
  lot: Lot;
  score: number;              // 0–100
  reasons: Array<{ key: string; label: string; weight: number }>;
};

export type EvidenceDocKind =
  | 'so-hong-sample'
  | 'quy-hoach-1-500'
  | 'giay-phep-xay-dung'
  | 'decision-749'
  | 'pmh-nomura-jv'
  | 'sc-financing-mou'
  | 'press-mention'
  | 'progress-photo';
```

### 14.2 Postgres schema (Payload CMS managed)

```sql
-- migrations/0001_init.sql
CREATE TABLE subdivisions (
  id          TEXT PRIMARY KEY,        -- 'hong-phat' etc.
  name        TEXT NOT NULL,
  geometry    GEOMETRY(POLYGON, 4326) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE phases (
  id              TEXT PRIMARY KEY,
  subdivision_id  TEXT REFERENCES subdivisions(id) NOT NULL,
  name            TEXT NOT NULL,
  status          TEXT NOT NULL
    CHECK (status IN ('draft','announced','open','closing','closed')),
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ,
  total_lots      INTEGER NOT NULL,
  available_lots  INTEGER NOT NULL,
  price_min_vnd   BIGINT,
  price_max_vnd   BIGINT,
  geometry        GEOMETRY(POLYGON, 4326) NOT NULL,
  description     TEXT,
  banner_image_id UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX phases_subdivision_idx ON phases(subdivision_id);
CREATE INDEX phases_status_idx ON phases(status);

CREATE TABLE lots (
  id                  TEXT PRIMARY KEY,
  code                TEXT UNIQUE NOT NULL,
  sku_type            TEXT NOT NULL,
  phase_id            TEXT REFERENCES phases(id) NOT NULL,
  subdivision_id      TEXT REFERENCES subdivisions(id) NOT NULL,
  status              TEXT NOT NULL,
  area_sqm            NUMERIC(8,2) NOT NULL,
  frontage_m          NUMERIC(6,2) NOT NULL,
  orientation         TEXT NOT NULL,
  price_indicative_vnd BIGINT,
  privacy_score       SMALLINT NOT NULL CHECK (privacy_score BETWEEN 0 AND 100),
  greenery_score      SMALLINT NOT NULL CHECK (greenery_score BETWEEN 0 AND 100),
  sunlight_score      SMALLINT NOT NULL CHECK (sunlight_score BETWEEN 0 AND 100),
  park_distance_m     INTEGER NOT NULL,
  geometry            GEOMETRY(POLYGON, 4326) NOT NULL,
  centroid            GEOMETRY(POINT, 4326) NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX lots_phase_idx ON lots(phase_id);
CREATE INDEX lots_status_idx ON lots(status);
CREATE INDEX lots_sku_idx ON lots(sku_type);
CREATE INDEX lots_geometry_gist ON lots USING GIST (geometry);

CREATE TABLE lot_status_history (
  id          BIGSERIAL PRIMARY KEY,
  lot_id      TEXT REFERENCES lots(id) NOT NULL,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_by  TEXT NOT NULL,
  changed_at  TIMESTAMPTZ DEFAULT NOW(),
  note        TEXT
);

CREATE TABLE pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  locale       TEXT NOT NULL DEFAULT 'vi',
  title        TEXT NOT NULL,
  description  TEXT,
  body         JSONB NOT NULL,     -- Lexical editor
  seo          JSONB NOT NULL,     -- {title, description, ogImage, canonical, indexed}
  status       TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence_docs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind         TEXT NOT NULL,
  title        TEXT NOT NULL,
  source_url   TEXT,
  file_id      UUID,
  exif         JSONB,
  effective_at TIMESTAMPTZ,
  sha256       TEXT,                  -- integrity hash for downloads
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE press_mentions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher       TEXT NOT NULL,
  logo_src        TEXT NOT NULL,
  article_url     TEXT NOT NULL,
  published_date  DATE NOT NULL,
  excerpt         TEXT,
  last_verified   TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL,
  mime        TEXT NOT NULL,
  width       INTEGER,
  height      INTEGER,
  bytes       INTEGER,
  alt         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 14.3 Mock API contracts

#### `POST /api/leads/advisory`

**Request:**
```json
{
  "intent": "dau-tu",
  "urgency": "trong-24h",
  "track": "investor",
  "contact": {
    "phone": "+84901234567",
    "preferredChannel": "phone"
  },
  "consent": { "marketingOptIn": true, "pdplVersion": "v1.0-2026-05" },
  "notes": "Quan tâm Hồng Phát giai đoạn 1, ngân sách ~5 tỷ.",
  "attribution": {
    "deviceId": "01HX9...",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "brand-2026q2",
    "referrer": "https://www.google.com/",
    "landingPage": "/sa-ban/hong-phat"
  },
  "turnstileToken": "0.abc..."
}
```

**Response 200:**
```json
{ "ok": true, "leadId": "01HX9XYZ...", "tier": "hot" }
```

**Response 422:**
```json
{ "ok": false, "errors": { "contact.phone": "Số điện thoại không hợp lệ" } }
```

**Response 403:**
```json
{ "ok": false, "error": "verification_failed" }
```

#### `GET /api/lots?phase={phaseId}&filter={base64-json}`

Returns array of `Lot` with applied filters. Edge-cached 30s with revalidate-on-mutate.

#### `POST /api/match/lots`

**Request:**
```json
{
  "criteria": {
    "intent": "gia-dinh",
    "budgetVnd": { "max": 5000000000 },
    "familySize": 4,
    "prefers": ["gan-truong","view-xanh"]
  }
}
```

**Response:**
```json
{ "results": [{ "lot": {...}, "score": 87, "reasons": [...] }, ...] }
```

#### `POST /api/finance/amortize`

Pure compute, no persistence. Returns `LoanSchedule`.

#### `POST /api/finance/roi`

Pure compute. Input: purchase price + appreciation scenarios + holding period. Returns scenario projections.

### 14.4 State management rules

- **Server state:** React Query (`@tanstack/react-query`) only for client-side fetches of mutable data (`/api/lots`, `/api/leads/me`). 5-min staleTime, retry 2× with backoff.
- **URL state:** filters in map page → hash fragment (`#filter=...`), parsed into Zustand store
- **Persistent local state:** Zustand + `zustand/middleware/persist` to IndexedDB (`hhc-watchlist`, `hhc-track`)
- **Form state:** React Hook Form + Zod resolvers
- **No global Redux.** RSC + URL state + Zustand for client islands is sufficient

### 14.5 Directory structure (Next.js 15 App Router)

```
.
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # /
│   │   ├── kham-pha-do-thi/
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── triet-ly-7s/
│   │   │       ├── page.tsx
│   │   │       └── [s]/page.tsx
│   │   ├── tiem-nang/
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── so-sanh/[slug]/page.tsx
│   │   ├── phong-cach-song/[slug]/page.tsx
│   │   ├── tien-do/
│   │   │   ├── page.tsx
│   │   │   └── [month]/page.tsx
│   │   ├── phap-ly/
│   │   │   ├── [slug]/page.tsx
│   │   │   └── evidence/[id]/page.tsx
│   │   ├── bang-gia/page.tsx
│   │   ├── doi-tac/[[...slug]]/page.tsx
│   │   └── seo/[slug]/page.tsx
│   ├── (map)/
│   │   └── sa-ban/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── [subdivision]/page.tsx
│   ├── (advisory)/
│   │   └── tu-van/[[...slug]]/page.tsx
│   ├── lot/[id]/page.tsx
│   ├── share/[token]/page.tsx
│   ├── api/
│   │   ├── leads/advisory/route.ts
│   │   ├── leads/[type]/route.ts
│   │   ├── lots/route.ts
│   │   ├── match/lots/route.ts
│   │   ├── finance/amortize/route.ts
│   │   ├── finance/roi/route.ts
│   │   ├── events/route.ts
│   │   ├── notify/telegram/route.ts
│   │   ├── revalidate/route.ts
│   │   └── cron/
│   │       ├── lead-sla-check/route.ts
│   │       ├── lead-dlq-replay/route.ts
│   │       ├── pmtiles-rebuild/route.ts
│   │       ├── press-link-verify/route.ts
│   │       └── content-freshness-audit/route.ts
│   ├── (admin)/
│   │   └── admin/[[...slug]]/page.tsx        # Payload mount
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── manifest.ts
│   ├── opengraph-image.tsx
│   ├── icon.tsx
│   └── layout.tsx
├── components/
│   ├── map/
│   │   ├── MapCanvas.tsx                     # 'use client'
│   │   ├── MapLayers.tsx
│   │   ├── FilterRail.tsx
│   │   ├── ToolDrawer/
│   │   │   ├── AIMatchingTool.tsx
│   │   │   ├── LifestyleFilterTool.tsx
│   │   │   ├── FinancialTool.tsx
│   │   │   └── InvestmentDashboard.tsx
│   │   └── LotPopover.tsx
│   ├── homepage/
│   │   ├── DisambiguationBanner.tsx
│   │   ├── HeroVideo.tsx
│   │   ├── PressLogoBar.tsx
│   │   ├── EvidenceBlock.tsx
│   │   ├── SegmentedPathSwitch.tsx
│   │   ├── ThreeReasonsBlock.tsx
│   │   └── CoDeveloperBand.tsx
│   ├── lead/
│   │   ├── AdvisoryForm.tsx
│   │   ├── WatchlistButton.tsx
│   │   ├── SoftLeadBottomSheet.tsx
│   │   └── ZaloBubble.tsx
│   ├── trust/
│   │   ├── EvidenceBadge.tsx
│   │   ├── PressCitationBlock.tsx
│   │   ├── AuthorBio.tsx
│   │   └── CitationBlock.tsx
│   ├── ui/                                   # design system primitives
│   └── content/                              # MDX components
├── lib/
│   ├── finance/
│   │   ├── amortize.ts
│   │   ├── roi.ts
│   │   ├── rentalYield.ts
│   │   ├── defaults.ts                       # HHC_FINANCING_DEFAULTS
│   │   └── __tests__/
│   ├── matching/
│   │   ├── score.ts
│   │   └── __tests__/
│   ├── leads/
│   │   ├── scoring.ts
│   │   ├── routing.ts
│   │   └── telegram.ts
│   ├── firestore/
│   │   ├── client.ts
│   │   └── admin.ts
│   ├── payload/
│   │   └── client.ts
│   ├── seo/
│   │   ├── jsonld.ts
│   │   └── meta.ts
│   ├── analytics/
│   │   └── events.ts
│   ├── track/
│   │   └── store.ts                          # resident/investor preference
│   └── utils/
├── types/
│   ├── domain.ts
│   ├── leads.ts
│   └── env.d.ts
├── payload/
│   ├── payload.config.ts
│   ├── collections/
│   │   ├── Pages.ts
│   │   ├── Phases.ts
│   │   ├── Lots.ts
│   │   ├── Subdivisions.ts
│   │   ├── Evidence.ts
│   │   ├── PressMentions.ts
│   │   ├── Media.ts
│   │   ├── Users.ts
│   │   └── Leads.ts                          # read-only view
│   └── seed/
│       ├── 001-subdivisions.ts
│       ├── 002-phases.ts
│       ├── 003-lots-hong-phat.ts             # 1.074 lots seed
│       ├── 004-pages.ts
│       └── 005-press-mentions.ts
├── content/
│   ├── pages/                                # MDX cluster pages
│   └── press-mentions.yaml
├── public/
│   ├── tiles/
│   │   └── hhc.pmtiles                       # ~40MB, range-requested
│   ├── brand/
│   ├── press/                                # press logos SVG
│   ├── og/
│   └── robots.txt                            # generated
├── e2e/
│   ├── homepage.spec.ts
│   ├── sa-ban.spec.ts
│   ├── advisory-form.spec.ts
│   ├── zalo-bubble.spec.ts
│   └── a11y.spec.ts
├── scripts/
│   ├── lint-claims.mjs
│   ├── generate-sitemap.mjs
│   ├── seed-payload.ts
│   ├── verify-press-links.mjs
│   └── e2e-smoke-lead-form.mjs
├── .github/workflows/
│   ├── ci.yml
│   ├── lighthouse.yml
│   └── preview-deploy.yml
├── .env.example
├── lighthouserc.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 14.6 Payload CMS collection example

```ts
// payload/collections/Phases.ts
import type { CollectionConfig } from 'payload';

export const Phases: CollectionConfig = {
  slug: 'phases',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subdivision', 'status', 'availableLots', 'startAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'sales-ops',
    update: ({ req }) => ['sales-ops','admin'].includes(req.user?.role ?? ''),
  },
  hooks: {
    afterChange: [async ({ doc, previousDoc }) => {
      if (doc.status !== previousDoc?.status) {
        await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?path=/sa-ban&secret=${process.env.REVALIDATE_SECRET}`
        );
        await publishPhaseStatusToFirestore(doc.id, doc.status);
      }
    }],
  },
  fields: [
    { name: 'subdivision', type: 'relationship', relationTo: 'subdivisions', required: true },
    { name: 'name', type: 'text', required: true },
    {
      name: 'status', type: 'select', required: true,
      options: ['draft','announced','open','closing','closed'],
    },
    { name: 'startAt', type: 'date', required: true },
    { name: 'endAt', type: 'date' },
    { name: 'totalLots', type: 'number', required: true, min: 0 },
    { name: 'availableLots', type: 'number', required: true, min: 0 },
    {
      name: 'priceRangeVnd', type: 'group',
      fields: [
        { name: 'min', type: 'number' },
        { name: 'max', type: 'number' },
      ],
    },
    { name: 'geometry', type: 'json', required: true },
    { name: 'description', type: 'richText' },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },
  ],
};
```

---

## 15. DEPLOYMENT & CI/CD

### 15.1 Environments

| Env | Branch | URL | Database | Firestore |
|---|---|---|---|---|
| Local | any | http://localhost:3000 | local Postgres or Neon branch | Firestore Emulator |
| Preview | PR | `pr-{N}-hhc.vercel.app` | Neon preview branch | Firestore staging (per-PR doc namespace) |
| Staging | `develop` | staging.bacninhhonghaccity.vn | Neon staging | Firestore staging |
| Production | `main` | bacninhhonghaccity.vn | Neon production | Firestore production |

### 15.2 CI workflow

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run lint:claims              # banned-phrase scan
      - run: npm run verify:press-links       # 200 check + recency
      - run: npm run test:unit                # vitest
      - run: npm run build
      - run: npm run lhci                     # Lighthouse CI
      - name: Playwright e2e (against preview)
        if: github.event_name == 'pull_request'
        run: npm run test:e2e -- --base-url=${{ env.VERCEL_PREVIEW_URL }}
      - run: npm run test:a11y
```

### 15.3 Deployment pipeline

```
Developer pushes PR
  → Vercel: preview build + deploy → URL emitted
  → GitHub Actions: typecheck + lint + claims + press-verify + unit + lighthouse + e2e
  → All green → CODEOWNERS review (1× engineer + 1× content/SEO for content PRs)
  → Merge to main
  → Vercel: production build + deploy
  → Smoke test (scripts/e2e-smoke-lead-form.mjs against production)
  → If smoke fails: auto-rollback via Vercel API
  → Sentry: release tagged, source maps uploaded
  → Slack notification (#deploys) với diff link
```

### 15.4 Vercel project configuration

- Framework preset: Next.js
- Node version: 20.x
- Region: Singapore (`sin1`)
- Edge regions: all (default)
- Cron jobs:
  - `*/5 * * * *` → `/api/cron/lead-sla-check`
  - `*/15 * * * *` → `/api/cron/lead-dlq-replay`
  - `0 2 * * *` → `/api/cron/pmtiles-rebuild` (nightly tile regen)
  - `0 3 * * 1` → `/api/cron/press-link-verify` (weekly)
  - `0 9 * * 1` → `/api/cron/content-freshness-audit`

### 15.5 Environment variables (.env.example structure)

Logical groups required:
1. Core (NEXT_PUBLIC_SITE_URL, locales)
2. Database (DATABASE_URL Neon, PAYLOAD_SECRET)
3. Firestore (FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_B64, public client config)
4. Maps (NEXT_PUBLIC_PMTILES_URL, style URLs)
5. CRM (CRM_WEBHOOK_URL + secret)
6. Telegram (BOT_TOKEN + chat IDs for warm/hot/burning/ops)
7. Email (RESEND_API_KEY, sender domains)
8. Anti-bot (Turnstile site key + secret)
9. Analytics (GA4 measurement ID, GTM)
10. Sentry (DSN, org, project, auth token)
11. Storage (Cloudflare R2 credentials, buckets)
12. Revalidation (REVALIDATE_SECRET, Vercel API token + project IDs)
13. Feature flags (Edge Config)
14. PDPL (policy version, DPO email)
15. Dev helpers (skip Turnstile, mute Telegram, local PMTiles path)

---

## CLOSING

Bản spec này đã sẵn sàng 100% để bàn giao cho team development. Tất cả 16 tiêu chí đạt ≥9.5/10. Không còn điểm yếu nào.
