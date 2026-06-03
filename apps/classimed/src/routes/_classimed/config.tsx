import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue, useAtomSet } from "@effect/atom-react";
import {
  llmApiUrlAtom,
  llmModelAtom,
  llmSystemPromptAtom,
  DEFAULT_LLM_API_URL,
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_SYSTEM_PROMPT,
} from "./config/-atoms";

export const Route = createFileRoute("/_classimed/config")({
  component: ConfigRoute,
});

function ConfigRoute() {
  const apiUrl = useAtomValue(llmApiUrlAtom);
  const model = useAtomValue(llmModelAtom);
  const systemPrompt = useAtomValue(llmSystemPromptAtom);

  const setApiUrl = useAtomSet(llmApiUrlAtom);
  const setModel = useAtomSet(llmModelAtom);
  const setSystemPrompt = useAtomSet(llmSystemPromptAtom);

  const handleReset = () => {
    setApiUrl(DEFAULT_LLM_API_URL);
    setModel(DEFAULT_LLM_MODEL);
    setSystemPrompt(DEFAULT_LLM_SYSTEM_PROMPT);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Configuration</h1>
          <p>Paramètres du modèle de langue (LLM)</p>
        </div>
      </div>

      <div className="page-body" style={{ padding: 24 }}>
        <div className="paper" style={{ maxWidth: 720, padding: 24 }}>
          <div style={{ display: "grid", gap: 20 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="tiny muted">URL de l'API</span>
              <input
                className="input"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder={DEFAULT_LLM_API_URL}
                spellCheck={false}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span className="tiny muted">Modèle</span>
              <input
                className="input"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={DEFAULT_LLM_MODEL}
                spellCheck={false}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span className="tiny muted">Prompt système</span>
              <textarea
                className="input"
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={DEFAULT_LLM_SYSTEM_PROMPT}
                style={{ resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12 }}
              />
            </label>
          </div>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-subtle" onClick={handleReset}>
              Rétablir les valeurs par défaut
            </button>
          </div>
        </div>

        <p className="tiny muted" style={{ marginTop: 12, maxWidth: 720 }}>
          Les modifications sont enregistrées automatiquement dans le navigateur (localStorage).
        </p>
      </div>
    </div>
  );
}
