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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"></path><path d="M9 3v18"></path></svg>
              <span>
                Espace de lecture
              </span>
            </Link>
            <Link to="/glossary" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5h16v2"></path><path d="M9 20h6"></path><path d="M12 5v15"></path></svg>
              <span>
                Glossaire
              </span>
              <span className="count">10</span>
            </Link>
            <Link to="/library" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"></path><path d="M9 3v18"></path></svg>
              <span>
                Bibliotheque
              </span>
              <span className="count">12</span>
            </Link>
            <Link to="/import" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>
              <span>
                Importer
              </span>
            </Link>
            <Link to="/config" className="navlink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>
                Configuration
              </span>
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
