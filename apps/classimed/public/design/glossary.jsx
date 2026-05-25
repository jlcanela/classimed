// Glossary — full page view + side panel
const { useState: gUseState, useMemo: gUseMemo } = React;

const CAT_COLOR_G = Object.fromEntries(window.CATEGORIES.map(c => [c.id, c.color]));

const Glossary = ({ state, setState }) => {
  const [query, setQuery] = gUseState("");
  const [cat, setCat] = gUseState("all");
  const [editing, setEditing] = gUseState(null);

  const filtered = gUseMemo(() => window.GLOSSARY.filter(t => {
    if (cat !== "all" && t.category !== cat) return false;
    if (query) {
      const q = query.toLowerCase();
      return t.char.includes(query) || t.pinyin.toLowerCase().includes(q) || t.fr.some(f => f.toLowerCase().includes(q));
    }
    return true;
  }), [query, cat]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Glossaire</h1>
          <p>{window.GLOSSARY.length} termes · enrichi au fil de la lecture</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="default" size="sm" leftIcon={<Icon name="download" size={14}/>}>Exporter CSV</Button>
          <Button variant="filled" size="sm" leftIcon={<Icon name="add" size={14}/>}>Nouveau terme</Button>
        </div>
      </div>
      <div className="page-toolbar">
        <div style={{ width: 280 }}>
          <TextInput
            icon={<Icon name="search" size={14}/>}
            placeholder="Rechercher en caractères, pinyin ou français…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>Tous <span className="muted">{window.GLOSSARY.length}</span></button>
          {window.CATEGORIES.map(c => {
            const n = window.GLOSSARY.filter(t => t.category === c.id).length;
            if (!n) return null;
            return <button key={c.id} className={`chip ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>{c.label} <span className="muted">{n}</span></button>;
          })}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span className="tiny muted">Affichage</span>
          <Segmented value="table" onChange={() => {}} options={[
            { value: "table", label: "Tableau" }, { value: "cards", label: "Fiches" },
          ]}/>
        </div>
      </div>
      <div className="page-body">
        <table className="gloss-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Caractères</th>
              <th style={{ width: 110 }}>Pinyin</th>
              <th style={{ width: 110 }}>Catégorie</th>
              <th>Traduction française</th>
              <th>Notes / conventions</th>
              <th style={{ width: 100 }}>Occurrences</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} onClick={() => setEditing(t)}>
                <td><span className="gloss-char">{t.char}</span></td>
                <td className="gloss-pinyin">{t.pinyin}</td>
                <td><Badge color={CAT_COLOR_G[t.category]}>{window.CATEGORIES.find(c => c.id === t.category)?.label}</Badge></td>
                <td className="gloss-fr" style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 600 }}>{t.frPrimary}</div>
                  {t.fr.length > 1 && <div className="tiny muted" style={{ marginTop: 2 }}>ou : {t.fr.slice(1).join(", ")}</div>}
                </td>
                <td className="tiny" style={{ color: "var(--gray-7)", lineHeight: 1.5, maxWidth: 360 }}>{t.note}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 600 }}>{Math.floor(Math.random() * 30) + 1}</span>
                    <Icon name="ext" size={11} color="var(--gray-5)"/>
                  </div>
                </td>
                <td><IconButton><Icon name="morev" size={14}/></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Modifier le terme" onClose={() => setEditing(null)} width={640}
          footer={
            <>
              <Button variant="subtle" onClick={() => setEditing(null)}>Annuler</Button>
              <Button variant="filled" onClick={() => setEditing(null)}>Enregistrer</Button>
            </>
          }>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 16, alignItems: "start" }}>
            <div style={{ textAlign: "center", padding: "12px 0", background: "var(--gray-0)", borderRadius: 4 }}>
              <div className="gloss-char" style={{ fontSize: 56 }}>{editing.char}</div>
              <div className="gloss-pinyin" style={{ marginTop: 6 }}>{editing.pinyin}</div>
            </div>
            <TextInput label="Pinyin" value={editing.pinyin} onChange={() => {}}/>
            <div>
              <label className="input-label">Catégorie</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {window.CATEGORIES.map(c => (
                  <button key={c.id} className={`chip ${editing.category === c.id ? "active" : ""}`}>{c.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <TextInput label="Traduction principale (FR)" value={editing.frPrimary} onChange={() => {}}/>
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="input-label">Variantes contextuelles</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {editing.fr.map(f => (
                <Badge key={f} color="blue" style={{ height: 24, fontSize: 12, textTransform: "none" }}>{f} <Icon name="close" size={10}/></Badge>
              ))}
              <Button variant="subtle" size="xs" leftIcon={<Icon name="add" size={12}/>}>Ajouter</Button>
            </div>
          </div>
          {editing.refs && (
            <div style={{ marginTop: 16 }}>
              <label className="input-label">Traductions de référence</label>
              <table className="table">
                <tbody>
                  {Object.entries(editing.refs).map(([author, t]) => (
                    <tr key={author}><td style={{ width: 120, fontWeight: 600 }}>{author}</td><td className="gloss-fr">{t}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <Textarea label="Notes" value={editing.note} onChange={() => {}} minRows={4}/>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Slide-in panel pinned to a term (called from workspace)
const GlossaryPanel = ({ term, onClose, setState }) => {
  return (
    <Drawer title="Glossaire" onClose={onClose} width={400}>
      {!term && <div className="empty"><Icon name="info" size={24}/><h3>Aucun terme épinglé</h3><p>Cliquez un terme dans le texte source pour ouvrir sa fiche.</p></div>}
      {term && (
        <>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="gp-char">{term.char}</div>
            <div>
              <div className="gp-pinyin">{term.pinyin}</div>
              <Badge color={CAT_COLOR_G[term.category]} style={{ marginTop: 8 }}>
                {window.CATEGORIES.find(c => c.id === term.category)?.label}
              </Badge>
            </div>
          </div>

          <div className="gp-fr">{term.frPrimary}</div>
          {term.fr.length > 1 && <div className="tiny muted" style={{ marginTop: 4 }}>variantes : {term.fr.slice(1).join(" · ")}</div>}

          {term.note && (
            <div className="gp-section">
              <div className="gp-section-h">Note</div>
              <div style={{ fontSize: 13, color: "var(--gray-8)", lineHeight: 1.55 }}>{term.note}</div>
            </div>
          )}

          {term.refs && (
            <div className="gp-section">
              <div className="gp-section-h">Auteurs de référence</div>
              {Object.entries(term.refs).map(([author, t]) => (
                <div key={author} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--gray-2)" }}>
                  <span style={{ fontWeight: 500 }}>{author}</span>
                  <span className="gloss-fr">{t}</span>
                </div>
              ))}
            </div>
          )}

          <div className="gp-section">
            <div className="gp-section-h">Occurrences dans le corpus ({Math.floor(Math.random() * 30) + 5})</div>
            {[
              { doc: "Su Wen ch.1", segNum: 5, frag: "法於陰陽，和於術數" },
              { doc: "Su Wen ch.5", segNum: 3, frag: "陰陽者，天地之道也" },
              { doc: "Ling Shu ch.1", segNum: 12, frag: "順陰陽" },
              { doc: "Shang Han Lun", segNum: 23, frag: "陰陽俱緊者" },
            ].map((o, i) => (
              <div key={i} className="gp-occ">
                <div className="occ-src">…{o.frag}…</div>
                <div className="occ-meta">{o.doc} · §{o.segNum}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
            <Button variant="default" size="sm" leftIcon={<Icon name="edit" size={14}/>} style={{ flex: 1, justifyContent: "center" }}>Modifier</Button>
            <Button variant="subtle" size="sm" leftIcon={<Icon name="ext" size={14}/>} style={{ flex: 1, justifyContent: "center" }}>Page complète</Button>
          </div>
        </>
      )}
    </Drawer>
  );
};

window.Glossary = Glossary;
window.GlossaryPanel = GlossaryPanel;
