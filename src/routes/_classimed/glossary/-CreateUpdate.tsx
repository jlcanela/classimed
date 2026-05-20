import { IconPlus, IconXMark } from '@tabler/icons-react';
import { Badge, Button, Modal, Textarea, TextInput } from '@mantine/core';

interface CreateUpdateModalProps {
  editing: any; // Replace with proper type from your schema
  categories: any[]; // Replace with proper type
  onClose: () => void;
}

export function CreateUpdateModal({ editing, categories, onClose }: CreateUpdateModalProps) {
  if (!editing) return null;

  return (
    <Modal
      title="Modifier le terme"
      onClose={onClose}
      size="lg"
      opened={true}
    >
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ textAlign: "center", padding: "12px 0", background: "var(--gray-0)", borderRadius: 4 }}>
          <div className="gloss-char" style={{ fontSize: 56 }}>{editing.char}</div>
          <div className="gloss-pinyin" style={{ marginTop: 6 }}>{editing.pinyin}</div>
        </div>
        <TextInput label="Pinyin" value={editing.pinyin} onChange={() => {}}/>
        <div>
          <label className="input-label">Catégorie</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {categories.map(c => (
              <button key={c.id} className={`chip ${editing.category === c.id ? "active" : ""}`}>{c.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <TextInput label="Traduction principale (FR)" value={editing.frPrimary} onChange={() => {}}/>
      </div>
      <div style={{ marginTop: 16 }}>
        <label className="input-label">Variantes contextuelles</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {editing.fr.map((f: any) => (
            <Badge key={f} color="blue" style={{ height: 24, fontSize: 12, textTransform: "none" }}>{f} <IconXMark size={10}/></Badge>
          ))}
          <Button variant="subtle" size="xs" leftSection={<IconPlus size={12}/>}>Ajouter</Button>
        </div>
      </div>
      {editing.refs && (
        <div style={{ marginTop: 16 }}>
          <label className="input-label">Traductions de référence</label>
          <table className="table">
            <tbody>
              {Object.entries(editing.refs as Record<string, any>).map(([author, t]: [string, any]) => (
                <tr key={author}><td style={{ width: 120, fontWeight: 600 }}>{author}</td><td className="gloss-fr">{t}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <Textarea label="Notes" value={editing.note} onChange={() => {}} minRows={4}/>
      </div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="subtle" onClick={onClose}>Annuler</Button>
        <Button variant="filled" onClick={onClose}>Enregistrer</Button>
      </div>
    </Modal>
  );
}
