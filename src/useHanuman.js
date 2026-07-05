import { useCallback, useRef, useState } from "react";
import { Conversation } from "@elevenlabs/client";

export const AGENT_ID = "agent_2801kwre7kjre2b974y03mq4y5hn";

export function useHanuman({ onScene }) {
  const convRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | ended | error
  const [mode, setMode] = useState("listening"); // listening | speaking
  const [agentText, setAgentText] = useState("");
  const [userText, setUserText] = useState("");
  const [muted, setMuted] = useState(false);
  const onSceneRef = useRef(onScene);
  onSceneRef.current = onScene;

  const start = useCallback(async () => {
    if (convRef.current) return;
    setStatus("connecting");
    setAgentText("");
    setUserText("");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = {
        agentId: AGENT_ID,
        clientTools: {
          show_scene: async ({ scene_id }) => {
            onSceneRef.current?.(scene_id);
          },
        },
        onModeChange: ({ mode: m }) => setMode(m),
        onMessage: ({ source, message }) => {
          if (source === "ai") {
            setAgentText(message);
            setUserText("");
          } else if (source === "user") {
            setUserText(message);
          }
        },
        onError: () => setStatus("error"),
        onDisconnect: () => {
          convRef.current = null;
          setStatus((s) => (s === "error" ? s : "ended"));
        },
      };
      try {
        convRef.current = await Conversation.startSession({
          ...options,
          connectionType: "webrtc",
        });
      } catch {
        convRef.current = await Conversation.startSession({
          ...options,
          connectionType: "websocket",
        });
      }
      setStatus("connected");
    } catch (err) {
      console.error("Could not start conversation", err);
      convRef.current = null;
      setStatus("error");
    }
  }, []);

  const stop = useCallback(async () => {
    const conv = convRef.current;
    convRef.current = null;
    if (conv) {
      try {
        await conv.endSession();
      } catch {
        /* already closed */
      }
    }
    setStatus("ended");
  }, []);

  const toggleMute = useCallback(async () => {
    const conv = convRef.current;
    if (!conv) return;
    setMuted((m) => {
      conv.setVolume({ volume: m ? 1 : 0 });
      return !m;
    });
  }, []);

  return { start, stop, toggleMute, muted, status, mode, agentText, userText };
}
