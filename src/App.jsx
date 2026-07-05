import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { HeroScene, SCENES, SCENE_TITLES } from "./scenes.jsx";
import { HanumanOrb } from "./HanumanOrb.jsx";
import { useHanuman } from "./useHanuman.js";

const World3D = lazy(() => import("./World3D.jsx"));

const params = new URLSearchParams(window.location.search);
const previewScene = params.get("preview");
const worldMode = params.has("world");

export default function App() {
  const [phase, setPhase] = useState(previewScene ? "story" : "landing"); // landing | igniting | story | ended
  const [sceneId, setSceneId] = useState(
    SCENES[previewScene] ? previewScene : "panchavati",
  );
  const [prevSceneId, setPrevSceneId] = useState(null);

  const onScene = useCallback((next) => {
    if (!SCENES[next]) return;
    setSceneId((current) => {
      if (current === next) return current;
      setPrevSceneId(current);
      return next;
    });
  }, []);

  const hanuman = useHanuman({ onScene });
  const { status } = hanuman;

  useEffect(() => {
    if (phase === "story" && status === "ended") setPhase("ended");
    if (phase === "igniting" && status === "error") setPhase("landing");
  }, [phase, status]);

  const begin = async () => {
    setPhase("igniting");
    const started = hanuman.start();
    setTimeout(() => {
      setPhase((p) => (p === "igniting" ? "story" : p));
    }, 1400);
    await started;
  };

  const endStory = async () => {
    await hanuman.stop();
    setPhase("ended");
  };

  const reset = () => {
    setSceneId("panchavati");
    setPrevSceneId(null);
    setPhase("landing");
  };

  if (worldMode) {
    return (
      <Suspense fallback={<div className="stage" />}>
        <World3D />
      </Suspense>
    );
  }

  if (phase === "landing" || phase === "igniting") {
    return (
      <div className="stage">
        <div className="scene-holder">
          <div className="scene-layer visible">
            <HeroScene />
          </div>
        </div>
        <div className={`ignite-veil ${phase === "igniting" ? "on" : ""}`} />
        <main className="landing">
          <p className="eyebrow">Episode one · The golden deer</p>
          <h1>Walk with Hanuman</h1>
          <p className="sub">
            The Ramayana, told to you. Hanuman tells the story out loud, scene
            by scene — and at every hard choice, he stops and asks what{" "}
            <em>you</em> would do. Just talk back.
          </p>
          {hanuman.status === "error" && (
            <p className="error-note">
              The lamp would not light. Allow the microphone for this site, then
              try again.
            </p>
          )}
          <button
            className="begin-btn"
            onClick={begin}
            disabled={phase === "igniting"}
          >
            {phase === "igniting" ? "Lighting the lamp…" : "Begin the story"}
          </button>
          <p className="mic-note">
            Uses your microphone so Hanuman can hear you. About fifteen minutes.
          </p>
          <a className="world-link" href="?world">
            Peek at the walkable forest (3D prototype) →
          </a>
        </main>
      </div>
    );
  }

  if (phase === "ended") {
    return (
      <div className="stage">
        <div className="scene-holder">
          <div className="scene-layer visible">
            <HeroScene />
          </div>
        </div>
        <main className="ended">
          <h2>The lamp rests.</h2>
          <p>
            Rama's search has only begun — and a certain monkey with a very long
            tail is waiting in the next episode. Come back soon.
          </p>
          <button className="begin-btn" onClick={reset}>
            Return to the beginning
          </button>
        </main>
      </div>
    );
  }

  const ActiveScene = SCENES[sceneId];
  const PrevScene = prevSceneId ? SCENES[prevSceneId] : null;

  return (
    <div className="stage">
      <div className="scene-holder">
        {PrevScene && (
          <div className="scene-layer" key={`prev-${prevSceneId}`}>
            <PrevScene />
          </div>
        )}
        <div className="scene-layer visible" key={sceneId}>
          <ActiveScene />
        </div>
      </div>

      <header className="story-top">
        <p className="story-title">{SCENE_TITLES[sceneId]}</p>
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
