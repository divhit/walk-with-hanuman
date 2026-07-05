# Walk with Hanuman

The Ramayana, told to you. A voice-first storybook where Hanuman (an ElevenLabs
conversational agent) tells the epic out loud, scene by scene — and at every hard
choice stops to ask what _you_ would do. The screen is a lamp-lit shadow-puppet
tableau (tholpavakoothu-inspired) that changes as the story moves.

**Episode one: The Golden Deer** — three real dilemmas (chase the too-beautiful
deer? break a promise to help someone you love? cross the safe line to be kind?),
plus Jatayu's courage and Rama's vow.

## Stack

- Vite + React, plain CSS (Rozha One + Baloo 2 via Fontsource)
- `@elevenlabs/client` — WebRTC conversation with the Hanuman agent
- Scenes are hand-built SVG silhouette tableaux (`src/scenes.jsx`)
- The agent drives the picture book: a `show_scene` client tool switches scenes

## ElevenLabs agent

- Agent: `agent_2801kwre7kjre2b974y03mq4y5hn` (public, no auth)
- Voice: Shardul K — Hindu Mythology Storyteller (`6EphsklDopDQ6eRkwNHT`)
- Client tool: `show_scene` (`tool_4501kwre5nryfjkv6xqhnvcsh9yb`)
- Config lives in `agent_configs/prod/hanuman.json` (agents-as-code)
- Deploy config changes: `ELEVENLABS_API_KEY=... ./scripts/sync-agent.sh`
  (the convai CLI is logged into a different workspace — use the script instead)

## Develop

```bash
npm install
npm run dev
```

Preview any scene without a voice session: `http://localhost:5173/?preview=rekha`
(scene ids: panchavati, golden_deer, chase, sita_worries, rekha, sadhu, ravana,
jatayu, promise)
