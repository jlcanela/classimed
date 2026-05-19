// Document Workspace — the hero screen
const { useState: wsUseState, useRef: wsUseRef, useEffect: wsUseEffect, useMemo: wsUseMemo } = React;

const LANG_BADGE = {
  classical: { color: "blue", label: "文言" },
  modern: { color: "teal", label: "白話" },
  french: { color: "yellow", label: "FR" },
};

const CAT_COLOR = Object.fromEntries(window.CATEGORIES.map(c => [c.id, c.color]));

// Highlights Chinese terms inside source text
function renderSourceWithTerms(text, glossary, onTermClick, onTermHover, onTermLeave) {
  // Match longest first
  const sorted = [...glossary].sort((a, b) => b.char.length - a.char.length);
  const out = [];
  let i = 0;
  while (i < text.length) {
    let matched = null;
    for (const t of sorted) {
      if (text.substr(i, t.char.length) === t.char) { matched = t; break; }
    }
    if (matched) {
      out.push(
        <span
          key={i}
          className="term"
          onMouseEnter={(e) => onTermHover(matched, e.currentTarget)}
          onMouseLeave={onTermLeave}
          onClick={() => onTermClick(matched)}
        >{matched.char}</span>
      );
      i += matched.char.length;
    } else {
      // bundle non-term chars
      let j = i;
      while (j < text.length) {
        let isTerm = false;
        for (const t of sorted) { if (text.substr(j, t.char.length) === t.char) { isTerm = true; break; } }
        if (isTerm) break;
        j++;
      }
      out.push(text.slice(i, j));
      i = j;
    }
  }
  return out;
}

// Highlights French terms (rendered translation of glossed terms)
function renderFrenchWithTerms(text, segment, glossary, onTermClick) {
  if (!segment.terms || !segment.terms.length) return text;
  const terms = segment.terms
    .map(id => glossary.find(g => g.id === id))
    .filter(Boolean);
  const sorted = terms
    .flatMap(t => t.fr.map(fr => ({ ...t, _fr: fr })))
    .sort((a, b) => b._fr.length - a._fr.length);

  const out = [];
  let i = 0;
  while (i < text.length) {
    let matched = null;
    for (const t of sorted) {
      const slice = text.substr(i, t._fr.length);
      if (slice.toLowerCase() === t._fr.toLowerCase()) {
        // ensure word boundary
        const prev = text[i - 1];
        const next = text[i + t._fr.length];
        if ((!prev || /\W/.test(prev)) && (!next || /\W/.test(next))) {
          matched = t; break;
        }
      }
    }
    if (matched) {
      const conflict = segment.frConflict && segment.frConflict.termId === matched.id && matched._fr.toLowerCase() !== matched.frPrimary.toLowerCase();
      out.push(
        <span
          key={i}
          className={`term-fr ${conflict ? "conflict" : ""}`}
          onClick={() => onTermClick(matched)}
          title={conflict ? `Rendu : « ${matched._fr} » — convention : « ${matched.frPrimary} »` : matched.frPrimary}
        >{text.substr(i, matched._fr.length)}</span>
      );
      i += matched._fr.length;
    } else {
      out.push(text[i]);
      i++;
    }
  }
  return out;
}

const Workspace = ({ state, setState }) => {
  const doc = window.DOCUMENTS.find(d => d.id === state.activeDocId);
  const segments = state.segments;
  const [editingCell, setEditingCell] = wsUseState(null); // {segId, field}
  const [editValue, setEditValue] = wsUseState("");
  const [tooltip, setTooltip] = wsUseState(null); // {term, anchor}
  const [actionMenu, setActionMenu] = wsUseState(null); // {anchor, segId}
  const [langMenu, setLangMenu] = wsUseState(null); // {anchor, segId}
  const [reviewOpen, setReviewOpen] = wsUseState(false);
  const [showGloss, setShowGloss] = wsUseState(true);
  const readingRef = wsUseRef(null);

  const flaggedCount = segments.filter(s => s.flagged).length;
  const doneCount = segments.filter(s => !s.flagged && !s.isAnnotation).length;

  const handleCellEdit = (segId, field, value) => {
    setEditingCell({ segId, field });
    setEditValue(value);
  };
  const commitEdit = () => {
    if (!editingCell) return;
    setState(s => ({
      ...s,
      segments: s.segments.map(seg => seg.id === editingCell.segId
        ? { ...seg, [editingCell.field]: editValue }
        : seg),
    }));
    setEditingCell(null);
  };

  const openGlossaryPanel = (term) => {
    setState(s => ({ ...s, pinnedTerm: term, glossaryPanelOpen: true }));
    setTooltip(null);
  };

  const toggleFlag = (segId) => {
    setState(s => ({
      ...s,
      segments: s.segments.map(seg => seg.id === segId ? { ...seg, flagged: !seg.flagged } : seg),
    }));
  };

  const splitSegment = (segId) => {
    setState(s => {
      const idx = s.segments.findIndex(x => x.id === segId);
      if (idx < 0) return s;
      const seg = s.segments[idx];
      const half = Math.floor(seg.src.length / 2);
      const a = { ...seg, id: seg.id + "a", src: seg.src.slice(0, half), gloss: seg.gloss, fr: seg.fr.slice(0, Math.floor(seg.fr.length/2)) };
      const b = { ...seg, id: seg.id + "b", src: seg.src.slice(half), gloss: "", fr: seg.fr.slice(Math.floor(seg.fr.length/2)) };
      const next = [...s.segments];
      next.splice(idx, 1, a, b);
      return { ...s, segments: next, toast: { msg: "Segment scindé en deux", icon: <Icon name="split" size={14}/> } };
    });
    setActionMenu(null);
  };

  const mergeWithNext = (segId) => {
    setState(s => {
      const idx = s.segments.findIndex(x => x.id === segId);
      if (idx < 0 || idx >= s.segments.length - 1) return s;
      const a = s.segments[idx];
      const b = s.segments[idx + 1];
      const merged = { ...a, src: a.src + b.src, gloss: (a.gloss + " " + b.gloss).trim(), fr: (a.fr + " " + b.fr).trim(), terms: [...new Set([...(a.terms||[]), ...(b.terms||[])])] };
      const next = [...s.segments];
      next.splice(idx, 2, merged);
      return { ...s, segments: next, toast: { msg: "Segments fusionnés", icon: <Icon name="merge" size={14}/> } };
    });
    setActionMenu(null);
  };

  const setSegLang = (segId, lang) => {
    setState(s => ({ ...s, segments: s.segments.map(seg => seg.id === segId ? { ...seg, lang } : seg) }));
    setLangMenu(null);
  };

  const reTranslate = (segId) => {
    setState(s => ({ ...s, toast: { msg: "Re-traduction du segment en cours…", icon: <Icon name="ai" size={14}/> } }));
    setActionMenu(null);
  };

  const promoteToGlossary = () => {
    setState(s => ({ ...s, promoteOpen: true }));
  };

  const notesBySeg = wsUseMemo(() => {
    const m = {};
    for (const n of window.NOTES) (m[n.segId] = m[n.segId] || []).push(n);
    return m;
  }, []);

  return (
    <div className="ws">
      {/* Side: document outline + review queue */}
      <div className="ws-side scroll-y">
        <div style={{ padding: "12px 14px 8px" }}>
          <div className="muted tiny" style={{ marginBottom: 4 }}>DOCUMENT ACTIF</div>
          <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 17, lineHeight: 1.3, fontWeight: 600 }}>{doc.title}</div>
          <div className="muted tiny" style={{ marginTop: 4 }}>{doc.titleFr}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
            <div className="doc-progress" style={{ flex: 1 }}><div style={{ width: `${(doneCount / segments.length) * 100}%` }}></div></div>
            <span className="tiny muted">{doneCount}/{segments.length}</span>
          </div>
          <div className="muted tiny" style={{ marginTop: 8 }}>{doc.period}</div>
        </div>

        <hr className="divider" style={{ margin: "8px 14px" }}/>

        <div style={{ padding: "4px 10px" }}>
          <div className="nav-section">Plan du texte</div>
          {segments.filter(s => !s.isAnnotation).map((seg, i) => (
            <button
              key={seg.id}
              className={`navlink ${seg.id === state.focusedSegId ? "active" : ""}`}
              onClick={() => {
                setState(s => ({ ...s, focusedSegId: seg.id }));
                const el = document.getElementById(`seg-${seg.id}`);
                el?.scrollIntoView({ block: "center", behavior: "smooth" });
              }}
            >
              <span className="mono tiny muted" style={{ width: 18 }}>{i + 1}</span>
              <span style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {seg.src.slice(0, 12)}…
              </span>
              {seg.flagged && <Icon name="flag" size={12} color="var(--yellow-7)" />}
            </button>
          ))}
        </div>

        <hr className="divider" style={{ margin: "8px 14px" }}/>

        <div style={{ padding: "4px 10px 12px" }}>
          <div className="nav-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>À revoir</span>
            <Badge color="yellow">{flaggedCount + window.REVIEW_QUEUE.length - 1}</Badge>
          </div>
          <button className="navlink" onClick={() => setReviewOpen(true)}>
            <Icon name="flag" size={14} color="var(--yellow-7)" />
            <span>File d'attente</span>
            <span className="count">{flaggedCount + window.REVIEW_QUEUE.length - 1}</span>
          </button>
          <button className="navlink" onClick={() => setState(s => ({ ...s, glossaryPanelOpen: !s.glossaryPanelOpen }))}>
            <Icon name="panel" size={14} />
            <span>Panneau glossaire</span>
          </button>
        </div>
      </div>

      {/* Main reading view */}
      <div className="ws-doc">
        <div className="ws-toolbar">
          <div className="ws-meta">
            <Icon name="doc" size={16} color="var(--gray-6)" />
            <div className="ws-meta-title" style={{ fontFamily: "var(--font-cjk-serif)" }}>{doc.title}</div>
            <span className="ws-meta-sub">·</span>
            <div className="ws-meta-sub">{doc.titleFr}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <Segmented value={showGloss ? "3col" : "2col"} onChange={v => setShowGloss(v === "3col")} options={[
              { value: "3col", label: "3 colonnes" },
              { value: "2col", label: "Source · FR" },
            ]} />
            <div className="divider-v" style={{ height: 24 }}></div>
            <Button variant="subtle" size="sm" leftIcon={<Icon name="search" size={14}/>}>Rechercher</Button>
            <Button variant="default" size="sm" leftIcon={<Icon name="download" size={14}/>}>Exporter</Button>
            <Button variant="filled" size="sm" leftIcon={<Icon name="ai" size={14}/>}>Re-traduire tout</Button>
          </div>
        </div>

        <div className="ws-body">
          <div ref={readingRef} className="ws-reading scroll-y">
            <div className="ws-reading-inner">
              <ColumnHeaderRow showGloss={showGloss} />
              {segments.map((seg, idx) => (
                <SegmentRow
                  key={seg.id}
                  seg={seg}
                  idx={idx}
                  showGloss={showGloss}
                  focused={seg.id === state.focusedSegId}
                  editingCell={editingCell}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onCellClick={handleCellEdit}
                  onCellCommit={commitEdit}
                  onCellCancel={() => setEditingCell(null)}
                  onTermHover={(term, anchor) => setTooltip({ term, anchor })}
                  onTermLeave={() => setTooltip(null)}
                  onTermClick={openGlossaryPanel}
                  onMore={(anchor) => setActionMenu({ anchor, segId: seg.id })}
                  onLangClick={(anchor) => setLangMenu({ anchor, segId: seg.id })}
                  onFlag={() => toggleFlag(seg.id)}
                  notes={notesBySeg[seg.id]}
                />
              ))}
            </div>
          </div>

          <div className="ws-margin scroll-y">
            <div className="ws-margin-h">Notes de la marge</div>
            {(state.segments.filter(s => notesBySeg[s.id]).flatMap(s =>
              notesBySeg[s.id].map(n => (
                <div key={s.id + n.date} className="note">
                  <div className="tiny muted" style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                    <span className="note-anchor">§{state.segments.indexOf(s) + 1}</span>
                    <span>{n.date}</span>
                  </div>
                  {n.text}
                </div>
              ))
            ))}
            <Button variant="subtle" size="sm" leftIcon={<Icon name="add" size={14}/>} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>Nouvelle note</Button>

            <hr className="divider" style={{ marginTop: 18 }}/>

            <div className="ws-margin-h" style={{ marginTop: 4 }}>Terme épinglé</div>
            {state.pinnedTerm ? (
              <div>
                <div className="gloss-char" style={{ fontSize: 28 }}>{state.pinnedTerm.char}</div>
                <div className="gloss-pinyin tiny" style={{ marginTop: 2 }}>{state.pinnedTerm.pinyin}</div>
                <div style={{ fontFamily: "var(--font-french)", fontSize: 13, marginTop: 8 }}>{state.pinnedTerm.frPrimary}</div>
                <Button variant="light" size="xs" style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={() => setState(s => ({...s, glossaryPanelOpen: true}))}>Ouvrir la fiche</Button>
              </div>
            ) : (
              <div className="tiny muted">Survolez ou cliquez un terme dans le texte source pour l'épingler.</div>
            )}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <Popover anchor={tooltip.anchor}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 22, lineHeight: 1 }}>{tooltip.term.char}</div>
              <div>
                <div style={{ fontStyle: "italic", color: "var(--gray-7)" }}>{tooltip.term.pinyin}</div>
                <Badge color={CAT_COLOR[tooltip.term.category] || "gray"} style={{ marginTop: 4 }}>
                  {window.CATEGORIES.find(c => c.id === tooltip.term.category)?.label}
                </Badge>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-french)", fontSize: 14, marginTop: 10, color: "var(--gray-9)" }}>
              {tooltip.term.frPrimary}
              {tooltip.term.fr.length > 1 && <span className="muted tiny"> · ou {tooltip.term.fr.slice(1).join(", ")}</span>}
            </div>
            {tooltip.term.note && <div className="tiny muted" style={{ marginTop: 8, lineHeight: 1.5 }}>{tooltip.term.note}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <Button size="xs" variant="light" onClick={() => openGlossaryPanel(tooltip.term)} leftIcon={<Icon name="ext" size={12}/>}>Ouvrir la fiche</Button>
              <Button size="xs" variant="subtle" leftIcon={<Icon name="bookmark" size={12}/>}>Épingler</Button>
            </div>
          </Popover>
        )}

        {/* Action menu */}
        {actionMenu && (
          <Menu anchor={actionMenu.anchor} onClose={() => setActionMenu(null)}>
            <MenuLabel>Segment §{state.segments.findIndex(s => s.id === actionMenu.segId) + 1}</MenuLabel>
            <MenuItem icon={<Icon name="ai" size={14}/>} onClick={() => reTranslate(actionMenu.segId)}>Re-traduire ce segment</MenuItem>
            <MenuItem icon={<Icon name="split" size={14}/>} onClick={() => splitSegment(actionMenu.segId)}>Scinder en deux</MenuItem>
            <MenuItem icon={<Icon name="merge" size={14}/>} onClick={() => mergeWithNext(actionMenu.segId)}>Fusionner avec le suivant</MenuItem>
            <MenuDivider/>
            <MenuItem icon={<Icon name="flag" size={14}/>} onClick={() => { toggleFlag(actionMenu.segId); setActionMenu(null); }}>
              {state.segments.find(s => s.id === actionMenu.segId)?.flagged ? "Retirer le drapeau" : "Marquer pour relecture"}
            </MenuItem>
            <MenuItem icon={<Icon name="copy" size={14}/>} kbd="⌘C">Copier la ligne</MenuItem>
            <MenuItem icon={<Icon name="bookmark" size={14}/>} onClick={() => { promoteToGlossary(); setActionMenu(null); }}>Promouvoir terme au glossaire</MenuItem>
          </Menu>
        )}

        {/* Language override menu */}
        {langMenu && (
          <Menu anchor={langMenu.anchor} onClose={() => setLangMenu(null)} align="left">
            <MenuLabel>Forcer la langue</MenuLabel>
            <MenuItem icon={<Badge color="blue" dot>文言</Badge>} onClick={() => setSegLang(langMenu.segId, "classical")}>Chinois classique</MenuItem>
            <MenuItem icon={<Badge color="teal" dot>白話</Badge>} onClick={() => setSegLang(langMenu.segId, "modern")}>Chinois moderne</MenuItem>
            <MenuItem icon={<Badge color="yellow" dot>FR</Badge>} onClick={() => setSegLang(langMenu.segId, "french")}>Français</MenuItem>
            <MenuDivider/>
            <MenuItem icon={<Icon name="split" size={14}/>}>Marquer comme mixte</MenuItem>
          </Menu>
        )}

        {/* Review queue drawer */}
        {reviewOpen && (
          <Drawer title="File d'attente — à revoir" onClose={() => setReviewOpen(false)}>
            <div className="tiny muted" style={{ marginBottom: 10 }}>{flaggedCount + window.REVIEW_QUEUE.length - 1} éléments dans le corpus</div>
            <div style={{ marginBottom: 14 }}>
              <div className="ws-margin-h" style={{ marginBottom: 6 }}>Ce document</div>
              {segments.filter(s => s.flagged).map((s) => (
                <div key={s.id} className="paper" style={{ padding: 12, marginBottom: 8, cursor: "pointer" }}
                  onClick={() => {
                    setState(st => ({ ...st, focusedSegId: s.id }));
                    document.getElementById(`seg-${s.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
                    setReviewOpen(false);
                  }}>
                  <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 16, marginBottom: 4 }}>{s.src}</div>
                  {s.flagReason && <div className="tiny muted" style={{ marginTop: 4 }}>{s.flagReason}</div>}
                </div>
              ))}
            </div>
            <div className="ws-margin-h" style={{ marginBottom: 6 }}>Autres documents</div>
            {window.REVIEW_QUEUE.slice(1).map(item => {
              const doc = window.DOCUMENTS.find(d => d.id === item.docId);
              return (
                <div key={item.docId + item.segId} className="paper" style={{ padding: 12, marginBottom: 8 }}>
                  <div className="tiny muted">{doc?.title}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{item.note}</div>
                </div>
              );
            })}
          </Drawer>
        )}
      </div>
    </div>
  );
};

const ColumnHeaderRow = ({ showGloss }) => (
  <div className="col-head-row" style={!showGloss ? { gridTemplateColumns: "40px 1.1fr 1.2fr 24px" } : null}>
    <span></span>
    <div className="col-head-label">A · Source 文言<small>Texte classique — lecture seule</small></div>
    {showGloss && <div className="col-head-label">B · Glose 白話<small>Paraphrase moderne — éditable</small></div>}
    <div className="col-head-label">C · Traduction française<small>Sortie principale — éditable</small></div>
    <span></span>
  </div>
);

const SegmentRow = ({
  seg, idx, showGloss, focused,
  editingCell, editValue, setEditValue, onCellClick, onCellCommit, onCellCancel,
  onTermHover, onTermLeave, onTermClick,
  onMore, onLangClick, onFlag, notes,
}) => {
  const isEditing = (field) => editingCell?.segId === seg.id && editingCell?.field === field;
  const moreBtnRef = wsUseRef();
  const langBtnRef = wsUseRef();

  const gridStyle = !showGloss ? { gridTemplateColumns: "40px 1.1fr 1.2fr 24px" } : null;

  return (
    <div id={`seg-${seg.id}`} className={`seg-row ${focused ? "active" : ""} ${seg.flagged ? "flagged" : ""}`} style={gridStyle}>
      <div className="seg-num">
        <div>{String(idx + 1).padStart(2, "0")}</div>
        <div style={{ marginTop: 4 }}>
          <button ref={langBtnRef} className="iconbtn" style={{ width: 22, height: 22 }} onClick={() => onLangClick(langBtnRef.current)} title="Forcer la langue">
            <Badge color={LANG_BADGE[seg.lang].color} dot style={{ height: 16, fontSize: 9, padding: "0 5px" }}>{LANG_BADGE[seg.lang].label}</Badge>
          </button>
        </div>
        {seg.confidence < 0.95 && (
          <div className="tiny" style={{ color: "var(--yellow-9)", marginTop: 4 }} title="Confiance de détection">
            {Math.round(seg.confidence * 100)}%
          </div>
        )}
      </div>

      {/* Column A */}
      <div className="cell cell-A">
        {seg.isAnnotation ? <span className="muted" style={{ fontFamily: "var(--font-cjk-sans)", fontSize: 14 }}>{seg.src}</span> :
          renderSourceWithTerms(seg.src, window.GLOSSARY, onTermClick, onTermHover, onTermLeave)}
      </div>

      {/* Column B */}
      {showGloss && (
        isEditing("gloss") ? (
          <div className="cell cell-B cell-editing">
            <textarea
              autoFocus
              className="cell-edit-textarea"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={onCellCommit}
              onKeyDown={(e) => {
                if (e.key === "Escape") onCellCancel();
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onCellCommit();
              }}
              rows={Math.max(2, Math.ceil(editValue.length / 20))}
            />
          </div>
        ) : (
          <div className="cell cell-B" onClick={() => onCellClick(seg.id, "gloss", seg.gloss)}>{seg.gloss}</div>
        )
      )}

      {/* Column C */}
      {isEditing("fr") ? (
        <div className="cell cell-C cell-editing">
          <textarea
            autoFocus
            className="cell-edit-textarea"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={onCellCommit}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCellCancel();
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onCellCommit();
            }}
            rows={Math.max(2, Math.ceil(editValue.length / 30))}
          />
        </div>
      ) : (
        <div className="cell cell-C" onClick={() => onCellClick(seg.id, "fr", seg.fr)}>
          {renderFrenchWithTerms(seg.fr, seg, window.GLOSSARY, onTermClick)}
        </div>
      )}

      {/* Actions */}
      <div className="seg-actions" style={{ flexDirection: "column", gap: 2 }}>
        <button ref={moreBtnRef} className={`iconbtn ${seg.flagged ? "active" : ""}`} onClick={onFlag} title="Marquer pour relecture">
          <Icon name="flag" size={13} />
        </button>
        <button className="iconbtn" onClick={() => onMore(moreBtnRef.current)} title="Actions">
          <Icon name="morev" size={14} />
        </button>
      </div>
    </div>
  );
};

window.Workspace = Workspace;
