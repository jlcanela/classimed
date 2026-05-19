import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_classimed")({
  component: Layout,
});

function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            background: "#212529",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          古
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <strong style={{ fontSize: 14 }}>ClassiMed Translate</strong>
          <span style={{ fontSize: 12, color: "var(--gray-6)" }}>古醫文譯</span>
        </div>
      </header>

      <div className="app-main">
        <aside className="app-nav">
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-6)", letterSpacing: 0.4 }}>Navigation</div>
          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            <Link to="/reader" className="navlink">Espace de lecture</Link>
            <Link to="/glossary" className="navlink">Glossaire</Link>
            <button className="navlink">Bibliotheque</button>
          </div>
        </aside>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
