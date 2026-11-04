import { useEffect, useState } from "react";
import type { BreachRecord } from "./engine/log";
import { AboutPage, Disclaimer } from "./ui/AboutPage";
import { AssessPage } from "./ui/AssessPage";
import { LogPage } from "./ui/LogPage";
import { SourcesPage } from "./ui/SourcesPage";
import { UpdatePrompt } from "./ui/UpdatePrompt";

type Route = "assess" | "log" | "sources" | "about";
const ROUTES: { id: Route; label: string }[] = [
  { id: "assess", label: "Assess a breach" },
  { id: "log", label: "Breach log" },
  { id: "sources", label: "Rules and sources" },
  { id: "about", label: "About" }
];

const fromHash = (): Route => {
  const h = window.location.hash.replace("#", "") as Route;
  return ROUTES.some((r) => r.id === h) ? h : "assess";
};

export function App() {
  const [route, setRoute] = useState<Route>(fromHash);
  const [editing, setEditing] = useState<BreachRecord | undefined>();

  useEffect(() => {
    const onHash = () => setRoute(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (r: Route) => {
    window.location.hash = r;
    setRoute(r);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="app-header no-print">
        <div className="brand">
          <img src="/favicon.svg" alt="" width={32} height={32} />
          <div>
            <h1>Canadian Privacy Breach Assessor</h1>
            <p>PIPEDA · Quebec Law 25 · Alberta PIPA</p>
          </div>
        </div>
        <nav aria-label="Main">
          {ROUTES.map((r) => (
            <a
              key={r.id}
              href={`#${r.id}`}
              aria-current={route === r.id ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (r.id === "assess") setEditing(undefined);
                go(r.id);
              }}
            >
              {r.label}
            </a>
          ))}
        </nav>
      </header>
      <div className="print-only print-head">
        <h1>Breach record log</h1>
        <p>Printed {new Date().toLocaleString("en-CA")} from the Canadian Privacy Breach Assessor. Informational only, not legal advice.</p>
      </div>
      <main id="main">
        {route !== "about" && <Disclaimer />}
        {route === "assess" && (
          <AssessPage
            editing={editing}
            onSaved={() => {
              setEditing(undefined);
              go("log");
            }}
          />
        )}
        {route === "log" && (
          <LogPage
            onEdit={(rec) => {
              setEditing(rec);
              go("assess");
            }}
          />
        )}
        {route === "sources" && <SourcesPage />}
        {route === "about" && <AboutPage />}
      </main>
      <footer className="app-footer no-print">
        <p>Your data stays in this browser. No server, no analytics. Open source under the MIT licence.</p>
      </footer>
      <UpdatePrompt />
    </>
  );
}
