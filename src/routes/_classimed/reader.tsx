import { createFileRoute } from "@tanstack/react-router";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { glossaryAtom, type GlossaryEntry } from "./glossary/-atoms";
import {
  readerActiveDocumentAtom,
  readerEditValueAtom,
  readerEditingCellAtom,
  readerFocusedSegmentIdAtom,
  readerLoadErrorAtom,
  readerSegmentsAtom,
  readerSelectedDocumentIdAtom,
  readerShowGlossAtom,
  readerWorkspaceAtom,
  saveReaderSegmentCellAtom,
  toggleReaderSegmentFlagAtom,
  type ReaderSegment,
} from "./reader/-atoms";

export const Route = createFileRoute("/_classimed/reader")({
  component: RouteComponent,
});

function renderSourceWithTerms(text: string, glossary: ReadonlyArray<GlossaryEntry>) {
  if (!text || glossary.length === 0) {
    return text;
  }

  const sorted = [...glossary].sort((a, b) => b.char.length - a.char.length);
  const out: Array<string | JSX.Element> = [];
  let i = 0;

  while (i < text.length) {
    let matched: GlossaryEntry | null = null;

    for (const term of sorted) {
      if (text.substr(i, term.char.length) === term.char) {
        matched = term;
        break;
      }
    }

    if (matched) {
      out.push(
        <span key={`term-${i}`} className="term">
          {matched.char}
        </span>,
      );
      i += matched.char.length;
      continue;
    }

    let j = i;
    while (j < text.length) {
      let isTerm = false;
      for (const term of sorted) {
        if (text.substr(j, term.char.length) === term.char) {
          isTerm = true;
          break;
        }
      }
      if (isTerm) {
        break;
      }
      j++;
    }

    out.push(text.slice(i, j));
    i = j;
  }

  return out;
}

function RouteComponent() {
  const workspace = useAtomValue(readerWorkspaceAtom);
  const activeDocument = useAtomValue(readerActiveDocumentAtom);
  const segments = useAtomValue(readerSegmentsAtom);
  const focusedSegmentId = useAtomValue(readerFocusedSegmentIdAtom);
  const showGloss = useAtomValue(readerShowGlossAtom);
  const editingCell = useAtomValue(readerEditingCellAtom);
  const editValue = useAtomValue(readerEditValueAtom);
  const loadError = useAtomValue(readerLoadErrorAtom);
  const glossary = useAtomValue(glossaryAtom);

  const setSelectedDocumentId = useAtomSet(readerSelectedDocumentIdAtom);
  const setFocusedSegmentId = useAtomSet(readerFocusedSegmentIdAtom);
  const setShowGloss = useAtomSet(readerShowGlossAtom);
  const setEditingCell = useAtomSet(readerEditingCellAtom);
  const setEditValue = useAtomSet(readerEditValueAtom);
  const saveSegmentCell = useAtomSet(saveReaderSegmentCellAtom, { mode: "promise" });
  const toggleFlag = useAtomSet(toggleReaderSegmentFlagAtom, { mode: "promise" });

  const doneCount = segments.filter((segment) => !segment.isAnnotation && segment.fr.trim().length > 0).length;
  const flaggedCount = segments.filter((segment) => segment.flagged).length;

  const handleStartEdit = (segment: ReaderSegment, field: "gloss" | "fr") => {
    setEditingCell({ segmentId: segment.id, field });
    setEditValue(field === "gloss" ? segment.gloss : segment.fr);
  };

  const handleCommitEdit = async () => {
    if (!editingCell) {
      return;
    }

    const segment = segments.find((item) => item.id === editingCell.segmentId);
    if (!segment) {
      return;
    }

    const nextGloss = editingCell.field === "gloss" ? editValue : segment.gloss;
    const nextFr = editingCell.field === "fr" ? editValue : segment.fr;

    await saveSegmentCell({
      segmentId: editingCell.segmentId,
      gloss: nextGloss,
      fr: nextFr,
    });

    setEditingCell(null);
    setEditValue("");
  };

  return (
    <div className="page" style={{ minHeight: 0 }}>
      {loadError && (
        <div className="paper" style={{ margin: 16, padding: 12 }}>
          <div className="tiny" style={{ color: "var(--red-7)" }}>
            Erreur de chargement du reader: {loadError}
          </div>
        </div>
      )}

      {!activeDocument ? (
        <div className="empty" style={{ flex: 1 }}>
          <h3>Aucun document disponible</h3>
          <p>Importez un document depuis la bibliotheque pour ouvrir l'espace de lecture.</p>
        </div>
      ) : (
        <div className="ws">
          <div className="ws-side scroll-y">
            <div style={{ padding: "12px 14px 8px" }}>
              <div className="muted tiny" style={{ marginBottom: 4 }}>DOCUMENT ACTIF</div>
              <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 17, lineHeight: 1.3, fontWeight: 600 }}>{activeDocument.title}</div>
              <div className="muted tiny" style={{ marginTop: 4 }}>{activeDocument.titleFr ?? "Sans titre FR"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                <div className="doc-progress" style={{ flex: 1 }}>
                  <div style={{ width: `${segments.length > 0 ? (doneCount / segments.length) * 100 : 0}%` }}></div>
                </div>
                <span className="tiny muted">{doneCount}/{segments.length}</span>
              </div>
              <div className="muted tiny" style={{ marginTop: 8 }}>{activeDocument.period ?? "Periode non renseignee"}</div>
            </div>

            <hr className="divider" style={{ margin: "8px 14px" }} />

            <div style={{ padding: "4px 10px" }}>
              <div className="nav-section">Plan du texte</div>
              {segments.filter((segment) => !segment.isAnnotation).map((segment, index) => (
                <button
                  key={segment.id}
                  className={`navlink ${segment.id === focusedSegmentId ? "active" : ""}`}
                  onClick={() => setFocusedSegmentId(segment.id)}
                >
                  <span className="mono tiny muted" style={{ width: 18 }}>{index + 1}</span>
                  <span style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {segment.src.slice(0, 12)}...
                  </span>
                  {segment.flagged && <span className="badge badge-yellow">a revoir</span>}
                </button>
              ))}
            </div>

            <hr className="divider" style={{ margin: "8px 14px" }} />

            <div style={{ padding: "4px 10px 12px" }}>
              <div className="nav-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Documents</span>
                <span className="badge badge-gray">{workspace.documents.length}</span>
              </div>
              {workspace.documents.map((document) => (
                <button
                  key={document.id}
                  className={`doc-item ${document.id === activeDocument.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedDocumentId(document.id);
                    setFocusedSegmentId(null);
                    setEditingCell(null);
                    setEditValue("");
                  }}
                >
                  <div className="doc-title">{document.title}</div>
                  <div className="doc-sub">{document.titleFr ?? "Sans titre FR"}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="ws-doc">
            <div className="ws-toolbar">
              <div className="ws-meta">
                <div className="ws-meta-title" style={{ fontFamily: "var(--font-cjk-serif)" }}>{activeDocument.title}</div>
                <span className="ws-meta-sub">·</span>
                <div className="ws-meta-sub">{activeDocument.titleFr ?? "Sans titre FR"}</div>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <div className="segmented">
                  <button className={showGloss ? "active" : ""} onClick={() => setShowGloss(true)}>3 colonnes</button>
                  <button className={!showGloss ? "active" : ""} onClick={() => setShowGloss(false)}>Source · FR</button>
                </div>
                <span className="badge badge-yellow">{flaggedCount} signales</span>
              </div>
            </div>

            <div className="ws-body">
              <div className="ws-reading scroll-y">
                <div className="ws-reading-inner">
                  <ColumnHeaderRow showGloss={showGloss} />

                  {segments.map((segment, index) => {
                    const isFocused = focusedSegmentId === null
                      ? index === 0
                      : focusedSegmentId === segment.id;

                    return (
                      <SegmentRow
                        key={segment.id}
                        segment={segment}
                        index={index}
                        showGloss={showGloss}
                        isFocused={isFocused}
                        glossary={glossary}
                        editingCell={editingCell}
                        editValue={editValue}
                        onStartEdit={handleStartEdit}
                        onEditChange={setEditValue}
                        onCommitEdit={handleCommitEdit}
                        onCancelEdit={() => {
                          setEditingCell(null);
                          setEditValue("");
                        }}
                        onToggleFlag={() => {
                          void toggleFlag({ segmentId: segment.id, isFlagged: !segment.flagged });
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="ws-margin scroll-y">
                <div className="ws-margin-h">Notes de la marge</div>
                <div className="tiny muted">Les notes et la file de relecture sont deja modelisees dans le schema (annotations + review_queue). Le wiring UI sera branche dans une iteration suivante.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ColumnHeaderRow({ showGloss }: { showGloss: boolean }) {
  return (
    <div className="col-head-row" style={!showGloss ? { gridTemplateColumns: "40px 1.1fr 1.2fr 24px" } : undefined}>
      <span></span>
      <div className="col-head-label">A · Source 文言<small>Texte classique — lecture seule</small></div>
      {showGloss && <div className="col-head-label">B · Glose 白話<small>Paraphrase moderne — editable</small></div>}
      <div className="col-head-label">C · Traduction française<small>Sortie principale — editable</small></div>
      <span></span>
    </div>
  );
}

function SegmentRow(props: {
  segment: ReaderSegment;
  index: number;
  showGloss: boolean;
  isFocused: boolean;
  glossary: ReadonlyArray<GlossaryEntry>;
  editingCell: { segmentId: string; field: "gloss" | "fr" } | null;
  editValue: string;
  onStartEdit: (segment: ReaderSegment, field: "gloss" | "fr") => void;
  onEditChange: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onToggleFlag: () => void;
}) {
  const {
    segment,
    index,
    showGloss,
    isFocused,
    glossary,
    editingCell,
    editValue,
    onStartEdit,
    onEditChange,
    onCommitEdit,
    onCancelEdit,
    onToggleFlag,
  } = props;

  const isEditingGloss = editingCell?.segmentId === segment.id && editingCell.field === "gloss";
  const isEditingFr = editingCell?.segmentId === segment.id && editingCell.field === "fr";

  return (
    <div className={`seg-row ${isFocused ? "active" : ""} ${segment.flagged ? "flagged" : ""}`} style={!showGloss ? { gridTemplateColumns: "40px 1.1fr 1.2fr 24px" } : undefined}>
      <div className="seg-num">
        <div>{String(index + 1).padStart(2, "0")}</div>
        <div className="tiny muted" style={{ marginTop: 4 }}>{Math.round(segment.confidence * 100)}%</div>
      </div>

      <div className="cell cell-A">
        {renderSourceWithTerms(segment.src, glossary)}
      </div>

      {showGloss && (
        isEditingGloss ? (
          <div className="cell cell-B cell-editing">
            <textarea
              autoFocus
              className="cell-edit-textarea"
              value={editValue}
              onChange={(event) => onEditChange(event.target.value)}
              onBlur={() => {
                void onCommitEdit();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onCancelEdit();
                }
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  void onCommitEdit();
                }
              }}
              rows={Math.max(2, Math.ceil(Math.max(1, editValue.length) / 28))}
            />
          </div>
        ) : (
          <div className="cell cell-B" onClick={() => onStartEdit(segment, "gloss")}>{segment.gloss}</div>
        )
      )}

      {isEditingFr ? (
        <div className="cell cell-C cell-editing">
          <textarea
            autoFocus
            className="cell-edit-textarea"
            value={editValue}
            onChange={(event) => onEditChange(event.target.value)}
            onBlur={() => {
              void onCommitEdit();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onCancelEdit();
              }
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                void onCommitEdit();
              }
            }}
            rows={Math.max(2, Math.ceil(Math.max(1, editValue.length) / 34))}
          />
        </div>
      ) : (
        <div className="cell cell-C" onClick={() => onStartEdit(segment, "fr")}>{segment.fr}</div>
      )}

      <div className="seg-actions" style={{ opacity: 1 }}>
        <button className={`iconbtn ${segment.flagged ? "active" : ""}`} onClick={onToggleFlag} title="Marquer pour relecture">
          !
        </button>
      </div>
    </div>
  );
}
