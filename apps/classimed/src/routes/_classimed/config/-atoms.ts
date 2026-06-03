import { Atom } from "effect/unstable/reactivity";
import { KeyValueStore } from "effect/unstable/persistence";
import { Schema } from "effect";

export const DEFAULT_LLM_API_URL = "";
export const DEFAULT_LLM_MODEL = "Qwen/Qwen2.5-7B-Instruct-AWQ";
export const DEFAULT_LLM_SYSTEM_PROMPT =
  'You are an expert system specialized in Classical Chinese. Your task is to split the text into meaningful segments that are easy to review for translation, gloss them into Modern Chinese, and translate them into French and indicate which confidence you have in your work (confidence between 0.1 and 0.95). Output ONLY a valid JSON object matching this schema: {"segments": [{"src_text": "...", "gloss_text": "...", "fr_text": "...", "confidence": 0.95}]}. No explanations, no markdown fences.';

const KEY_LLM_API_URL = "classimed.config.llm.apiUrl";
const KEY_LLM_MODEL = "classimed.config.llm.model";
const KEY_LLM_SYSTEM_PROMPT = "classimed.config.llm.systemPrompt";

const kvsRuntime = Atom.runtime(KeyValueStore.layerStorage(() => localStorage));

export const llmApiUrlAtom = Atom.kvs({
  runtime: kvsRuntime,
  key: KEY_LLM_API_URL,
  schema: Schema.String,
  defaultValue: () => DEFAULT_LLM_API_URL,
});

export const llmModelAtom = Atom.kvs({
  runtime: kvsRuntime,
  key: KEY_LLM_MODEL,
  schema: Schema.String,
  defaultValue: () => DEFAULT_LLM_MODEL,
});

export const llmSystemPromptAtom = Atom.kvs({
  runtime: kvsRuntime,
  key: KEY_LLM_SYSTEM_PROMPT,
  schema: Schema.String,
  defaultValue: () => DEFAULT_LLM_SYSTEM_PROMPT,
});

// Read config values directly from localStorage for use in non-React Effect code.
// Atom.kvs stores values via Schema.fromJsonString, so strings are JSON-encoded.
export function readLlmConfig(): { apiUrl: string; model: string; systemPrompt: string } {
  const read = (key: string, fallback: string): string => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as string) : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    apiUrl: read(KEY_LLM_API_URL, DEFAULT_LLM_API_URL),
    model: read(KEY_LLM_MODEL, DEFAULT_LLM_MODEL),
    systemPrompt: read(KEY_LLM_SYSTEM_PROMPT, DEFAULT_LLM_SYSTEM_PROMPT),
  };
}
