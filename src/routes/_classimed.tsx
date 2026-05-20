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
            <Link to="/reader" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"></path><path d="M9 3v18"></path></svg>
              <span>
                Espace de lecture
              </span>
              <span className="count">8</span>
            </Link>
            <Link to="/glossary" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5h16v2"></path><path d="M9 20h6"></path><path d="M12 5v15"></path></svg>
              <span>
                Glossaire
              </span>
              <span className="count">10</span>
            </Link>
            <Link to="/library" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"></path><path d="M9 3v18"></path></svg>
              <span>
                Bibliotheque
              </span>
              <span className="count">12</span>
            </Link>
            <Link to="/todo" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              <span>
                Todo
              </span>
              <span className="count">5</span>
            </Link>
          </div>
        </aside>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
