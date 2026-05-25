// Main app shell
const { useState: aUseState, useEffect: aUseEffect } = React;

const App = () => {
  const [state, setState] = aUseState(() => ({
    view: "workspace",
    activeDocId: "suwen-01",
    focusedSegId: "s5",
    segments: window.SEGMENTS,
    pinnedTerm: null,
    glossaryPanelOpen: false,
    promoteOpen: false,
    toast: null,
  }));

  aUseEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => setState(s => ({ ...s, toast: null })), 2400);
      return () => clearTimeout(t);
    }
  }, [state.toast]);

  const navItems = [
    { id: "workspace", label: "Espace de lecture", icon: <Icon name="book" size={15}/>, count: state.segments.length },
    { id: "glossary", label: "Glossaire", icon: <Icon name="glyph" size={15}/>, count: window.GLOSSARY.length },
    { id: "library", label: "Bibliothèque", icon: <Icon name="books" size={15}/>, count: window.DOCUMENTS.length },
    { id: "ingest", label: "Importer", icon: <Icon name="upload" size={15}/> },
    { id: "export", label: "Exporter", icon: <Icon name="download" size={15}/> },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 4, background: "var(--gray-9)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cjk-serif)", fontSize: 16, fontWeight: 700 }}>古</div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <strong style={{ fontSize: 14 }}>ClassiMed Translate</strong>
            <span className="tiny muted" style={{ fontFamily: "var(--font-cjk-serif)" }}>古醫文譯</span>
          </div>
        </div>
        <div className="divider-v" style={{ height: 28, marginLeft: 4 }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.slice(0, 3).map(n => (
            <button key={n.id} className={`navlink ${state.view === n.id ? "active" : ""}`}
              style={{ width: "auto", padding: "6px 12px" }}
              onClick={() => setState(s => ({ ...s, view: n.id }))}>
              {n.icon}{n.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 280 }}>
            <TextInput icon={<Icon name="search" size={14}/>} placeholder="Rechercher dans le corpus…  ⌘K" value="" onChange={() => {}}/>
          </div>
          <IconButton title="Importer"><Icon name="upload" size={15}/></IconButton>
          <IconButton title="Exporter"><Icon name="download" size={15}/></IconButton>
          <div className="divider-v" style={{ height: 24 }}></div>
          <div className="avatar">CR</div>
        </div>
      </header>

      <div className="app-main">
        <aside className="app-nav">
          <div className="nav-section">Navigation</div>
          {navItems.map(n => (
            <button key={n.id} className={`navlink ${state.view === n.id ? "active" : ""}`}
              onClick={() => setState(s => ({ ...s, view: n.id }))}>
              {n.icon}<span>{n.label}</span>
              {n.count != null && <span className="count">{n.count}</span>}
            </button>
          ))}

          <div className="nav-section" style={{ marginTop: 16 }}>Documents récents</div>
          {window.DOCUMENTS.filter(d => d.segments > 0).slice(0, 4).map(d => (
            <button key={d.id} className={`navlink ${state.view === "workspace" && state.activeDocId === d.id ? "active" : ""}`}
              onClick={() => setState(s => ({ ...s, view: "workspace", activeDocId: d.id }))}
              title={d.titleFr}>
              <Icon name="doc" size={14}/>
              <span style={{ fontFamily: "var(--font-cjk-serif)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title.split("・").slice(-1)[0]}</span>
              {d.flagged > 0 && <Badge color="yellow" style={{ height: 16, padding: "0 5px", fontSize: 9 }}>{d.flagged}</Badge>}
            </button>
          ))}

          <div style={{ marginTop: "auto", padding: "8px 10px" }}>
            <div className="paper" style={{ padding: 12, background: "var(--gray-1)", border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="ai" size={13} color="var(--gray-7)"/>
                <span className="tiny" style={{ fontWeight: 600 }}>Traduction par étapes</span>
              </div>
              <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                文言 → 白話 → français.<br/>Préservez vos conventions terminologiques.
              </div>
            </div>
          </div>
        </aside>

        <main className="app-content">
          {state.view === "workspace" && <Workspace state={state} setState={setState}/>}
          {state.view === "glossary" && <Glossary state={state} setState={setState}/>}
          {state.view === "library" && <Library state={state} setState={setState}/>}
          {state.view === "ingest" && <Ingest state={state} setState={setState}/>}
          {state.view === "export" && <Export state={state} setState={setState}/>}
        </main>
      </div>

      {/* Glossary panel (slide-in) */}
      {state.glossaryPanelOpen && (
        <GlossaryPanel
          term={state.pinnedTerm}
          onClose={() => setState(s => ({ ...s, glossaryPanelOpen: false }))}
          setState={setState}
        />
      )}

      {/* Promote-term modal */}
      {state.promoteOpen && (
        <Modal title="Promouvoir un terme au glossaire" onClose={() => setState(s => ({ ...s, promoteOpen: false }))} width={560}
          footer={
            <>
              <Button variant="subtle" onClick={() => setState(s => ({ ...s, promoteOpen: false }))}>Annuler</Button>
              <Button variant="filled" leftIcon={<Icon name="check" size={14}/>} onClick={() => setState(s => ({
                ...s, promoteOpen: false,
                toast: { msg: "Terme ajouté au glossaire", icon: <Icon name="bookmark" size={14}/> }
              }))}>Ajouter au glossaire</Button>
            </>
          }>
          <p className="tiny muted">Les champs sont pré-remplis à partir du segment courant. Vous pouvez tout modifier.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <TextInput label="Caractères" value="形與神俱" onChange={() => {}}/>
            <TextInput label="Pinyin" value="xíng yǔ shén jù" onChange={() => {}}/>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="input-label">Catégorie</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {window.CATEGORIES.map(c => (
                <button key={c.id} className={`chip ${c.id === "concept" ? "active" : ""}`}>{c.label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <TextInput label="Traduction principale" value="la forme et les esprits ensemble" onChange={() => {}}/>
          </div>
          <div style={{ marginTop: 12 }}>
            <Textarea label="Note" minRows={3} value="Expression centrale du Su Wen ch.1 — l'union du corps et de l'animation vitale comme condition de longévité." onChange={() => {}}/>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {state.toast && <Toast message={state.toast.msg} icon={state.toast.icon} onDone={() => setState(s => ({...s, toast: null}))}/>}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
