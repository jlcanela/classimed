// Library, Ingest, Export screens
const { useState: lUseState } = React;

const Library = ({ state, setState }) => {
  const [view, setView] = lUseState("grid");
  const [query, setQuery] = lUseState("");
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Bibliothèque</h1>
          <p>{window.DOCUMENTS.length} documents · classiques de la médecine chinoise</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="default" size="sm" leftIcon={<Icon name="upload" size={14}/>} onClick={() => setState(s => ({...s, view: "ingest"}))}>Importer</Button>
          <Button variant="filled" size="sm" leftIcon={<Icon name="add" size={14}/>}>Nouveau document</Button>
        </div>
      </div>
      <div className="page-toolbar">
        <div style={{ width: 320 }}>
          <TextInput icon={<Icon name="search" size={14}/>} placeholder="Rechercher dans la bibliothèque…" value={query} onChange={(e) => setQuery(e.target.value)}/>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="chip active">Tous</button>
          <button className="chip">Nei Jing</button>
          <button className="chip">Shang Han</button>
          <button className="chip">Acupuncture</button>
          <button className="chip">À importer</button>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <Segmented value={view} onChange={setView} options={[
            { value: "grid", label: "Grille" }, { value: "list", label: "Liste" },
          ]}/>
        </div>
      </div>
      <div className="page-body" style={{ padding: 24 }}>
        {view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {window.DOCUMENTS.filter(d => !query || d.title.includes(query) || d.titleFr.toLowerCase().includes(query.toLowerCase())).map(d => (
              <div key={d.id} className="paper" style={{ padding: 18, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}
                onClick={() => setState(s => ({...s, activeDocId: d.id, view: "workspace"}))}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 22, fontWeight: 600, lineHeight: 1.3 }}>{d.title}</div>
                  {d.status === "queued" && <Badge color="gray">à importer</Badge>}
                  {d.flagged > 0 && <Badge color="yellow">{d.flagged} ⚑</Badge>}
                </div>
                <div className="muted" style={{ fontSize: 13, fontFamily: "var(--font-french)" }}>{d.titleFr}</div>
                <div className="tiny muted">{d.period}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {d.tags.map(t => <Badge key={t} color="gray" style={{ textTransform: "none", fontWeight: 500 }}>{t}</Badge>)}
                </div>
                <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--gray-2)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <div className="muted">{d.segments || "—"} segments · {d.pages} p.</div>
                  <div className="muted">{d.updated}</div>
                </div>
                {d.segments > 0 && (
                  <div className="doc-progress"><div style={{ width: `${(d.done / d.segments) * 100}%` }}></div></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Titre</th><th>Titre français</th><th>Période</th><th>Segments</th><th>Avancement</th><th>Mise à jour</th><th></th></tr></thead>
            <tbody>
              {window.DOCUMENTS.map(d => (
                <tr key={d.id} onClick={() => setState(s => ({...s, activeDocId: d.id, view: "workspace"}))}>
                  <td style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 16, fontWeight: 600 }}>{d.title}</td>
                  <td>{d.titleFr}</td>
                  <td className="muted">{d.period}</td>
                  <td>{d.segments || "—"}</td>
                  <td>
                    {d.segments > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="doc-progress" style={{ width: 80 }}><div style={{ width: `${(d.done / d.segments) * 100}%` }}></div></div>
                        <span className="tiny muted">{d.done}/{d.segments}</span>
                      </div>
                    ) : <Badge color="gray">À importer</Badge>}
                  </td>
                  <td className="muted">{d.updated}</td>
                  <td><IconButton><Icon name="morev" size={14}/></IconButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Ingest = ({ state, setState }) => {
  const [mode, setMode] = lUseState("scan");
  const [step, setStep] = lUseState(2); // 1 source, 2 review OCR, 3 detect
  const [pasted, setPasted] = lUseState("");
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Importer un document</h1>
          <p>Coller un texte, déposer un PDF ou scanner une page</p>
        </div>
      </div>
      <div className="page-toolbar" style={{ justifyContent: "center" }}>
        <div className="stepper">
          <div className={`step ${step >= 1 ? "done" : ""}`}><div className="step-num">{step > 1 ? <Icon name="check" size={12}/> : "1"}</div><span>Source</span></div>
          <div className="step-line"></div>
          <div className={`step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}><div className="step-num">{step > 2 ? <Icon name="check" size={12}/> : "2"}</div><span>Relecture OCR</span></div>
          <div className="step-line"></div>
          <div className={`step ${step === 3 ? "active" : ""}`}><div className="step-num">3</div><span>Détection &amp; segmentation</span></div>
        </div>
      </div>
      <div className="page-body" style={{ padding: 24 }}>
        {step === 1 && (
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <Segmented value={mode} onChange={setMode} options={[
              { value: "paste", label: "Coller le texte" },
              { value: "pdf", label: "PDF (sélectionnable)" },
              { value: "scan", label: "Image / page scannée" },
            ]}/>
            <div style={{ marginTop: 20 }}>
              {mode === "paste" && (
                <Textarea label="Texte à importer" minRows={10}
                  placeholder="昔在黃帝，生而神靈…"
                  value={pasted} onChange={(e) => setPasted(e.target.value)}/>
              )}
              {mode === "pdf" && (
                <div className="scan-placeholder" style={{ height: 260, fontSize: 13 }}>
                  <div style={{ textAlign: "center" }}>
                    <Icon name="upload" size={28} color="var(--gray-5)"/>
                    <div style={{ marginTop: 10 }}>Déposez un PDF ici ou cliquez pour parcourir</div>
                    <div className="muted tiny" style={{ marginTop: 4 }}>Texte sélectionnable extrait automatiquement</div>
                  </div>
                </div>
              )}
              {mode === "scan" && (
                <div className="scan-placeholder" style={{ height: 260, fontSize: 13 }}>
                  <div style={{ textAlign: "center" }}>
                    <Icon name="scan" size={28} color="var(--gray-5)"/>
                    <div style={{ marginTop: 10 }}>Déposez une image (.jpg .png .tif) ou activez la caméra</div>
                    <div className="muted tiny" style={{ marginTop: 4 }}>OCR optimisé pour caractères chinois traditionnels et simplifiés</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="subtle">Annuler</Button>
              <Button variant="filled" onClick={() => setStep(2)} rightIcon={<Icon name="chevR" size={14}/>}>Continuer</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
            <div>
              <div className="ws-margin-h">Page source</div>
              <div className="scan-placeholder" style={{ height: 460, padding: 20, alignItems: "flex-start", justifyContent: "flex-start", flexDirection: "column", gap: 16 }}>
                <div style={{ writingMode: "vertical-rl", fontFamily: "var(--font-cjk-serif)", fontSize: 22, color: "var(--gray-8)", lineHeight: 2.2, opacity: 0.7 }}>
                  上古天真論篇第一　昔在黃帝　生而神靈　弱而能言　幼而徇齊
                </div>
                <div className="tiny muted" style={{ position: "absolute" }}></div>
              </div>
              <div className="tiny muted" style={{ marginTop: 8 }}>scan-黃帝內經-001.tif · 1240×1680px</div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div className="ws-margin-h">Texte reconnu</div>
                <div className="tiny muted">confiance OCR globale <strong style={{ color: "var(--teal-7)" }}>96%</strong></div>
              </div>
              <div className="paper" style={{ padding: 14 }}>
                {[
                  { txt: "上古天真論篇第一", conf: 0.99 },
                  { txt: "昔在黃帝", conf: 0.99 },
                  { txt: "生而神靈", conf: 0.98 },
                  { txt: "弱而能言", conf: 0.99 },
                  { txt: "幼而徇齊", conf: 0.82, alt: "幼而循齊" },
                  { txt: "長而敦敏", conf: 0.97 },
                  { txt: "成而登天", conf: 0.99 },
                ].map((line, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--gray-2)" }}>
                    <span className="mono tiny muted" style={{ width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 18, flex: 1 }}>{line.txt}</span>
                    {line.alt && (
                      <Badge color="yellow">à vérifier</Badge>
                    )}
                    <div className={`conf-bar ${line.conf < 0.85 ? "low" : ""}`}><div style={{ width: `${line.conf * 100}%` }}></div></div>
                    <span className="tiny muted" style={{ width: 30 }}>{Math.round(line.conf * 100)}%</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
                <Button variant="subtle" leftIcon={<Icon name="chevL" size={14}/>} onClick={() => setStep(1)}>Revenir</Button>
                <Button variant="filled" rightIcon={<Icon name="chevR" size={14}/>} onClick={() => setStep(3)}>Confirmer et segmenter</Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div className="ws-margin-h">Segmentation et détection de langue</div>
            <p className="muted tiny" style={{ marginTop: 4 }}>Chaque segment est étiqueté automatiquement. Vous pouvez corriger une étiquette en cliquant dessus.</p>
            <div className="paper" style={{ padding: 14, marginTop: 14 }}>
              {[
                { txt: "上古天真論篇第一", lang: "classical", conf: 0.99 },
                { txt: "昔在黃帝，生而神靈，弱而能言。", lang: "classical", conf: 0.99 },
                { txt: "幼而徇齊，長而敦敏，成而登天。", lang: "classical", conf: 0.98 },
                { txt: "（编注：以下为帝问岐伯之始。）", lang: "modern", conf: 0.86 },
                { txt: "乃問於天師曰：余聞上古之人…", lang: "classical", conf: 0.97 },
              ].map((line, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--gray-2)" }}>
                  <span className="mono tiny muted" style={{ width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                  <Badge color={LANG_BADGE[line.lang].color} dot>{LANG_BADGE[line.lang].label}</Badge>
                  <span style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 17, flex: 1 }}>{line.txt}</span>
                  <span className="tiny muted">{Math.round(line.conf * 100)}%</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
              <Button variant="subtle" leftIcon={<Icon name="chevL" size={14}/>} onClick={() => setStep(2)}>Revenir à l'OCR</Button>
              <Button variant="filled" leftIcon={<Icon name="ai" size={14}/>} onClick={() => setState(s => ({ ...s, view: "workspace", toast: { msg: "Document importé — traduction en cours…", icon: <Icon name="check" size={14}/> } }))}>Lancer la traduction</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Export = ({ state, setState }) => {
  const [format, setFormat] = lUseState("docx");
  const [cols, setCols] = lUseState({ A: true, B: false, C: true, notes: true });
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Exporter</h1>
          <p>Produire un document bilingue prêt à partager ou à publier</p>
        </div>
      </div>
      <div className="page-body" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, padding: 24 }}>
        <div className="paper" style={{ padding: 18, height: "fit-content" }}>
          <div className="ws-margin-h">Format</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { v: "docx", l: ".docx", icon: <Icon name="doc" size={14}/> },
              { v: "pdf", l: ".pdf", icon: <Icon name="doc" size={14}/> },
              { v: "html", l: ".html", icon: <Icon name="doc" size={14}/> },
              { v: "txt", l: ".txt aligné", icon: <Icon name="doc" size={14}/> },
            ].map(o => (
              <button key={o.v} className={`chip ${format === o.v ? "active" : ""}`}
                style={{ height: 36, justifyContent: "center" }}
                onClick={() => setFormat(o.v)}>{o.icon}{o.l}</button>
            ))}
          </div>

          <div className="ws-margin-h" style={{ marginTop: 20 }}>Colonnes incluses</div>
          {[
            { k: "A", l: "Source 文言", sub: "Texte classique" },
            { k: "B", l: "Glose moderne 白話", sub: "Paraphrase chinoise moderne" },
            { k: "C", l: "Traduction française", sub: "Sortie principale" },
            { k: "notes", l: "Notes de la marge", sub: "Vos annotations" },
          ].map(c => (
            <label key={c.k} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", cursor: "pointer" }}>
              <input type="checkbox" checked={cols[c.k]} onChange={(e) => setCols(s => ({...s, [c.k]: e.target.checked}))} style={{ marginTop: 3 }}/>
              <div><div style={{ fontWeight: 500 }}>{c.l}</div><div className="tiny muted">{c.sub}</div></div>
            </label>
          ))}

          <div className="ws-margin-h" style={{ marginTop: 20 }}>Disposition</div>
          <Segmented value="parallel" onChange={() => {}} options={[
            { value: "parallel", label: "Parallèle" },
            { value: "interlinear", label: "Interlinéaire" },
            { value: "facing", label: "Pages en regard" },
          ]}/>

          <div className="ws-margin-h" style={{ marginTop: 20 }}>Options</div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer" }}>
            <input type="checkbox" defaultChecked/> <span>Inclure le glossaire en annexe</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer" }}>
            <input type="checkbox" defaultChecked/> <span>Numéroter les segments</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer" }}>
            <input type="checkbox"/> <span>Inclure les segments marqués pour relecture</span>
          </label>

          <Button variant="filled" size="lg" style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
            leftIcon={<Icon name="download" size={16}/>}
            onClick={() => setState(s => ({ ...s, toast: { msg: `Export ${format.toUpperCase()} généré`, icon: <Icon name="check" size={14}/> } }))}>
            Exporter
          </Button>
        </div>

        <div>
          <div className="ws-margin-h">Aperçu</div>
          <div className="paper" style={{ padding: "40px 60px", minHeight: 600, marginTop: 10, fontFamily: "var(--font-french)", lineHeight: 1.7 }}>
            <div style={{ borderBottom: "1px solid var(--gray-3)", paddingBottom: 12, marginBottom: 24 }}>
              <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 22, fontWeight: 600 }}>黃帝內經・素問・上古天真論</div>
              <div className="muted" style={{ marginTop: 4 }}>Huang Di Nei Jing — Su Wen, chapitre 1. Traduction de l'auteur, mai 2026.</div>
            </div>
            {state.segments.slice(0, 4).map((seg, i) => (
              <div key={seg.id} style={{ display: "grid", gridTemplateColumns: cols.B ? "1fr 1fr 1fr" : "1fr 1fr", gap: 32, marginBottom: 20, alignItems: "baseline" }}>
                {cols.A && <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 17, color: "var(--gray-9)" }}><span className="mono tiny muted" style={{ marginRight: 8 }}>{i + 1}</span>{seg.src}</div>}
                {cols.B && <div style={{ fontFamily: "var(--font-cjk-sans)", fontSize: 13, color: "var(--gray-7)" }}>{seg.gloss}</div>}
                {cols.C && <div style={{ fontFamily: "var(--font-french)", fontSize: 14, color: "var(--gray-9)" }}>{seg.fr}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Library = Library;
window.Ingest = Ingest;
window.Export = Export;
