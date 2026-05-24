import type { OcrLine } from "./-atoms";

type ReviewStepProps = {
  sourceLabel: string;
  sourcePreview: string;
  confidence: number;
  lines: OcrLine[];
  isLoading: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function ReviewStep(props: ReviewStepProps) {
  const { sourceLabel, sourcePreview, confidence, lines, isLoading, onBack, onConfirm } = props;

  if (isLoading) {
    return (
      <div className="paper" style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
        <div className="ws-margin-h">Relecture OCR</div>
        <p className="muted" style={{ marginTop: 8 }}>
          OCR en cours...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div>
        <div className="ws-margin-h">Page source</div>
        <div className="scan-placeholder" style={{ height: 460, padding: 20, alignItems: "flex-start", justifyContent: "flex-start" }}>
          <div style={{ writingMode: "vertical-rl", fontFamily: "var(--font-cjk-serif)", fontSize: 22, color: "var(--gray-8)", lineHeight: 2.2, opacity: 0.7 }}>
            {sourcePreview || "Apercu indisponible"}
          </div>
        </div>
        <div className="tiny muted" style={{ marginTop: 8 }}>{sourceLabel || "source-inconnue"}</div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div className="ws-margin-h">Texte reconnu</div>
          <div className="tiny muted">
            confiance OCR globale <strong style={{ color: "var(--teal-7)" }}>{Math.round(confidence * 100)}%</strong>
          </div>
        </div>

        <div className="paper" style={{ padding: 14 }}>
          {lines.map((line, index) => (
            <div key={`${line.txt}-${index}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--gray-2)" }}>
              <span className="mono tiny muted" style={{ width: 22 }}>{String(index + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 18, flex: 1 }}>{line.txt}</span>
              {line.alt && <span className="badge badge-yellow">a verifier</span>}
              <div className={`conf-bar ${line.conf < 0.85 ? "low" : ""}`}><div style={{ width: `${line.conf * 100}%` }}></div></div>
              <span className="tiny muted" style={{ width: 30 }}>{Math.round(line.conf * 100)}%</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
          <button className="btn btn-subtle" onClick={onBack}>Revenir</button>
          <button className="btn btn-filled" onClick={onConfirm}>Confirmer et segmenter</button>
        </div>
      </div>
    </div>
  );
}
