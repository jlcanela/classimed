import { RegistryProvider, useAtomValue, useAtomSet } from '@effect/atom-react';
import { createFileRoute } from '@tanstack/react-router'
import {
  categoriesAtom,
  categoryAtom,
  categoryBadgeClassMapAtom,
  categoryCountsAtom,
  editingAtom,
  filteredGlossaryAtom,
  glossaryAtom,
  glossaryLoadErrorAtom,
  occurrencesByIdAtom,
  queryAtom,
} from './glossary/-atoms';

export const Route = createFileRoute('/_classimed/glossary')({
  component: Glossary,
})

function Glossary() {
  return (
    <RegistryProvider>
      <GlossaryContent />
    </RegistryProvider>
  );
}

function GlossaryContent() {
  const categories = useAtomValue(categoriesAtom);
  const glossary = useAtomValue(glossaryAtom);
  const glossaryLoadError = useAtomValue(glossaryLoadErrorAtom);
  const query = useAtomValue(queryAtom);
  const cat = useAtomValue(categoryAtom);
  const editing = useAtomValue(editingAtom);
  const filtered = useAtomValue(filteredGlossaryAtom);
  const categoryCounts = useAtomValue(categoryCountsAtom);
  const categoryBadgeClassMap = useAtomValue(categoryBadgeClassMapAtom);
  const occurrencesById = useAtomValue(occurrencesByIdAtom);
  const setQuery = useAtomSet(queryAtom);
  const setCat = useAtomSet(categoryAtom);
  const setEditing = useAtomSet(editingAtom);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1>Glossaire</h1>
          <p>{glossary.length} termes · enrichi au fil de la lecture</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-default">Exporter CSV</button>
          <button className="btn btn-filled">Nouveau terme</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
        {glossaryLoadError && (
          <div className="tiny" style={{ color: 'var(--red-8)', marginRight: 8 }}>
            Erreur de chargement du glossaire: {glossaryLoadError}
          </div>
        )}
        <input
          type="text"
          placeholder="Rechercher en caractères, pinyin ou français…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          style={{ width: 280 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setCat('all')}
            className={`chip ${cat === 'all' ? 'active' : ''}`}
          >
            Tous <span className="muted">({glossary.length})</span>
          </button>
          {categories.map(c => {
            const n = categoryCounts[c.id] ?? 0;
            if (!n) return null;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`chip ${cat === c.id ? 'active' : ''}`}
              >
                {c.label} <span className="muted">({n})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="page-body">
        <table className="gloss-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Caractères</th>
              <th style={{ width: 110 }}>Pinyin</th>
              <th style={{ width: 110 }}>Catégorie</th>
              <th>Traduction française</th>
              <th>Notes</th>
              <th style={{ width: 100 }}>Occurrences</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} onClick={() => setEditing(t)}>
                <td><span className="gloss-char">{t.char}</span></td>
                <td className="gloss-pinyin">{t.pinyin}</td>
                <td>
                  <span
                    className={`badge ${categoryBadgeClassMap[t.category] || 'badge-gray'}`}
                  >
                    {categories.find(c => c.id === t.category)?.label}
                  </span>
                </td>
                <td className="gloss-fr">
                  <div style={{ fontWeight: 600 }}>{t.frPrimary}</div>
                  {t.fr.length > 1 && <div className="tiny muted" style={{ marginTop: 2 }}>ou : {t.fr.slice(1).join(', ')}</div>}
                </td>
                <td className="tiny muted">{t.note}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{occurrencesById[t.id] ?? 1}</td>
                <td style={{ textAlign: 'center' }}>⋮</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <>
          <div className="scrim" onClick={() => setEditing(null)}></div>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Modifier le terme</h2>
              <button
                onClick={() => setEditing(null)}
                className="btn btn-icon"
                style={{ background: 'transparent', color: 'var(--gray-6)' }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 20 }}>
                <p><strong>Caractères :</strong> {editing.char}</p>
                <p><strong>Pinyin :</strong> {editing.pinyin}</p>
                <p><strong>Traduction :</strong> {editing.fr.join(', ')}</p>
                <p><strong>Notes :</strong> {editing.note}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setEditing(null)}
                className="btn btn-default"
              >
                Annuler
              </button>
              <button
                onClick={() => setEditing(null)}
                className="btn btn-filled"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
