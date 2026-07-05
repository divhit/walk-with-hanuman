import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  CHAPTERS,
  CHAPTER_BY_KEY,
  ALL_SCENE_TITLES,
  completedChapters,
  markChapterDone,
} from "./chapters.js";
import { HanumanOrb } from "./HanumanOrb.jsx";
import { useHanuman } from "./useHanuman.js";

const World3D = lazy(() => import("./World3D.jsx"));

const params = new URLSearchParams(window.location.search);
const previewScene = params.get("preview");
const worldMode = params.has("world");

const sceneSrc = (id) => `/scenes/${id}.jpg`;

function SceneImage({ id, visible }) {
  return (
    <div className={`scene-layer ${visible ? "visible" : ""}`}>
      <img
        src={sceneSrc(id)}
        alt={ALL_SCENE_TITLES[id] || ""}
        draggable="false"
      />
    </div>
  );
}

function preloadChapter(chapter) {
  Object.keys(chapter.scenes).forEach((id) => {
    const img = new Image();
    img.src = sceneSrc(id);
  });
}

function chapterOfScene(sceneId) {
  return CHAPTERS.find((c) => c.scenes[sceneId]);
}

export default function App() {
  // phases: landing | chapters | igniting | story | ended
  const [phase, setPhase] = useState(previewScene ? "story" : "landing");
  const [chapterKey, setChapterKey] = useState(
    previewScene
      ? (chapterOfScene(previewScene)?.key ?? "golden_deer")
      : "princes",
  );
  const [sceneId, setSceneId] = useState(
    ALL_SCENE_TITLES[previewScene] ? previewScene : "c1_ayodhya",
  );
  const [prevSceneId, setPrevSceneId] = useState(null);
  const [done, setDone] = useState(completedChapters);

  const chapter = CHAPTER_BY_KEY[chapterKey];

  const onScene = useCallback((next) => {
    if (!ALL_SCENE_TITLES[next]) return;
    setSceneId((current) => {
      if (current === next) return current;
      setPrevSceneId(current);
      return next;
    });
  }, []);

  const hanuman = useHanuman({ onScene });
  const { status } = hanuman;

  useEffect(() => {
    if (phase === "story" && status === "ended") {
      markChapterDone(chapterKey);
      setDone(completedChapters());
      setPhase("ended");
    }
    if (phase === "igniting" && status === "error") setPhase("chapters");
  }, [phase, status, chapterKey]);

  const beginChapter = async (key) => {
    const ch = CHAPTER_BY_KEY[key];
    setChapterKey(key);
    setSceneId(Object.keys(ch.scenes)[0]);
    setPrevSceneId(null);
    setPhase("igniting");
    preloadChapter(ch);
    const started = hanuman.start({
      chapter_num: String(ch.num),
      chapter_title: ch.title,
    });
    setTimeout(() => {
      setPhase((p) => (p === "igniting" ? "story" : p));
    }, 1400);
    await started;
  };

  const endStory = async () => {
    await hanuman.stop();
    markChapterDone(chapterKey);
    setDone(completedChapters());
    setPhase("ended");
  };

  if (worldMode) {
    return (
      <Suspense fallback={<div className="stage" />}>
        <World3D />
      </Suspense>
    );
  }

  if (phase === "landing") {
    return (
      <div className="stage">
        <div className="scene-holder">
          <div className="scene-layer visible">
            <img
              src="/scenes/hero.jpg"
              alt="Hanuman leaps across a golden moon"
              draggable="false"
            />
          </div>
        </div>
        <main className="landing">
          <p className="eyebrow">The Ramayana in five chapters</p>
          <h1>Walk with Hanuman</h1>
          <p className="sub">
            The Ramayana, told to you. Hanuman tells the great story out loud,
            chapter by chapter — and at every hard choice, he stops and asks
            what <em>you</em> would do. Just talk back.
          </p>
          <button className="begin-btn" onClick={() => setPhase("chapters")}>
            Choose a chapter
          </button>
          <p className="mic-note">
            Uses your microphone so Hanuman can hear you. About fifteen minutes
            a chapter.
          </p>
          <a className="world-link" href="?world">
            Peek at the walkable forest (3D prototype) →
          </a>
        </main>
      </div>
    );
  }

  if (phase === "chapters" || phase === "igniting") {
    return (
      <div className="stage chapters-stage">
        <header className="chapters-head">
          <p className="eyebrow">The journey so far</p>
          <h2>Five chapters. One great story.</h2>
        </header>
        <div className="chapter-grid">
          {CHAPTERS.map((ch) => {
            const isDone = done.includes(ch.key);
            const igniting = phase === "igniting" && chapterKey === ch.key;
            return (
              <button
                key={ch.key}
                className={`chapter-card ${isDone ? "done" : ""}`}
                onClick={() => phase === "chapters" && beginChapter(ch.key)}
                disabled={phase === "igniting"}
              >
                <img src={sceneSrc(ch.card)} alt="" draggable="false" />
                <span className="chapter-overlay" />
                <span className="chapter-meta">
                  <span className="chapter-num">
                    Chapter {ch.num}
                    {isDone && <span className="chapter-done"> · ✦ heard</span>}
                  </span>
                  <span className="chapter-title">{ch.title}</span>
                  <span className="chapter-tag">{ch.tagline}</span>
                  <span className="chapter-cta">
                    {igniting ? "Lighting the lamp…" : "Begin →"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {hanuman.status === "error" && (
          <p className="error-note center">
            The lamp would not light. Allow the microphone for this site, then
            try again.
          </p>
        )}
        <div className={`ignite-veil ${phase === "igniting" ? "on" : ""}`} />
      </div>
    );
  }

  if (phase === "ended") {
    const next = CHAPTERS.find((c) => !done.includes(c.key));
    return (
      <div className="stage">
        <div className="scene-holder">
          <div className="scene-layer visible">
            <img src="/scenes/hero.jpg" alt="" draggable="false" />
          </div>
        </div>
        <main className="ended">
          <h2>The lamp rests.</h2>
          <p>
            {next
              ? `${done.length} of five chapters heard. Next on the journey: Chapter ${next.num} — ${next.title}.`
              : "You have walked the whole journey, from Ayodhya to the first Diwali. Hanuman will happily tell any chapter again."}
          </p>
          <button className="begin-btn" onClick={() => setPhase("chapters")}>
            {next ? "Choose the next chapter" : "Hear a chapter again"}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="scene-holder">
        {prevSceneId && (
          <SceneImage id={prevSceneId} key={`prev-${prevSceneId}`} />
        )}
        <SceneImage id={sceneId} visible key={sceneId} />
      </div>

      <header className="story-top">
        <p className="story-title">
          {chapter ? `Ch. ${chapter.num} · ` : ""}
          {ALL_SCENE_TITLES[sceneId]}
        </p>
        <div className="story-controls">
          <button
            className="icon-btn"
            onClick={hanuman.toggleMute}
            aria-label={hanuman.muted ? "Unmute Hanuman" : "Mute Hanuman"}
            title={hanuman.muted ? "Unmute Hanuman" : "Mute Hanuman"}
          >
            {hanuman.muted ? "🔇" : "🔊"}
          </button>
          <button className="end-btn" onClick={endStory}>
            End the story
          </button>
        </div>
      </header>

      <div className="convo-bar">
        <HanumanOrb status={hanuman.status} mode={hanuman.mode} />
        <div className="caption-card">
          <p className="caption-name">Hanuman</p>
          <p className="caption-text">
            {hanuman.agentText ||
              (hanuman.status === "connecting"
                ? "The lamp is being lit…"
                : "Say hello to begin!")}
          </p>
          {hanuman.userText && (
            <p className="caption-you">You: “{hanuman.userText}”</p>
          )}
        </div>
      </div>
    </div>
  );
}
