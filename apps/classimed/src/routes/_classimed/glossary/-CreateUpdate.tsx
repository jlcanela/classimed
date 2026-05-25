import { useEffect, useState } from 'react';
import { IconPlus, IconXMark } from '@tabler/icons-react';
import { Badge, Button, Modal, Textarea, TextInput } from '@mantine/core';
import type { Category, EditableGlossaryTerm } from './-atoms';

interface CreateUpdateModalProps {
  editing: EditableGlossaryTerm | null;
  mode: 'create' | 'update';
  categories: Category[];
  onClose: () => void;
  onSave: (term: EditableGlossaryTerm) => Promise<void> | void;
}

export function CreateUpdateModal({ editing, mode, categories, onClose, onSave }: CreateUpdateModalProps) {
  const [draft, setDraft] = useState<EditableGlossaryTerm | null>(editing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(editing);
    setIsSaving(false);
  }, [editing]);

  if (!draft) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={mode === 'create' ? 'Nouveau terme' : 'Modifier le terme'}
      onClose={onClose}
      size="lg"
      opened
    >
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ textAlign: "center", padding: "12px 0", background: "var(--gray-0)", borderRadius: 4 }}>
          <div className="gloss-char" style={{ fontSize: 56 }}>{draft.char}</div>
          <div className="gloss-pinyin" style={{ marginTop: 6 }}>{draft.pinyin}</div>
        </div>
        <TextInput
          label="Caractères"
          value={draft.char ?? ''}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setDraft((prev) => (prev ? { ...prev, char: value } : prev));
          }}
        />
        <TextInput
          label="Pinyin"
          value={draft.pinyin ?? ''}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setDraft((prev) => (prev ? { ...prev, pinyin: value } : prev));
          }}
        />
        <div>
          <label className="input-label">Catégorie</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {categories.map(c => (
              <button
                key={c.id}
                type="button"
                className={`chip ${draft.category === c.id ? "active" : ""}`}
                onClick={() => setDraft((prev) => (prev ? { ...prev, category: c.id } : prev))}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <TextInput
          label="Traduction principale (FR)"
          value={draft.frPrimary ?? ''}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setDraft((prev) => (prev ? { ...prev, frPrimary: value } : prev));
          }}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <label className="input-label">Variantes contextuelles</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(draft.fr ?? []).map((f) => (
            <Badge key={f} color="blue" style={{ height: 24, fontSize: 12, textTransform: "none" }}>{f} <IconXMark size={10}/></Badge>
          ))}
          <Button variant="subtle" size="xs" leftSection={<IconPlus size={12}/>}>Ajouter</Button>
        </div>
      </div>
      {draft.refs && (
        <div style={{ marginTop: 16 }}>
          <label className="input-label">Traductions de référence</label>
          <table className="table">
            <tbody>
              {Object.entries(draft.refs as Record<string, string>).map(([author, t]) => (
                <tr key={author}><td style={{ width: 120, fontWeight: 600 }}>{author}</td><td className="gloss-fr">{t}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <Textarea
          label="Notes"
          value={draft.note ?? ''}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setDraft((prev) => (prev ? { ...prev, note: value } : prev));
          }}
          minRows={4}
        />
      </div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="subtle" onClick={onClose}>Annuler</Button>
        <Button variant="filled" onClick={handleSave} loading={isSaving}>Enregistrer</Button>
      </div>
    </Modal>
  );
}
