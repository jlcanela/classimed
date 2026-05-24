import { assign, createMachine, fromPromise } from "xstate";
import { Effect } from "effect";
import { runtime } from "@/app/boot";
import {
  callFinalizeImport,
  callRunOcrMock,
  callRunSegmentationMock,
  type FinalizeImportInput,
  type FinalizeImportResult,
  type ImportMode,
  type OcrLine,
  type SegmentationLine,
} from "./-atoms";

type DocumentMetadata = {
  documentTitle: string;
  documentTitleFr: string;
  documentPeriod: string;
  documentType: string;
  documentTagsText: string;
  documentPages: number;
  documentActive: boolean;
};

export type ImportContext = {
  mode: ImportMode;
  pastedText: string;
  sourceLabel: string;
  sourcePreview: string;
  documentTitle: string;
  documentTitleFr: string;
  documentPeriod: string;
  documentType: string;
  documentTagsText: string;
  documentPages: number;
  documentActive: boolean;
  ocrConfidence: number;
  ocrLines: OcrLine[];
  segmentationLines: SegmentationLine[];
  finalizeResult: FinalizeImportResult | null;
  submitError: string | null;
};

export type ImportEvent =
  | { type: "SET_MODE"; mode: ImportMode }
  | { type: "SET_PASTED_TEXT"; pastedText: string }
  | { type: "SET_DOCUMENT_METADATA"; patch: Partial<DocumentMetadata> }
  | { type: "CONTINUE_SOURCE" }
  | { type: "CONFIRM_OCR" }
  | { type: "SUBMIT_IMPORT" }
  | { type: "BACK" }
  | { type: "RETRY" };

export type ImportState =
  | "source"
  | "reviewLoading"
  | "review"
  | "detectLoading"
  | "detect"
  | "submitting"
  | "completed";

export const STATE_TO_STEP: Record<ImportState, number> = {
  source: 1,
  reviewLoading: 2,
  review: 2,
  detectLoading: 3,
  detect: 3,
  submitting: 3,
  completed: 3,
};

const toPastedOcrLines = (pastedText: string): OcrLine[] =>
  pastedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((txt, index) => ({ txt, conf: Math.max(0.8, 0.99 - index * 0.02) }));

const toDocumentTitle = (sourceLabel: string, sourcePreview: string) => {
  const withoutExtension = sourceLabel.replace(/\.[a-z0-9]+$/i, "").trim();
  if (withoutExtension.length > 0) {
    return withoutExtension;
  }

  const firstPreviewLine = sourcePreview
    .split("　")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstPreviewLine?.slice(0, 60) ?? "Document importe";
};

const toDocumentMetadata = (context: ImportContext): DocumentMetadata => ({
  documentTitle: context.documentTitle.trim().length > 0
    ? context.documentTitle.trim()
    : toDocumentTitle(context.sourceLabel, context.sourcePreview),
  documentTitleFr: context.documentTitleFr.trim(),
  documentPeriod: context.documentPeriod.trim(),
  documentType: context.documentType.trim().length > 0 ? context.documentType.trim() : "canon",
  documentTagsText: context.documentTagsText.trim(),
  documentPages: Number.isFinite(context.documentPages) ? Math.max(0, Math.trunc(context.documentPages)) : 0,
  documentActive: context.documentActive,
});

export const importMachine = createMachine(
  {
    types: {} as {
      context: ImportContext;
      events: ImportEvent;
    },
    id: "import-wizard",
    initial: "source",
    context: {
      mode: "paste",
      pastedText: "",
      sourceLabel: "",
      sourcePreview: "",
      documentTitle: "",
      documentTitleFr: "",
      documentPeriod: "",
      documentType: "canon",
      documentTagsText: "",
      documentPages: 0,
      documentActive: true,
      ocrConfidence: 0,
      ocrLines: [],
      segmentationLines: [],
      finalizeResult: null,
      submitError: null,
    },
    states: {
      source: {
        on: {
          SET_MODE: {
            actions: assign({ mode: ({ event }) => event.mode }),
          },
          SET_PASTED_TEXT: {
            actions: assign({ pastedText: ({ event }) => event.pastedText }),
          },
          SET_DOCUMENT_METADATA: {
            actions: assign(({ event }) => event.patch),
          },
          CONTINUE_SOURCE: [
            {
              guard: ({ context }) => context.mode === "paste",
              target: "detectLoading",
              actions: assign(({ context }) => {
                const lines = toPastedOcrLines(context.pastedText);
                const confidence = lines.length > 0
                  ? Math.round((lines.reduce((total, line) => total + line.conf, 0) / lines.length) * 100) / 100
                  : 0;

                return {
                  submitError: null,
                  sourceLabel: "source-collee.txt",
                  sourcePreview: lines.map((line) => line.txt).join("　"),
                  documentTitle: context.documentTitle.trim().length > 0
                    ? context.documentTitle
                    : lines[0]?.txt?.slice(0, 60) ?? "Document importe",
                  ocrConfidence: confidence,
                  ocrLines: lines,
                };
              }),
            },
            {
              target: "reviewLoading",
              actions: assign({ submitError: () => null }),
            },
          ],
        },
      },
      reviewLoading: {
        invoke: {
          src: "runOcr",
          input: ({ context }: { context: ImportContext }) => ({
            mode: context.mode,
            pastedText: context.pastedText,
          }),
          onDone: {
            target: "review",
            actions: assign({
              sourceLabel: ({ event }) => event.output.sourceLabel,
              sourcePreview: ({ event }) => event.output.sourcePreview,
              documentTitle: ({ context, event }) => context.documentTitle.trim().length > 0
                ? context.documentTitle
                : toDocumentTitle(event.output.sourceLabel, event.output.sourcePreview),
              ocrConfidence: ({ event }) => event.output.confidence,
              ocrLines: ({ event }) => event.output.lines,
            }),
          },
          onError: {
            target: "source",
            actions: [
              ({ event }) => { runtime.runFork(Effect.logError("[import] OCR step failed", event.error)); },
              assign({ submitError: ({ event }) => String(event.error) }),
            ],
          },
        },
      },
      review: {
        on: {
          BACK: { target: "source" },
          CONFIRM_OCR: { target: "detectLoading" },
        },
      },
      detectLoading: {
        invoke: {
          src: "runSegmentation",
          input: ({ context }: { context: ImportContext }) => ({ lines: context.ocrLines }),
          onDone: {
            target: "detect",
            actions: assign({ segmentationLines: ({ event }) => event.output.lines }),
          },
          onError: {
            target: "review",
            actions: [
              ({ event }) => { runtime.runFork(Effect.logError("[import] segmentation step failed", event.error)); },
              assign({ submitError: ({ event }) => String(event.error) }),
            ],
          },
        },
      },
      detect: {
        on: {
          BACK: [
            { guard: ({ context }) => context.mode === "paste", target: "source" },
            { target: "review" },
          ],
          SUBMIT_IMPORT: {
            target: "submitting",
            actions: assign({ submitError: () => null }),
          },
        },
      },
      submitting: {
        invoke: {
          src: "finalizeImport",
          input: ({ context }: { context: ImportContext }): FinalizeImportInput => ({
            mode: context.mode,
            sourceLabel: context.sourceLabel,
            sourcePreview: context.sourcePreview,
            ...toDocumentMetadata(context),
            segmentationLines: context.segmentationLines,
          }),
          onDone: {
            target: "completed",
            actions: assign({ finalizeResult: ({ event }) => event.output }),
          },
          onError: {
            target: "detect",
            actions: [
              ({ event }) => { runtime.runFork(Effect.logError("[import] finalize step failed", event.error)); },
              assign({ submitError: ({ event }) => String(event.error) }),
            ],
          },
        },
      },
      completed: {
        on: {
          RETRY: {
            target: "source",
            actions: assign({
              mode: () => "paste",
              pastedText: () => "",
              sourceLabel: () => "",
              sourcePreview: () => "",
              documentTitle: () => "",
              documentTitleFr: () => "",
              documentPeriod: () => "",
              documentType: () => "canon",
              documentTagsText: () => "",
              documentPages: () => 0,
              documentActive: () => true,
              ocrConfidence: () => 0,
              ocrLines: () => [],
              segmentationLines: () => [],
              finalizeResult: () => null,
              submitError: () => null,
            }),
          },
        },
      },
    },
  },
  {
    actors: {
      runOcr: fromPromise(({ input }: { input: Pick<ImportContext, "mode" | "pastedText"> }) =>
        callRunOcrMock(input),
      ),
      runSegmentation: fromPromise(({ input }: { input: { lines: OcrLine[] } }) =>
        callRunSegmentationMock(input),
      ),
      finalizeImport: fromPromise(({ input }: { input: FinalizeImportInput }) => callFinalizeImport(input)),
    },
  },
);
