import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_classimed/library")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Bibliotheque</h1>
          <p>Parcourez vos documents et lancez un nouvel import.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/import" className="btn btn-filled">
            Importer un document
          </Link>
        </div>
      </div>

      <div className="page-body" style={{ padding: 24 }}>
        <div className="paper" style={{ padding: 20 }}>
          <div className="ws-margin-h">Etat de la bibliotheque</div>
          <p className="muted" style={{ marginTop: 8 }}>
            Cette vue est en cours de reconstruction. Utilisez l'assistant d'import pour demarrer un flux OCR et segmentation.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link to="/import" className="btn btn-default">
              Ouvrir l'assistant d'import
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
