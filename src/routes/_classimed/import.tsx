import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "xstate";
import { CompletedStep } from "./import/-CompletedStep";
import { DetectStep } from "./import/-DetectStep";
import { importMachine, STATE_TO_STEP, type ImportEvent, type ImportState } from "./import/-machine.js";
import { ReviewStep } from "./import/-ReviewStep";
import { SourceStep } from "./import/-SourceStep";

export const Route = createFileRoute("/_classimed/import")({
  component: ImportRoute,
});

function useImportActor() {
  type Actor = ReturnType<typeof createActor<typeof importMachine>>;
  const actorRef = useRef<Actor | null>(null);
  const [snapshot, setSnapshot] = useState(() => createActor(importMachine).getSnapshot());

  useEffect(() => {
    const actor = createActor(importMachine);
    actorRef.current = actor;
    const subscription = actor.subscribe(setSnapshot);
    actor.start();

    return () => {
      subscription.unsubscribe();
      actor.stop();
      actorRef.current = null;
    };
  }, []);

  const send = useCallback((event: ImportEvent) => {
    actorRef.current?.send(event);
  }, []);

  return { snapshot, send };
}

function ImportRoute() {
  const { snapshot, send } = useImportActor();
  const state = snapshot.value as ImportState;
  const context = snapshot.context;
  const activeStep = STATE_TO_STEP[state];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Importer un document</h1>
          <p>Coller un texte, deposer un PDF ou scanner une page</p>
        </div>
      </div>

      <div className="page-toolbar" style={{ justifyContent: "center" }}>
        <div className="stepper">
          <div className={`step ${activeStep > 1 ? "done" : activeStep === 1 ? "active" : ""}`}>
            <div className="step-num">{activeStep > 1 ? "ok" : "1"}</div>
            <span>Source</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${activeStep > 2 ? "done" : activeStep === 2 ? "active" : ""}`}>
            <div className="step-num">{activeStep > 2 ? "ok" : "2"}</div>
            <span>Relecture OCR</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${activeStep === 3 ? "active" : ""}`}>
            <div className="step-num">3</div>
            <span>Detection et segmentation</span>
          </div>
        </div>
      </div>

      <div className="page-body" style={{ padding: 24 }}>
        {(state === "source" || state === "reviewLoading") && (
          <SourceStep
            mode={context.mode}
            pastedText={context.pastedText}
            error={context.submitError}
            isLoading={state === "reviewLoading"}
            onModeChange={(mode) => send({ type: "SET_MODE", mode })}
            onPastedTextChange={(pastedText) => send({ type: "SET_PASTED_TEXT", pastedText })}
            onContinue={() => send({ type: "CONTINUE_SOURCE" })}
          />
        )}

        {(state === "review" || state === "detectLoading") && (
          <ReviewStep
            sourceLabel={context.sourceLabel}
            sourcePreview={context.sourcePreview}
            confidence={context.ocrConfidence}
            lines={context.ocrLines}
            isLoading={state === "detectLoading"}
            onBack={() => send({ type: "BACK" })}
            onConfirm={() => send({ type: "CONFIRM_OCR" })}
          />
        )}

        {(state === "detect" || state === "submitting") && (
          <DetectStep
            lines={context.segmentationLines}
            isLoading={false}
            isSubmitting={state === "submitting"}
            error={context.submitError}
            onBack={() => send({ type: "BACK" })}
            onSubmit={() => send({ type: "SUBMIT_IMPORT" })}
          />
        )}

        {state === "completed" && (
          <CompletedStep
            result={context.finalizeResult}
            onRetry={() => send({ type: "RETRY" })}
          />
        )}
      </div>
    </div>
  );
}
