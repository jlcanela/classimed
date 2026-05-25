import { Link, createFileRoute } from "@tanstack/react-router";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import {
  filteredLibraryDocumentsAtom,
  libraryDocumentsAtom,
  libraryLoadErrorAtom,
  libraryQueryAtom,
} from "./library/-atoms";

export const Route = createFileRoute("/_classimed/library")({
  component: RouteComponent,
});

function RouteComponent() {
  const documents = useAtomValue(libraryDocumentsAtom);
  const filteredDocuments = useAtomValue(filteredLibraryDocumentsAtom);
  const loadError = useAtomValue(libraryLoadErrorAtom);
  const setQuery = useAtomSet(libraryQueryAtom);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Bibliotheque</h1>
          <p>{documents.length} document(s) en bibliotheque</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/import" className="btn btn-filled">
            Importer un document
          </Link>
        </div>
      </div>


      <div className="page-body" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <input
            className="input"
            placeholder="Rechercher un document..."
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ width: 320 }}
          />
        </div>

        {loadError && (
          <div className="paper" style={{ padding: 14, marginBottom: 16 }}>
            <div className="tiny" style={{ color: "var(--red-8)" }}>
              Erreur de chargement: {loadError}
            </div>
          </div>
        )}

        {filteredDocuments.length === 0 ? (
          <div className="paper" style={{ padding: 20 }}>
            <div className="ws-margin-h">Etat de la bibliotheque</div>
            <p className="muted" style={{ marginTop: 8 }}>
              Aucun document pour l'instant. Utilisez l'assistant d'import pour creer votre premier document.
            </p>
            <div style={{ marginTop: 14 }}>
              <Link to="/import" className="btn btn-default">
                Ouvrir l'assistant d'import
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filteredDocuments.map((document) => (
              <div key={document.id} className="paper" style={{ padding: 16, display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-cjk-serif)", fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>
                    {document.title}
                  </div>
                  {document.titleFr && (
                    <div className="muted" style={{ marginTop: 4 }}>{document.titleFr}</div>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span className={`badge ${document.active ? "badge-blue" : "badge-gray"}`}>
                    {document.active ? "Actif" : "Archivé"}
                  </span>
                  <span className="badge badge-blue">{document.type}</span>
                  <span className="badge badge-gray">{document.pages} pages</span>
                </div>

                {document.period && (
                  <div className="tiny muted">Période: {document.period}</div>
                )}

                {document.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {document.tags.map((tag) => (
                      <span key={tag} className="badge badge-yellow">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="tiny muted" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <span>{document.segments} segments</span>
                  <span>{document.done} termines</span>
                  <span>{document.flagged} signales</span>
                  <span>{document.updated}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
