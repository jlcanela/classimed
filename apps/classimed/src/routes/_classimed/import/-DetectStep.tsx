import type { SegmentationLine } from "./-atoms";

type DetectStepProps = {
  lines: SegmentationLine[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
};

export function DetectStep(props: DetectStepProps) {
  const { lines, isLoading, isSubmitting, error, onBack, onSubmit } = props;

  if (isLoading) {
    return (
      <div className="paper" style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
        <div className="ws-margin-h">Segmentation et detection</div>
        <p className="muted" style={{ marginTop: 8 }}>
          Detection des segments en cours...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="ws-margin-h">Segmentation et detection de langue</div>
      <p className="muted tiny" style={{ marginTop: 4 }}>
        Chaque segment est etiquete automatiquement. Vous pouvez corriger une etiquette en cliquant dessus.
      </p>

      <div className="paper" style={{ padding: 14, marginTop: 14 }}>
        {lines.map((line, index) => (
          <div key={`${line.txt}-${index}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--gray-2)" }}>
            <span className="mono tiny muted" style={{ width: 22 }}>{String(index + 1).padStart(2, "0")}</span>
            <span className={`badge ${line.lang === "classical" ? "badge-teal" : "badge-gray"}`}>
              {line.lang === "classical" ? "Classique" : "Moderne"}
            </span>
            <span style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 17, flex: 1 }}>{line.txt}</span>
            <span className="tiny muted">{Math.round(line.conf * 100)}%</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="tiny" style={{ color: "var(--red-7)", marginTop: 10 }}>
          Erreur: {error}
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
        <button className="btn btn-subtle" onClick={onBack} disabled={isSubmitting}>Revenir a l'OCR</button>
        <button className="btn btn-filled" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Import en cours..." : "Lancer la traduction"}
        </button>
      </div>
    </div>
  );
}
