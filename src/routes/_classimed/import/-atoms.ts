import { Effect, ManagedRuntime } from "effect";
import { appLayer } from "@/app/boot";
import { createImportedDocumentAndSegments } from "@/usecase/import-documents";

export type ImportMode = "paste" | "pdf" | "scan";
export type SegmentLanguage = "classical" | "modern";

export type OcrLine = {
  txt: string;
  conf: number;
  alt?: string;
};

export type SegmentationLine = {
  txt: string;
  lang: SegmentLanguage;
  conf: number;
};

export type OcrResult = {
  sourceLabel: string;
  sourcePreview: string;
  confidence: number;
  lines: OcrLine[];
};

export type SegmentationResult = {
  lines: SegmentationLine[];
};

export type FinalizeImportResult = {
  documentId: string;
  message: string;
  title: string;
};

export type FinalizeImportInput = {
  mode: ImportMode;
  sourceLabel: string;
  sourcePreview: string;
  documentTitle: string;
  documentTitleFr: string;
  documentPeriod: string;
  documentType: string;
  documentTagsText: string;
  documentPages: number;
  documentActive: boolean;
  segmentationLines: ReadonlyArray<SegmentationLine>;
};

const importRuntime = ManagedRuntime.make(appLayer);

const defaultOcrLines: OcrLine[] = [
  { txt: "上古天真論篇第一", conf: 0.99 },
  { txt: "昔在黃帝", conf: 0.99 },
  { txt: "生而神靈", conf: 0.98 },
  { txt: "弱而能言", conf: 0.99 },
  { txt: "幼而徇齊", conf: 0.82, alt: "幼而循齊" },
  { txt: "長而敦敏", conf: 0.97 },
  { txt: "成而登天", conf: 0.99 },
];

const runOcrMock = Effect.fn(function* (input: { mode: ImportMode; pastedText: string }) {
  const lines = input.mode === "paste" && input.pastedText.trim().length > 0
    ? input.pastedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 8)
      .map((txt, index) => ({ txt, conf: Math.max(0.8, 0.99 - index * 0.02) }))
    : defaultOcrLines;

  const sourceLabel = input.mode === "paste"
    ? "source-collee.txt"
    : input.mode === "pdf"
      ? "document-source.pdf"
      : "scan-黃帝內經-001.tif";

  const sourcePreview = lines.map((line) => line.txt).join("　");
  const confidence = Math.round((lines.reduce((acc, line) => acc + line.conf, 0) / lines.length) * 100) / 100;

  return {
    sourceLabel,
    sourcePreview,
    confidence,
    lines,
  } satisfies OcrResult;
});

const runSegmentationMock = Effect.fn(function* (input: { lines: OcrLine[] }) {
  const lines = input.lines.slice(0, 5).map((line, index) => ({
    txt: index === 3 ? `（编注：${line.txt}）` : `${line.txt}${line.txt.endsWith("。") ? "" : "。"}`,
    lang: index === 3 ? "modern" : "classical",
    conf: Math.max(0.83, line.conf - (index === 3 ? 0.04 : 0)),
  })) as SegmentationLine[];

  return {
    lines,
  } satisfies SegmentationResult;
});

const finalizeImport = Effect.fn(function* (input: FinalizeImportInput) {
  console.info("[import] finalize start", {
    mode: input.mode,
    sourceLabel: input.sourceLabel,
    documentTitle: input.documentTitle,
    segmentationCount: input.segmentationLines.length,
  });

  const created = yield* createImportedDocumentAndSegments(input);

  const result = {
    documentId: created.documentId,
    title: created.title,
    message: "Document importe et pret pour traduction.",
  } satisfies FinalizeImportResult;

  console.info("[import] finalize success", result);
  return result;
});

export const callRunOcrMock = (input: { mode: ImportMode; pastedText: string }) =>
  importRuntime.runPromise(runOcrMock(input));

export const callRunSegmentationMock = (input: { lines: OcrLine[] }) =>
  importRuntime.runPromise(runSegmentationMock(input));

export const callFinalizeImport = (input: FinalizeImportInput) =>
  importRuntime.runPromise(finalizeImport(input)).catch((error) => {
    console.error("[import] finalize failed", {
      error,
      sourceLabel: input.sourceLabel,
      mode: input.mode,
      segmentationCount: input.segmentationLines.length,
    });
    throw error;
  });
