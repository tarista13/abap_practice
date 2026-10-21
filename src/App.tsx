import { useEffect, useState } from "react";
import { Playground } from "./components/Playground";
import { LearnPage } from "./components/LearnPage";
import { ChallengesPage } from "./components/ChallengesPage";
import { lessons } from "./tutorials";
import { warmUp } from "./engine/client";

type Route =
  | { page: "learn"; id: string }
  | { page: "playground" }
  | { page: "challenges"; id?: string };

// hash routes: #/learn/<lesson>, #/playground, #/challenges/<challenge>
function parseRoute(hash: string): Route {
  const [page, id] = hash.replace(/^#\/?/, "").split("/");
  if (page === "playground") return { page };
  if (page === "challenges") return { page, id };
  return { page: "learn", id: id ?? lessons[0].id };
}

function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function usePrefersDark(): boolean {
  const query = "(prefers-color-scheme: dark)";
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return dark;
}

export default function App() {
  const route = useRoute();
  const dark = usePrefersDark();

  // start loading the transpiler before the first Run
  useEffect(() => warmUp(), []);

  const tab = (page: Route["page"], label: string) => (
    <a href={`#/${page}`} className={route.page === page ? "active" : ""} aria-current={route.page === page ? "page" : undefined}>
      {label}
    </a>
  );

  return (
    <div className="app">
      <header>
        <h1>ABAP Practice <span className="sub">for SAP TM</span></h1>
        <nav>
          {tab("learn", "Learn")}
          {tab("playground", "Playground")}
          {tab("challenges", "Challenges")}
        </nav>
      </header>
      <main>
        {route.page === "learn" && <LearnPage lessonId={route.id} dark={dark} />}
        {route.page === "playground" && <Playground dark={dark} />}
        {route.page === "challenges" && <ChallengesPage challengeId={route.id} dark={dark} />}
      </main>
    </div>
  );
}
