import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_classimed/glossary')({
  component: Glossary,
})

interface GlossaryEntry {
  id: string;
  char: string;
  pinyin: string;
  category: string;
  frPrimary: string;
  fr: string[];
  note: string;
}

interface Category {
  id: string;
  label: string;
  color: string;
}

// Mock data - replace with actual data source
const CATEGORIES: Category[] = [
  { id: 'medicine', label: 'Médecine', color: '#ff6b6b' },
  { id: 'anatomy', label: 'Anatomie', color: '#4ecdc4' },
  { id: 'treatment', label: 'Traitement', color: '#45b7d1' },
];

const GLOSSARY: GlossaryEntry[] = [
  {
    id: '1',
    char: '脉',
    pinyin: 'mài',
    category: 'medicine',
    frPrimary: 'pouls',
    fr: ['pouls', 'artère'],
    note: 'Le concept clé de la médecine chinoise',
  },
];

function Glossary() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [editing, setEditing] = useState<GlossaryEntry | null>(null);

  const catColorMap = Object.fromEntries(CATEGORIES.map(c => [c.id, c.color]));

  const filtered = useMemo(() => GLOSSARY.filter(t => {
    if (cat !== 'all' && t.category !== cat) return false;
    if (query) {
      const q = query.toLowerCase();
      return t.char.includes(query) || t.pinyin.toLowerCase().includes(q) || t.fr.some(f => f.toLowerCase().includes(q));
    }
    return true;
  }), [query, cat]);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1>Glossaire</h1>
          <p>{GLOSSARY.length} termes · enrichi au fil de la lecture</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-default">Exporter CSV</button>
          <button className="btn btn-filled">Nouveau terme</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
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
            Tous <span className="muted">({GLOSSARY.length})</span>
          </button>
          {CATEGORIES.map(c => {
            const n = GLOSSARY.filter(t => t.category === c.id).length;
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
                    className="badge"
                    style={{
                      background: catColorMap[t.category] || 'var(--gray-2)',
                      color: '#fff',
                    }}
                  >
                    {CATEGORIES.find(c => c.id === t.category)?.label}
                  </span>
                </td>
                <td className="gloss-fr">
                  <div style={{ fontWeight: 600 }}>{t.frPrimary}</div>
                  {t.fr.length > 1 && <div className="tiny muted" style={{ marginTop: 2 }}>ou : {t.fr.slice(1).join(', ')}</div>}
                </td>
                <td className="tiny muted">{t.note}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{Math.floor(Math.random() * 30) + 1}</td>
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
