# 🌿 ClassiMed Translate — 古醫文譯
## Product Design Brief
**Classical Chinese Medical Texts · Translation & Study Tool**

---

| Field | Value |
|---|---|
| Document type | Product Design Brief |
| Version | 1.0 |
| Date | May 2026 |
| Audience | UI/UX Designer |
| Application | ClassiMed Translate — Classical TCM Text Translation & Study Tool |

---

## 1. Context & Background

This brief describes the design requirements for a specialised desktop/web application to help a practitioner of Traditional Chinese Medicine (TCM) work with classical medical texts. The primary user is a French-speaking acupuncturist and researcher who regularly studies ancient Chinese medical sources — texts written in Classical Chinese (文言文, *wényánwén*) — and needs to translate, annotate, and cross-reference them for both clinical and scholarly purposes.

> **Why this is not a generic translation problem**
>
> Classical Chinese medical texts predate modern Chinese by over 1,500 years. They use archaic grammar, omit subjects and articles, and rely on a specialised vocabulary (氣, 經絡, 陰陽, 五行…) that generic translators systematically mistranslate. The tool must treat terminology as the primary asset, not an afterthought.

---

## 2. Primary User Profile

Single primary user, with potential expansion to small research teams.

| Attribute | Detail |
|---|---|
| Role | TCM practitioner, researcher, translator |
| Native language | French |
| Working languages | Classical Chinese (source), Modern Chinese (intermediate), French (output) |
| Technical level | Comfortable with digital tools; not a developer |
| Primary device | Desktop / laptop (large screen preferred for side-by-side reading) |
| Source materials | Typed text, selectable PDFs, and scanned/photographed documents (mixed) |
| Key source texts | 黃帝內經, 難經, 傷寒論, 針灸甲乙經 and related classical acupuncture canon |

---

## 3. Problem Statement

The user needs to translate and study classical Chinese medical texts into French, but faces three compounding difficulties.

### 3.1 The language detection problem

A single document can contain three distinct language varieties in the same file: Classical Chinese (文言), Modern Chinese annotations or commentaries, and sometimes French notes the user has already added. Each variety requires a completely different translation strategy. No existing tool detects this automatically at segment level.

### 3.2 The terminology consistency problem

TCM contains approximately 150–200 core technical concepts (氣, 血, 津液, 精, 陰陽, 五行, meridian names, acupuncture point names, pathology terms…) that have no direct French equivalents. Established French translation conventions exist (Larre & Rochat de la Vallée, Husson, Andrès) but differ from each other. The user needs to choose her own conventions and enforce them consistently across an entire corpus of documents — something impossible with generic translation tools.

### 3.3 The study & reference problem

Reading a classical medical text is not a one-pass activity. The user returns to the same passages repeatedly, needs to compare how a term is used in different texts, annotate in context, and build a working reference glossary that grows with her research. No existing tool combines translation assistance with this kind of corpus-level scholarship.

---

## 4. Design Goals

### Primary goals

- Enable fluid side-by-side study of original text, modern Chinese gloss, and French translation in a single view
- Surface and enforce terminology consistency through a living, cross-referenced glossary
- Automatically detect language variety per segment, routing each to the correct translation strategy

### Secondary goals

- Support document ingestion from paste, PDF, and scanned images (OCR)
- Allow inline annotation at segment and term level
- Export to publication-ready bilingual documents (.docx, .pdf)
- Grow with the user: the glossary and corpus become more valuable over time

---

## 5. Key Screens & Functional Areas

The application consists of five main areas. The designer should treat these as zones to be laid out, not necessarily as separate pages — the tool is primarily a focused workspace, not a multi-page site.

| Screen / Zone | Core purpose | Key interactions |
|---|---|---|
| **Document Workspace** | The primary study view — source text alongside translations | Edit translations, open glossary panel, add notes, jump between segments |
| **Glossary** | Cross-referenced terminology database | Search, filter by category, see all occurrences in corpus, edit entries |
| **Document Library** | All imported texts with metadata | Import, search, open, tag, filter by text type or period |
| **Ingestion / OCR** | Bring new documents in | Paste text, upload PDF, photograph/scan a page, review OCR output |
| **Export** | Produce shareable output | Choose format, column layout, which columns to include, export |

---

## 6. Document Workspace — Detailed Layout

This is the most critical screen and where the user will spend the vast majority of her time. The design should optimise for long reading sessions on a large monitor.

### The three-column reading view

Each text segment (a clause or sentence of Classical Chinese) is displayed in three horizontally aligned columns:

| Column | Content | Editable? |
|---|---|---|
| **A — Original 文言** | Classical Chinese source text | ❌ Read-only, source of truth |
| **B — Modern gloss 白話** | Modern Chinese paraphrase | ✅ AI-generated, user-editable |
| **C — French translation** | The primary output | ✅ AI-generated, user-editable |

Segments are stacked vertically and scroll together. Clicking any cell in columns B or C makes it editable. A fourth narrow column may hold inline notes and annotations.

### Language detection badge

Each segment header displays a small colour-coded badge showing the detected language variety:

- 🔵 **Classical Chinese** (深藍 / deep blue)
- 🟢 **Modern Chinese** (青 / teal)
- 🟡 **French** (琥珀 / amber)

The user can override if detection is wrong. Mixed segments are flagged and split interactively.

### Inline glossary linking

Technical terms recognised in the glossary are subtly highlighted within the source text. Hovering or tapping shows a tooltip with the glossary entry (pinyin, French translation, notes). Clicking opens the full glossary panel for that term.

A highlighted term whose translation in column C differs from the glossary convention is flagged with a soft warning icon — non-blocking, resolved at the user's pace.

### Segment-level actions

Each segment row has a small action menu: re-translate, split segment, merge with next, copy row, flag for review. Flagged segments form a review queue accessible from the sidebar.

---

## 7. Glossary — Detailed Requirements

The glossary is a database of TCM terms. It ships pre-seeded with ~200 core terms and grows as the user works.

| Field | Description & design notes |
|---|---|
| **Character(s)** | The Chinese term — displayed large, as the visual anchor of each entry |
| **Pinyin** | Romanisation — always shown next to the characters |
| **Category** | Tag: concept / meridian / acupuncture point / pathology / technique / herb |
| **French translation(s)** | The user's chosen rendering — multiple allowed with context notes (e.g. *'souffle'* in philosophical texts, *'qi'* in clinical) |
| **Reference translations** | Optional: how established authors (Larre, Husson…) have rendered the term |
| **Corpus occurrences** | Auto-generated list: every passage where this term appears, with document name and jump link |
| **Notes** | Free text — etymology, clinical relevance, controversies |

The glossary should be accessible as:

- **(a)** A full-page view for browsing and editing
- **(b)** A slide-in panel from the workspace
- **(c)** A tooltip/popover on term hover

---

## 8. Translation Workflow (for the Designer)

Understanding the underlying data flow will help design appropriate loading states, error states, and progress indicators.

| # | Step | What happens / design implication |
|---|---|---|
| 1 | **Ingest** | User pastes text or uploads a file. OCR runs on images. → Show upload progress, OCR confidence score, allow manual correction before proceeding. |
| 2 | **Segment & detect** | Text is split into clauses. Each is tagged Classical / Modern / French. → Show detection badges immediately; user can override before translation starts. |
| 3 | **Glossary pre-scan** | Recognised TCM terms are highlighted. Glossary constraints are loaded. → Terms light up before any translation, giving user a preview of the content structure. |
| 4 | **Translation** | Classical → Modern Chinese (first hop), then → French (second hop). Modern Chinese goes directly to French. → Stream results segment by segment so the user can start reading immediately. |
| 5 | **Review** | User reads, edits, annotates. Terminology conflicts are flagged softly. → Conflict warnings are non-blocking; resolved at the user's pace. |
| 6 | **Glossary update** | User can promote any in-context term to the glossary. → One-click promote with pre-filled fields; should feel like a reward, not a chore. |
| 7 | **Export** | User chooses output format and column configuration. → Preview before export; remember last-used settings. |

---

## 9. Design Principles

### Scholar-first, not translator-first

This is a study tool, not a translation machine. The user will spend hours reading in this interface. Density, readability of CJK characters, and calm visual rhythm matter more than a flashy UI. Think academic reference software or a good e-reader — not a SaaS dashboard.

### The original text is sacred

Column A (Classical Chinese) should always feel stable and authoritative. It is never editable. Visual weight should make it feel like the anchor of the layout.

### The glossary is the star

The glossary should feel alive and connected to the text — not a separate tab the user has to remember to open. Inline highlighting and instant popovers are essential to this feeling.

### Reduce friction for corrections

AI translation is a first draft. The interface must make it effortless — even pleasurable — to correct, refine, and annotate. Every extra click to make a correction is a failure.

### Graceful handling of uncertainty

Language detection and OCR will sometimes be wrong. Confidence levels should be surfaced honestly, corrections should be easy, and errors should never feel alarming.

---

## 10. Visual & Typographic Direction

> **Suggested aesthetic direction:** Calm, scholarly, high-contrast. References: traditional Chinese book design (thread-bound books, vertical text layouts), European sinology publications (Larre & Rochat de la Vallée editions), and modern academic reading tools like Readwise or iA Writer. Avoid: SaaS blues, rounded-corner card grids, animated dashboards.

| Dimension | Guidance |
|---|---|
| **Typography — CJK** | A high-quality CJK font is non-negotiable. Suggested: *Noto Serif CJK TC* for Classical source text, *Noto Sans CJK* for modern annotations. Characters must render at ≥ 16px to remain legible. |
| **Typography — Latin** | A humanist serif or neutral sans for French output and UI chrome. Suggested: *Source Serif 4* or *iA Writer Quattro* for body; *Inter* for UI elements. |
| **Colour** | Neutral warm background (off-white), dark ink text, one strong accent for glossary highlights and interactive elements. Avoid full-saturation colours — they fatigue the eye during long sessions. |
| **Layout** | Wide viewport assumed (1280px+). The three-column reading view is the primary layout. Sidebar panels (glossary, notes) slide in without displacing the reading view. |
| **Density** | Medium-high information density is appropriate. This user reads dense academic texts daily — do not over-pad or over-simplify. |
| **Dark mode** | Strongly recommended as an optional mode for evening study sessions. |

---

## 11. Out of Scope (v1)

- Multi-user collaboration or shared glossaries
- Mobile / tablet layout (desktop-first for v1)
- Audio pronunciation features
- Herb formula / prescription databases (possible v2 extension)
- Integration with external TCM databases (possible v2)
- Handwritten manuscript OCR (requires specialised models — v2 or manual correction)

---

## 12. Deliverables Requested from Designer

- [ ] **User flow diagram** covering the 7-step workflow described in Section 8
- [ ] **Wireframes (low-fidelity):** Document Workspace, Glossary full view, Document Library, Ingestion flow
- [ ] **High-fidelity mockup:** Document Workspace (the three-column reading view) — this is the hero screen
- [ ] **Component specification:** glossary tooltip/popover, language detection badge, segment action menu, term conflict warning
- [ ] **Typography & colour system** documentation
- [ ] **Responsive breakpoint strategy** (even if desktop-first — what breaks at 1024px?)

---

## 13. Open Questions for Designer

1. How should the three columns handle very long Classical Chinese segments that are much shorter in French? Align top or centre?
2. Should vertical (traditional) text layout be offered as an option for column A?
3. What is the right visual treatment for a *flagged for review* segment?
4. How does the glossary panel open without covering column A (the original text)?
5. Should the user see the Modern Chinese gloss (column B) at all times, or can she collapse it once she is comfortable with a passage?

---

*Confidential — Design Brief v1.0 · May 2026*
*Questions about this brief? Please do not hesitate to ask for clarification on any section — especially the Document Workspace layout and the glossary cross-referencing behaviour, which are the highest-stakes design decisions.*
