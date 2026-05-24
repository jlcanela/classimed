import { Link } from "@tanstack/react-router";
import type { FinalizeImportResult } from "./-atoms";

type CompletedStepProps = {
  result: FinalizeImportResult | null;
  onRetry: () => void;
};

export function CompletedStep(props: CompletedStepProps) {
  const { result, onRetry } = props;

  return (
    <div className="paper" style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
      <div className="ws-margin-h">Import termine</div>
      <p style={{ marginTop: 8 }}>Document importe avec succes.</p>
      <p className="muted tiny" style={{ marginTop: 6 }}>{result?.message ?? "Import termine"}</p>
      <p className="tiny muted" style={{ marginTop: 6 }}>ID document: {result?.documentId ?? "-"}</p>

      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link to="/reader" className="btn btn-filled">Ouvrir l'espace de lecture</Link>
        <Link to="/library" className="btn btn-default">Retour a la bibliotheque</Link>
        <button className="btn btn-subtle" onClick={onRetry}>Importer un autre document</button>
      </div>
    </div>
  );
}
