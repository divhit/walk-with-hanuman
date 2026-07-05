import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CHAPTERS,
  CHAPTER_BY_KEY,
  ALL_SCENE_TITLES,
  completedChapters,
  markChapterDone,
  chapterProgress,
  saveProgress,
} from "./chapters.js";
import { CHAPTER_SCRIPTS } from "./chapterScripts.js";
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
      : "birth",
  );
  const [sceneId, setSceneId] = useState(
    ALL_SCENE_TITLES[previewScene] ? previewScene : "n1_ravana_boon",
  );
  const [prevSceneId, setPrevSceneId] = useState(null);
  const [done, setDone] = useState(completedChapters);
  const [listenMode, setListenMode] = useState(
    () => localStorage.getItem("wwh_listen_mode") || "open",
  );
  const [holding, setHolding] = useState(false);
  const chapterKeyRef = useRef(chapterKey);
  chapterKeyRef.current = chapterKey;

  const chapter = CHAPTER_BY_KEY[chapterKey];
  const sceneIds = chapter ? Object.keys(chapter.scenes) : [];
  const sceneIndex = sceneIds.indexOf(sceneId);

  const onScene = useCallback((next) => {
    if (!ALL_SCENE_TITLES[next]) return;
    saveProgress(chapterKeyRef.current, next);
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
      setDone(completedChapters());
      setPhase("ended");
    }
    if (phase === "igniting" && status === "error") setPhase("chapters");
  }, [phase, status]);

  const beginChapter = async (key, startSceneId = null) => {
    const ch = CHAPTER_BY_KEY[key];
    const ids = Object.keys(ch.scenes);
    const start =
      startSceneId && ids.includes(startSceneId) ? startSceneId : ids[0];
    setChapterKey(key);
    setSceneId(start);
    setPrevSceneId(null);
    setPhase("igniting");
    preloadChapter(ch);
    hanuman.setMicMuted(listenMode === "hold");
    const started = hanuman.start({
      chapter_num: String(ch.num),
      chapter_title: ch.title,
      start_scene_id: start === ids[0] ? "first" : start,
      chapter_script: CHAPTER_SCRIPTS[key],
    });
    setTimeout(() => {
      setPhase((p) => (p === "igniting" ? "story" : p));
    }, 1400);
    await started;
  };

  const turnPage = (dir) => {
    const next = sceneIds[sceneIndex + dir];
    if (!next) return;
    onScene(next);
    hanuman.sendContext(
      `(The reader turned the picture book to the scene "${ALL_SCENE_TITLES[next]}" (scene id ${next}). Continue the story from that scene onward, calling show_scene for later scenes as usual.)`,
    );
  };

  const finishChapter = async () => {
    // Reaching the final scene counts as hearing the chapter through.
    if (sceneIndex === sceneIds.length - 1) markChapterDone(chapterKey);
    await hanuman.stop();
    setDone(completedChapters());
    setPhase("ended");
  };

  const toggleListenMode = () => {
    const next = listenMode === "open" ? "hold" : "open";
    setListenMode(next);
    localStorage.setItem("wwh_listen_mode", next);
    hanuman.setMicMuted(next === "hold");
    setHolding(false);
  };

  const holdStart = () => {
    setHolding(true);
    hanuman.setMicMuted(false);
  };

  const holdEnd = () => {
    setHolding(false);
    if (listenMode === "hold") hanuman.setMicMuted(true);
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
          <p className="eyebrow">The complete Ramayana · fourteen chapters</p>
          <h1>Walk with Hanuman</h1>
          <p className="sub">
            The Ramayana, told to you. Hanuman tells the whole epic out loud,
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
    const progress = chapterProgress();
    return (
      <div className="stage chapters-stage">
        <header className="chapters-head">
          <p className="eyebrow">The journey so far</p>
          <h2>Fourteen chapters. One great story.</h2>
        </header>
        <div className="chapter-grid">
          {CHAPTERS.map((ch) => {
            const isDone = done.includes(ch.key);
            const igniting = phase === "igniting" && chapterKey === ch.key;
            const resumeScene = !isDone ? progress[ch.key] : null;
            const canResume =
              resumeScene && Object.keys(ch.scenes).indexOf(resumeScene) > 0;
            return (
              <div
                key={ch.key}
                className={`chapter-card ${isDone ? "done" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => phase === "chapters" && beginChapter(ch.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && phase === "chapters")
                    beginChapter(ch.key);
                }}
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
                  <span className="chapter-actions">
                    <span className="chapter-cta">
                      {igniting ? "Lighting the lamp…" : "Begin →"}
                    </span>
                    {canResume && !igniting && (
                      <button
                        className="resume-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (phase === "chapters")
                            beginChapter(ch.key, resumeScene);
                        }}
                      >
                        Continue from “{ch.scenes[resumeScene]}”
                      </button>
                    )}
                  </span>
                </span>
              </div>
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
              ? `${done.length} of fourteen chapters heard. Next on the journey: Chapter ${next.num} — ${next.title}.`
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
            className="end-btn mode-btn"
            onClick={toggleListenMode}
            title={
              listenMode === "open"
                ? "Hanuman hears everything. Switch to hold-to-talk for noisy rooms."
                : "Hanuman only hears you while the bell is held. Switch to open mic."
            }
          >
            {listenMode === "open" ? "🎙️ Mic: open" : "🔔 Mic: hold to talk"}
          </button>
          <button
            className="icon-btn"
            onClick={hanuman.toggleMute}
            aria-label={hanuman.muted ? "Unmute Hanuman" : "Mute Hanuman"}
            title={hanuman.muted ? "Unmute Hanuman" : "Mute Hanuman"}
          >
            {hanuman.muted ? "🔇" : "🔊"}
          </button>
          <button className="end-btn" onClick={finishChapter}>
            End the story
          </button>
        </div>
      </header>

      <div className="page-nav">
        <button
          className="icon-btn page-btn"
          onClick={() => turnPage(-1)}
          disabled={sceneIndex <= 0}
          aria-label="Previous scene"
          title="Previous scene"
        >
          ‹
        </button>
        <span className="page-count">
          {sceneIndex + 1} / {sceneIds.length}
        </span>
        <button
          className="icon-btn page-btn"
          onClick={() => turnPage(1)}
          disabled={sceneIndex >= sceneIds.length - 1}
          aria-label="Next scene"
          title="Next scene"
        >
          ›
        </button>
      </div>

      <div className="convo-bar">
        <HanumanOrb status={hanuman.status} mode={hanuman.mode} />
        {listenMode === "hold" && (
          <button
            className={`talk-bell ${holding ? "holding" : ""}`}
            onPointerDown={holdStart}
            onPointerUp={holdEnd}
            onPointerLeave={holdEnd}
            onPointerCancel={holdEnd}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Hold to speak to Hanuman"
          >
            <span className="talk-bell-icon">🔔</span>
            <span className="talk-bell-label">
              {holding ? "Hanuman hears you!" : "Hold to speak"}
            </span>
          </button>
        )}
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
