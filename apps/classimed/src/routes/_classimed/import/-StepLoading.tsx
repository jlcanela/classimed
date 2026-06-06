export function StepLoading(props: { title: string; message: string }) {
  return (
    <div className="paper" style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <div className="ws-margin-h">{props.title}</div>
      <p className="muted" style={{ marginTop: 8 }}>
        {props.message}
      </p>
    </div>
  );
}
