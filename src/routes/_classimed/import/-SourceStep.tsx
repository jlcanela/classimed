import type { ImportMode } from "./-atoms";

type SourceStepProps = {
  mode: ImportMode;
  pastedText: string;
  documentTitle: string;
  documentTitleFr: string;
  documentPeriod: string;
  documentType: string;
  documentTagsText: string;
  documentPages: number;
  documentActive: boolean;
  error: string | null;
  isLoading: boolean;
  onModeChange: (mode: ImportMode) => void;
  onPastedTextChange: (value: string) => void;
  onMetadataChange: (patch: {
    documentTitle?: string;
    documentTitleFr?: string;
    documentPeriod?: string;
    documentType?: string;
    documentTagsText?: string;
    documentPages?: number;
    documentActive?: boolean;
  }) => void;
  onContinue: () => void;
};

export function SourceStep(props: SourceStepProps) {
  const {
    mode,
    pastedText,
    documentTitle,
    documentTitleFr,
    documentPeriod,
    documentType,
    documentTagsText,
    documentPages,
    documentActive,
    error,
    isLoading,
    onModeChange,
    onPastedTextChange,
    onMetadataChange,
    onContinue,
  } = props;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button className={`chip ${mode === "paste" ? "active" : ""}`} onClick={() => onModeChange("paste")}>Coller le texte</button>
        <button className={`chip ${mode === "pdf" ? "active" : ""}`} disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>PDF</button>
        <button className={`chip ${mode === "scan" ? "active" : ""}`} disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Image scannee</button>
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {mode === "paste" && (
          <div>
            <label className="ws-margin-h" style={{ display: "block" }}>Texte a importer</label>
            <textarea
              className="input"
              rows={10}
              placeholder="昔在黃帝，生而神靈…"
              value={pastedText}
              onChange={(event) => onPastedTextChange(event.target.value)}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>
        )}

        <div>
          <div className="paper" style={{ padding: 18 }}>
            <div className="ws-margin-h">Metadonnees du document</div>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <label className="tiny muted" style={{ display: "grid", gap: 4 }}>
                Titre source
                <input
                  className="input"
                  value={documentTitle}
                  onChange={(event) => onMetadataChange({ documentTitle: event.target.value })}
                  placeholder="黃帝內經・素問・上古天真論"
                />
              </label>
              <label className="tiny muted" style={{ display: "grid", gap: 4 }}>
                Titre français
                <input
                  className="input"
                  value={documentTitleFr}
                  onChange={(event) => onMetadataChange({ documentTitleFr: event.target.value })}
                  placeholder="Huang Di Nei Jing — Su Wen, chapitre 1"
                />
              </label>
              <label className="tiny muted" style={{ display: "grid", gap: 4 }}>
                Période
                <input
                  className="input"
                  value={documentPeriod}
                  onChange={(event) => onMetadataChange({ documentPeriod: event.target.value })}
                  placeholder="Han occidentaux (~100 av. J.-C.)"
                />
              </label>
              <label className="tiny muted" style={{ display: "grid", gap: 4 }}>
                Type
                <select
                  className="input"
                  value={documentType}
                  onChange={(event) => onMetadataChange({ documentType: event.target.value })}
                >
                  <option value="canon">canon</option>
                  <option value="commentary">commentary</option>
                  <option value="manuscript">manuscript</option>
                  <option value="other">other</option>
                </select>
              </label>
              <label className="tiny muted" style={{ display: "grid", gap: 4 }}>
                Tags, séparés par des virgules
                <input
                  className="input"
                  value={documentTagsText}
                  onChange={(event) => onMetadataChange({ documentTagsText: event.target.value })}
                  placeholder="Nei Jing, philosophie, longévité"
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="tiny muted" style={{ display: "grid", gap: 4 }}>
                  Pages
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={documentPages}
                    onChange={(event) => onMetadataChange({ documentPages: event.currentTarget.value === "" ? 0 : Number(event.currentTarget.value) })}
                  />
                </label>
                <label className="tiny muted" style={{ display: "grid", gap: 4, alignContent: "start" }}>
                  &nbsp;
                  <span style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10 }}>
                    <input
                      type="checkbox"
                      checked={documentActive}
                      onChange={(event) => onMetadataChange({ documentActive: event.currentTarget.checked })}
                    />
                    Document actif
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="scan-placeholder" style={{ height: 260, fontSize: 13, marginTop: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div>Deposez un PDF ici ou cliquez pour parcourir</div>
              <div className="muted tiny" style={{ marginTop: 4 }}>
                Texte selectionnable extrait automatiquement
              </div>
            </div>
          </div>

          <div className="scan-placeholder" style={{ height: 260, fontSize: 13, marginTop: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div>Deposez une image (.jpg .png .tif) ou activez la camera</div>
              <div className="muted tiny" style={{ marginTop: 4 }}>
                OCR optimise pour caracteres chinois traditionnels et simplifies
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="tiny" style={{ color: "var(--red-7)", marginTop: 10 }}>
          Erreur: {error}
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button className="btn btn-filled" onClick={onContinue} disabled={isLoading}>
          {isLoading ? "Analyse OCR..." : "Continuer"}
        </button>
      </div>
    </div>
  );
}
