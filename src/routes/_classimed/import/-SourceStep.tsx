import type { ImportMode } from "./-atoms";

type SourceStepProps = {
  mode: ImportMode;
  pastedText: string;
  error: string | null;
  isLoading: boolean;
  onModeChange: (mode: ImportMode) => void;
  onPastedTextChange: (value: string) => void;
  onContinue: () => void;
};

export function SourceStep(props: SourceStepProps) {
  const { mode, pastedText, error, isLoading, onModeChange, onPastedTextChange, onContinue } = props;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button className={`chip ${mode === "paste" ? "active" : ""}`} onClick={() => onModeChange("paste")}>Coller le texte</button>
        <button className={`chip ${mode === "pdf" ? "active" : ""}`} disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>PDF</button>
        <button className={`chip ${mode === "scan" ? "active" : ""}`} disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Image scannee</button>
      </div>

      <div style={{ marginTop: 20 }}>
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

        {mode === "pdf" && (
          <div className="scan-placeholder" style={{ height: 260, fontSize: 13 }}>
            <div style={{ textAlign: "center" }}>
              <div>Deposez un PDF ici ou cliquez pour parcourir</div>
              <div className="muted tiny" style={{ marginTop: 4 }}>
                Texte selectionnable extrait automatiquement
              </div>
            </div>
          </div>
        )}

        {mode === "scan" && (
          <div className="scan-placeholder" style={{ height: 260, fontSize: 13 }}>
            <div style={{ textAlign: "center" }}>
              <div>Deposez une image (.jpg .png .tif) ou activez la camera</div>
              <div className="muted tiny" style={{ marginTop: 4 }}>
                OCR optimise pour caracteres chinois traditionnels et simplifies
              </div>
            </div>
          </div>
        )}
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
