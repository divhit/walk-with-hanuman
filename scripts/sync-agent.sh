#!/usr/bin/env bash
# Push agent_configs/prod/hanuman.json to the ElevenLabs agent.
# Requires ELEVENLABS_API_KEY in the environment (never commit it).
set -euo pipefail

AGENT_ID="agent_2801kwre7kjre2b974y03mq4y5hn"
CONFIG="$(dirname "$0")/../agent_configs/prod/hanuman.json"

if [ -z "${ELEVENLABS_API_KEY:-}" ]; then
  echo "ELEVENLABS_API_KEY is not set" >&2
  exit 1
fi

python3 - "$CONFIG" <<'EOF' > /tmp/agent_body.json
import json, sys
cfg = json.load(open(sys.argv[1]))
body = {k: cfg[k] for k in ("name", "conversation_config", "platform_settings", "tags") if k in cfg}
print(json.dumps(body))
EOF

curl -s -X PATCH "https://api.elevenlabs.io/v1/convai/agents/$AGENT_ID" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/agent_body.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('synced:', d.get('agent_id') or d.get('detail'))"

rm -f /tmp/agent_body.json
