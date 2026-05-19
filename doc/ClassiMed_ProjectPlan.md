# ClassiMed Translate — Project Plan

| Field | Value |
|---|---|
| Document type | Project Plan |
| Version | 1.0 |
| Date | May 2026 |
| Source documents | ClassiMed_BusinessAnalysis.md · ClassiMed_Design_Brief.md |
| Delivery approach | MVP-first, dependency-sequenced |

---

## 1. Project Framing

### Product goal

Build a specialized desktop/web application for a French-speaking TCM practitioner to translate, annotate, and cross-reference classical Chinese medical texts, enforcing terminology consistency through a living glossary across a growing corpus.

### Primary user outcomes

1. Import a classical text (paste, PDF, or scanned image) and receive an AI-generated two-hop translation (Classical Chinese → Modern Chinese gloss → French)
2. Read and correct translations segment-by-segment in a focused three-column workspace
3. Build and maintain a personal TCM glossary that enforces consistent terminology conventions across all documents
4. Annotate and flag passages for follow-up, with a cross-document review queue
5. Export publication-ready bilingual documents in PDF or DOCX format

### Major functional areas

| Zone | Dataflows |
|---|---|
| Document Workspace | DF-03, DF-04, DF-05, DF-06, DF-07, DF-08 |
| Glossary | DF-09 |
| Document Library | DF-10 |
| Ingestion / OCR | DF-01, DF-02 |
| Export | DF-11 |

### Technical characteristics

- **Architecture:** React frontend with Jotai-style atoms + Effect-TS service layer
- **Persistence:** Relational database (9+ tables: documents, segments, glossary_terms, term_fr_translations, term_references, term_occurrences, annotations, review_queue, export_settings)
- **AI integrations:** OCR (image/PDF), segmentation, language detection, two-hop translation (Classical Chinese → Modern → French), pinyin inference
- **Export:** PDF and DOCX rendering with CJK font embedding
- **Users:** Single primary user for v1; no multi-user auth required
- **Platform:** Desktop-first at 1280px+; dark mode recommended

---

## 2. Planning Assumptions

| # | Assumption |
|---|---|
| A-01 | Single user for v1 — no authentication or permission system required |
| A-02 | Desktop-first viewport (1280px+); mobile layout is out of scope for v1 |
| A-03 | Effect-TS architecture is already decided — services exposed via `Context.Tag` |
| A-04 | An AI provider capable of handling Classical Chinese (wényánwén) is available |
| A-05 | An OCR provider (API or local model) for PDF and image extraction is available |
| A-06 | Handwritten manuscript OCR is out of scope for v1 |
| A-07 | Multi-user collaboration and shared glossaries are out of scope for v1 |
| A-08 | Glossary seed data (~200 core TCM terms) requires expert review before release |
| A-09 | No fixed deadline or team-size constraint has been provided; plan assumes a small team (2–4 engineers) |
| A-10 | Deployment model (local Electron/Tauri vs. web-hosted) is an open decision that may affect export and OCR service choices |

---

## 3. Workstreams

| ID | Name | Objective | Source dataflows | Dependencies | Complexity | Risk |
|---|---|---|---|---|---|---|
| WS-01 | Platform Foundation | DB schema, Effect-TS service scaffolding, app shell, routing, atom conventions | All | None | Medium | Low |
| WS-02 | Document Ingestion & OCR | Bring texts in via paste, PDF, and image; OCR + correction UX | DF-01 | WS-01 | High | High (OCR quality, provider choice) |
| WS-03 | Segmentation & Language Detection | Split text into segments; classify each as Classical/Modern/French | DF-02 | WS-02 | High | Medium (detection accuracy, mixed segments) |
| WS-04 | Glossary Core | Full-page glossary browse/edit; initial seed of ~200 TCM terms | DF-09 | WS-01 | Medium | Medium (seed data accuracy, FR translations) |
| WS-05 | Document Workspace Core | Three-column reading view; pre-scan; AI translation; segment editing; conflict detection | DF-03, DF-04, DF-05 | WS-03, WS-04 | High | High (streaming UX, translation quality, conflict precision) |
| WS-06 | Annotation & Review Queue | Per-segment notes; flag-for-review; cross-document review sidebar | DF-06, DF-07 | WS-05 | Medium | Low |
| WS-07 | Glossary In-Workspace Integration | Term highlight + tooltip; promote-to-glossary drawer; corpus occurrence links | DF-08 | WS-04, WS-05 | Medium | Low |
| WS-08 | Document Library | Document card grid; search/filter/sort; archive/delete; progress stats | DF-10 | WS-01 | Medium | Low |
| WS-09 | Export | PDF and DOCX generation; column config; live preview; settings persistence | DF-11 | WS-05, WS-06 | High | High (CJK rendering, long-document performance) |
| WS-10 | Design System & UX Polish | CJK + Latin typography; colour system; dark mode; component library; responsive breakpoints | All | WS-01 | Medium | Low |

---

## 4. Work Breakdown Structure

### WS-01 — Platform Foundation

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-01.1 | Database schema & migrations | Define and migrate all tables: documents, segments, glossary_terms, term_fr_translations, term_references, term_occurrences, annotations, review_queue, export_settings | None | Versioned schema, migration scripts | Backend |
| WP-01.2 | Effect-TS service layer scaffolding | Establish `Context.Tag` conventions, base repository patterns, error types, service wiring | WP-01.1 | Service interfaces, DI layer | Backend |
| WP-01.3 | Application shell & routing | App entry, navigation structure, five zone routes, sidebar layout | WP-01.2 | Runnable app skeleton | Frontend |
| WP-01.4 | Atom architecture setup | Establish atom taxonomy (Input / Output / Transformation); conventions for triggering Effect services from events | WP-01.3 | Atom pattern guide + examples | Frontend |

### WS-02 — Document Ingestion & OCR

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-02.1 | Paste mode ingestion | CJK-capable `<textarea>`, live character count, metadata form, confirm button | WP-01.4 | Working paste ingestion flow | Frontend |
| WP-02.2 | PDF upload & text extraction | File picker, drag-and-drop, `DocumentRepository.create`, pass extracted text to DF-02 | WP-02.1 | PDF text extraction path | Backend + Frontend |
| WP-02.3 | Image OCR integration | `OcrService.run(file)`, confidence score, OCR progress bar; provider selection required | WP-02.2 | Image OCR end-to-end | Backend + Integration |
| WP-02.4 | OCR correction view | Side-by-side display; low-confidence character highlighting; editable overlay | WP-02.3 | Correction UX complete | Frontend |
| WP-02.5 | Document metadata form | Title, French title, historical period, document type fields; validation | WP-02.1 | Document record persisted with metadata | Frontend |

### WS-03 — Segmentation & Language Detection

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-03.1 | Segmentation service | `SegmentationService.split(text)`, `SegmentRepository.createBatch`, rule-based + AI clause splitting | WP-01.2 | Segments persisted from raw text | Backend + Integration |
| WP-03.2 | Language detection service | `LanguageDetectionService.classify(segments)`, assign Classical/Modern/French badge per segment | WP-03.1 | Language-tagged segments | Backend + Integration |
| WP-03.3 | Segmentation preview UI | Stacked segment list; colour-coded language badges; confidence opacity; badge override dropdown | WP-03.2 | Reviewable detection UI | Frontend |
| WP-03.4 | Interactive segment split tool | Click within source text to set split point; replace original with two segments | WP-03.3 | Split UX functional | Frontend + Backend |
| WP-03.5 | Mixed-segment detection & resolution | Banner for mixed segments; "Split interactively" action; "Begin translation" gate | WP-03.4 | No mixed segments pass to DF-03 | Frontend |

### WS-04 — Glossary Core

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-04.1 | Glossary data model | Tables: glossary_terms, term_fr_translations, term_references, term_occurrences; CRUD services | WP-01.1 | Full glossary persistence layer | Backend |
| WP-04.2 | Glossary full-page browse UI | Term card list; search bar (debounced); multi-select category filter; sort | WP-04.1 | Browseable glossary | Frontend |
| WP-04.3 | Term detail panel | All FR translations, reference translations (Larre, Husson…), notes, corpus occurrences | WP-04.2 | Term detail view complete | Frontend |
| WP-04.4 | Glossary edit mode | Inline field editing; FR translation add/remove/reorder; delete with confirmation | WP-04.3 | Full glossary CRUD in UI | Frontend |
| WP-04.5 | Initial glossary seed | Import ~200 core TCM terms with pinyin, categories, and primary FR translations; expert review required | WP-04.1 | Seed data in DB | Content + Backend |
| WP-04.6 | Glossary slide-in panel | Panel accessible from workspace without leaving document view; same search/browse as full-page | WP-04.2 | Workspace-embedded glossary | Frontend |

### WS-05 — Document Workspace Core

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-05.1 | Three-column reading view | Columns A (read-only), B (gloss), C (French), D (notes); segment-stacked vertical layout; wide viewport | WP-01.4 | Layout shell for workspace | Frontend |
| WP-05.2 | Glossary pre-scan service | `TermScanService.scan(segments, terms)`; persist term occurrences; pre-scan summary bar | WP-04.1, WP-03.5 | Term occurrences recorded; scan complete before translation | Backend |
| WP-05.3 | Term highlight & tooltip in column A | Underline recognised terms; hover tooltip (pinyin, category, primary FR); "Open in glossary" link | WP-05.2, WP-04.6 | Live glossary linkage in workspace | Frontend |
| WP-05.4 | AI translation service | `TranslationService.translateSegment` + `stream`; two-hop pipeline; glossary constraints; `ConflictDetectionService.check` | WP-05.2 | Streaming translation results persisted | Backend + Integration |
| WP-05.5 | Translation progress UI | Per-document progress bar; streaming cell fill (word-by-word); skeleton placeholders; translation queue sidebar | WP-05.4 | Streaming UX complete | Frontend |
| WP-05.6 | Segment edit (click-to-edit) | Click B or C to edit; auto-resize `<textarea>`; save on blur/Cmd+Enter; unsaved indicator; revert action | WP-05.5 | Full edit loop functional | Frontend + Backend |
| WP-05.7 | Conflict detection display | Amber icon on C cells with glossary convention mismatch; re-evaluation after each save; non-blocking | WP-05.6 | Conflict warnings in workspace | Frontend |
| WP-05.8 | Segment action menu | Re-translate, split, merge with next, copy row, flag for review | WP-05.6 | All segment actions available | Frontend |

### WS-06 — Annotation & Review Queue

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-06.1 | Annotation persistence | `AnnotationRepository` create/delete/list; per-segment multi-note storage | WP-01.2 | Annotations persisted | Backend |
| WP-06.2 | Notes column UI (column D) | Note count badge; click to expand inline editor; Cmd+Enter to save; chronological note list; delete | WP-06.1, WP-05.1 | Annotation UX complete | Frontend |
| WP-06.3 | Flag action & popover | Segment action → flag; optional reason text popover; `segments.isFlagged`; left-border indicator | WP-05.8 | Flagging functional | Frontend + Backend |
| WP-06.4 | Review queue sidebar | Cross-document open items; grouped by document; queue item cards; "Mark resolved" action | WP-06.3 | Review queue usable | Frontend + Backend |
| WP-06.5 | Queue count badge in navigation | Live count of open review items in nav icon | WP-06.4 | Visible queue status | Frontend |

### WS-07 — Glossary In-Workspace Integration

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-07.1 | Text selection → promote tooltip | Selecting chars in column A shows "Promote to glossary" action | WP-05.3 | Selection detection functional | Frontend |
| WP-07.2 | Promote drawer | Pre-filled form (chars, inferred pinyin via `PinyinService`, suggested FR); category picker; duplicate detection; one-click save | WP-07.1, WP-04.1 | Promote flow complete | Frontend + Backend |
| WP-07.3 | Corpus occurrences in glossary | `TermOccurrenceRepository.listByTermWithContext`; passage list with document name and "Jump to segment" links | WP-04.3 | Corpus cross-reference in glossary | Frontend + Backend |
| WP-07.4 | "Open in glossary" from tooltip | Link in term hover tooltip opens term in glossary slide-in panel | WP-04.6, WP-05.3 | Tooltip → glossary panel navigation | Frontend |

### WS-08 — Document Library

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-08.1 | Document card grid | Cards with CJK title, French title, period, type badge, tag list, progress arc (done/total segments) | WP-01.4 | Library grid rendering | Frontend |
| WP-08.2 | Search, filter & sort | Search (title, titleFr, period, tags); type filter pills; tag cloud filter; sort by updated/title/progress | WP-08.1 | Full library navigation | Frontend |
| WP-08.3 | Document context menu | Right-click or "⋯": Open · Export · Archive · Delete with cascade confirmation dialog | WP-08.1 | Full document lifecycle in library | Frontend + Backend |
| WP-08.4 | Queued status badge | "À importer" badge for documents with `status = "queued"` | WP-08.1 | Queue state visible | Frontend |

### WS-09 — Export

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-09.1 | Export panel UI | Slide-in panel; format selector; column config (checkbox + drag-to-reorder); include options | WP-05.1 | Export panel interactive | Frontend |
| WP-09.2 | Export preview pane | Live preview of first 2 segments with chosen column config; updates on change | WP-09.1 | Preview functional | Frontend |
| WP-09.3 | PDF export service | `ExportService.build` for PDF; CJK font embedding; long-document performance; `DocumentRepository.getWithSegments` | WP-09.1 | PDF export end-to-end | Backend + Integration |
| WP-09.4 | DOCX export service | `ExportService.build` for DOCX; column layout; optional glossary appendix | WP-09.3 | DOCX export end-to-end | Backend + Integration |
| WP-09.5 | Export settings persistence | `ExportSettingsRepository` save/load; remember last-used format and columns; toast on first use | WP-09.1 | Settings remembered across sessions | Backend + Frontend |

### WS-10 — Design System & UX Polish

| ID | Title | Description | Dependencies | Outputs | Owner |
|---|---|---|---|---|---|
| WP-10.1 | CJK + Latin typography system | Noto Serif CJK TC (column A), Noto Sans CJK (modern), Source Serif 4 or iA Writer Quattro (French body), Inter (UI chrome); min 16px CJK | WP-01.3 | Typography tokens applied globally | Design + Frontend |
| WP-10.2 | Colour system & accent palette | Warm off-white background, dark ink text, one strong accent for glossary highlights; no full-saturation colours | WP-10.1 | Colour tokens in design system | Design + Frontend |
| WP-10.3 | Component library | Language detection badge, segment action menu, term conflict warning, term tooltip/popover, glossary pill group, progress arc | WP-10.2 | Reusable component set | Frontend |
| WP-10.4 | Dark mode | Optional dark theme for evening sessions; toggle accessible from settings | WP-10.2 | Dark mode functional | Frontend |
| WP-10.5 | Responsive breakpoint strategy | 1280px primary; 1024px graceful degradation; column collapse rules for workspace | WP-10.1 | Layout stable at narrower widths | Frontend |

---

## 5. Milestones

### M-01 — Foundation Ready

| | |
|---|---|
| **Goal** | Database schema, service scaffolding, application shell, and routing are in place. No functional features, but the architecture is established and the team can build in parallel. |
| **Included workstreams** | WS-01, WP-10.1 (typography baseline) |
| **Entry criteria** | Deployment model decided; DB technology chosen; AI provider selected |
| **Exit criteria** | All tables migrated; all service interfaces defined; app boots and navigates between zones; atom pattern documented |

---

### M-02 — Document Ingestion Ready

| | |
|---|---|
| **Goal** | A text can be imported through all three modes (paste, PDF, image), OCR results reviewed and corrected, and a document record created with segments and language detection badges. |
| **Included workstreams** | WS-02, WS-03 |
| **Entry criteria** | M-01 complete; OCR provider selected |
| **Exit criteria** | Paste, PDF, and image ingestion all functional end-to-end; segments persisted with language tags; user can reach "Begin translation" state |

---

### M-03 — Translation Core Usable

| | |
|---|---|
| **Goal** | The document workspace is functional: glossary pre-scan highlights terms, AI translation fills columns B and C with streaming, and the user can edit and save any segment. Conflict warnings appear. |
| **Included workstreams** | WS-04 (WP-04.1–04.5), WS-05 |
| **Entry criteria** | M-02 complete; glossary seed data available (even partial); translation provider configured |
| **Exit criteria** | Full ingestion → pre-scan → translation → edit loop works on a real document; glossary term highlights and tooltips visible; conflict warnings firing correctly |

---

### M-04 — Glossary & Workspace Fully Integrated

| | |
|---|---|
| **Goal** | The glossary is fully editable (browse, edit, delete), accessible as a slide-in panel from the workspace, and connected to corpus occurrences. Users can promote in-context terms with one click. Annotations and the review queue are functional. |
| **Included workstreams** | WS-04 (WP-04.6), WS-06, WS-07 |
| **Entry criteria** | M-03 complete |
| **Exit criteria** | Glossary slide-in panel functional; promote-to-glossary drawer working with duplicate detection; corpus occurrences linked; annotation UX complete; review queue sidebar operational |

---

### M-05 — MVP Ready

| | |
|---|---|
| **Goal** | All core flows are complete and tested end-to-end: ingest → segment → translate → edit → annotate → flag → export. Document library is fully functional. Design system applied consistently. |
| **Included workstreams** | WS-08, WS-09, WS-10 (WP-10.2, 10.3, 10.5) |
| **Entry criteria** | M-04 complete; export provider/approach selected |
| **Exit criteria** | A real classical text can be imported, translated, edited, and exported as PDF and DOCX; library search and filter functional; no critical UX gaps in the five zones |

---

### M-06 — Production Readiness

| | |
|---|---|
| **Goal** | Dark mode, export polish, performance with large documents (100+ segments), full glossary seed validated by expert review, error handling hardened, and responsive breakpoints stable. |
| **Included workstreams** | WS-10 (WP-10.4), all workstreams (hardening) |
| **Entry criteria** | M-05 complete; expert review of glossary seed complete |
| **Exit criteria** | Dark mode toggleable; export handles documents of 200+ segments without timeout; all error states (OCR failure, translation failure, network error) handled gracefully; tested at 1024px |

---

## 6. Delivery Sequence

### Build order

```
M-01 Platform Foundation
  ↓
M-02 Ingestion (WS-02, WS-03)  ←  parallel: WS-08 Document Library
  ↓
M-03 Translation Core (WS-04 partial, WS-05)
  ↓
M-04 Glossary Integration (WS-04 full, WS-06, WS-07)  ←  parallel: WS-09 Export
  ↓
M-05 MVP (WS-09 complete, WS-10 core, WS-08 complete)
  ↓
M-06 Production Readiness (WS-10 full, hardening)
```

### MVP scope

All eleven dataflows (DF-01 through DF-11) are included in MVP. The dependency chain is tight enough that no clean cut line preserves a useful workflow. The minimum valuable experience requires the complete ingest → translate → edit → export loop.

**What is deferred post-MVP (v2):**
- Handwritten manuscript OCR (specialised models)
- Mobile/tablet layout
- Multi-user collaboration and shared glossaries
- External TCM database integrations
- Audio pronunciation features
- Herb formula / prescription databases
- Column B (modern gloss) collapse toggle (design open question — can ship after MVP)

### Critical path

```
WP-01.1 (schema)
  → WP-01.2 (services)
    → WP-02.1–02.5 (ingestion)
      → WP-03.1–03.5 (segmentation)
        → WP-04.1 (glossary schema) + WP-05.2 (pre-scan)
          → WP-05.4 (AI translation)
            → WP-05.6 (segment edit)
              → WP-09.3–09.4 (export)
```

Any slip on this path directly delays MVP.

### Parallel opportunities

| Parallel track | Can start alongside |
|---|---|
| WS-08 Document Library (WP-08.1–08.4) | After WP-01.4 — does not depend on translation or glossary |
| WS-10 Design System (WP-10.1–10.3) | After WP-01.3 — can be developed in parallel with all backend work |
| WP-04.5 Glossary seed data | After WP-04.1 — content work independent of frontend progress |
| WP-09.1 Export panel UI | After WP-05.1 — UI shell can be built before export services are ready |

---

## 7. Risks and Assumptions Register

| # | Risk / Assumption | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | AI model quality on Classical Chinese (wényánwén) | High — core product value depends on translation accuracy | High | Evaluate multiple providers early; define minimum quality bar; design manual correction as the primary fallback | Backend / PM |
| R-02 | OCR quality on scanned classical texts (woodblock print, aged paper) | High — poor OCR blocks the ingestion flow | Medium | Set explicit confidence threshold; make correction UX the primary path, not an afterthought; defer handwritten manuscripts to v2 | Backend / UX |
| R-03 | Streaming translation UX latency | Medium — slow streaming degrades the core reading experience | Medium | Set per-segment timeout; show skeleton placeholders immediately; allow user to start reading completed segments before queue finishes | Frontend |
| R-04 | Glossary seed accuracy and completeness | High — incorrect seed terms erode trust in the core asset | Medium | Commission expert review of seed data before M-03; ship seed as "draft" with user visible to allow correction | Content |
| R-05 | Conflict detection false positives | Medium — too many warnings fatigue the user | Medium | Start with strict matching; tune threshold after user testing; make conflict warnings dismissible | Backend |
| R-06 | PDF/DOCX rendering of CJK characters | High — broken export is a blocker for the publication use case | Medium | Prototype export early (alongside M-03); validate CJK font embedding and column layout on real content | Backend |
| R-07 | Long-document performance (100+ segments) | Medium — atom state and DOM size may degrade | Low–Medium | Test with 200-segment documents at M-04; virtualise segment list if needed | Frontend |
| R-08 | Deployment model ambiguity | Medium — web-hosted vs. Electron/Tauri affects OCR, export, and data privacy | High | Decide at M-01; drives infrastructure and provider choices | PM / Architecture |
| R-09 | Language detection accuracy on mixed documents | Medium — misclassified segments route to the wrong translation strategy | Medium | Surface confidence level; make badge override prominent; gate translation on user review step | Backend |
| R-10 | Pinyin inference quality | Low — errors in the promote drawer are annoying but not blocking | Low | Use a validated Hanzi→pinyin library; allow manual correction in the promote form | Backend |

---

## 8. Open Decisions

| # | Decision | Why it matters | Urgency |
|---|---|---|---|
| OD-01 | **Deployment model** — local desktop (Electron/Tauri) vs. web-hosted | Determines data privacy posture, whether OCR/AI calls are client-side or server-side, and infrastructure cost | Before M-01 |
| OD-02 | **Database technology** — local SQLite vs. PostgreSQL | Affects deployment model, migration tooling, and backup approach for a single user | Before M-01 |
| OD-03 | **AI translation provider and model** — which model handles Classical Chinese reliably? | Core product quality risk; must be evaluated before committing to the two-hop pipeline design | Before M-03 |
| OD-04 | **OCR provider** — third-party API vs. local model (e.g. Tesseract, Google Vision, AWS Textract) | Affects cost, latency, and privacy; must support Traditional Chinese characters and degraded print | Before M-02 |
| OD-05 | **Language detection method** — rule-based, fine-tuned model, or general LLM | Accuracy on mixed Classical/Modern documents is non-trivial; prototype needed | Before M-02 |
| OD-06 | **Export rendering approach** — WeasyPrint, Puppeteer, LibreOffice UNO, or cloud service | Determines PDF/DOCX fidelity, CJK font support, and server-side vs. client-side generation | Before M-05 |
| OD-07 | **Glossary seed data source** — which reference dictionaries (Larre, Husson, Andrès) to include as reference translations | Expert sign-off required; affects trust in the tool from day one | Before M-03 |
| OD-08 | **Atom state library** — Jotai, Recoil, or custom Effect-TS-driven state | Determines atom taxonomy implementation and service-trigger patterns described in the BA | Before M-01 |
| OD-09 | **Column B visibility** — always visible, or collapsible once the user is comfortable with a passage? | UX open question from Design Brief §13 — affects workspace layout contract | Before M-03 UX |
| OD-10 | **Three-column alignment** — align segment rows top or centre when Classical Chinese is much shorter than French? | Design Brief §13 open question; affects readability for long French translations | Before M-03 UX |

---

*ClassiMed Translate — Project Plan v1.0 · May 2026*
*Derived from ClassiMed_BusinessAnalysis.md and ClassiMed_Design_Brief.md*
