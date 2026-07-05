#!/usr/bin/env python3
"""Generate painted scene art with Gemini (gemini-3-pro-image).

Reads GEMINI_API_KEY from the environment. Generates a hero image first,
then uses it as a style reference for every scene so the set is cohesive.
Outputs PNGs to public/scenes/.
"""

import base64
import json
import os
import pathlib
import sys
import time
import urllib.request

KEY = os.environ["GEMINI_API_KEY"]
MODEL = "gemini-3-pro-image"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "scenes"
OUT.mkdir(parents=True, exist_ok=True)

STYLE = (
    "Illustration in the style of a luxurious Indian storybook: Kerala mural and "
    "Pattachitra inspired, rich flat shapes with ornate gold detailing, painterly "
    "textures, glowing rim light. Dusk palette of deep indigo, violet, ember orange "
    "and marigold gold. Cinematic wide composition, magical and warm, suitable for "
    "children — beautiful, never scary or gory. No text, no borders, no watermark."
)

SCENES = {
    "hero": "Hanuman, the noble monkey god with a golden crown and flowing tail, leaping joyfully across a giant golden full moon in a starry indigo night sky, high above a dark ocean with gentle golden waves. He is graceful and heroic, silhouette-lit by the moon.",
    "panchavati": "A serene dawn in the Panchavati forest: a charming thatched cottage in a clearing, prince Rama with his bow, princess Sita tending flowers, and Lakshmana standing watch. Peaceful golden morning light through ancient trees, birds in the sky.",
    "golden_deer": "A magical golden deer with fur of living gold and silver star-shaped spots, glowing softly, standing alert at the edge of the forest clearing. Sita points at it in wonder from near the cottage while Lakshmana looks doubtful. Morning light.",
    "chase": "Prince Rama running through a deep dense forest with his bow drawn, chasing the glowing golden deer which leaps away between huge ancient trees. Shafts of golden light cut through the emerald canopy. Sense of speed and mystery.",
    "sita_worries": "Outside the forest cottage at dusk, Sita, distressed and pleading, begs Lakshmana to go help. Lakshmana, torn, holds his bow. Wind swirls leaves through a mauve and violet sky. Emotional but gentle.",
    "rekha": "Night at the forest cottage: Lakshmana kneels and draws a blazing golden circle of light on the ground around the cottage — the Lakshmana Rekha. Sita watches from the doorway. A large full moon and stars above, fireflies in the dark trees.",
    "sadhu": "A bent old sadhu holy man with a walking staff and begging bowl stands just OUTSIDE a glowing golden circle on the ground, beckoning. Sita stands inside the circle holding a bowl of fruit, hesitant. Tense deep-indigo night, moonlight, his long shadow hints at something larger.",
    "ravana": "The demon king Ravana revealed in his true form: ten crowned heads and many arms, towering dramatically under a storm-lit violet and crimson sky, as his ornate flying chariot rises carrying Sita away. A trail of tiny golden jewels falls from the sky. Dramatic but stylized and not gory.",
    "jatayu": "Jatayu, a majestic giant eagle with vast spread wings, bravely attacking the ornate flying chariot in mid-air, silhouetted against an enormous setting sun in an ember-red sky. Feathers drift in the air. Heroic and moving.",
    "promise": "Dawn after the storm: Rama and Lakshmana stand on a hilltop looking to the horizon where a single bright star shines, Rama's fist on his heart making a solemn vow. The wounded eagle Jatayu rests peacefully nearby. Teal-and-gold pre-dawn sky, hopeful.",
}


def generate(name, prompt, ref_b64=None):
    parts = []
    if ref_b64:
        parts.append({"inline_data": {"mime_type": "image/png", "data": ref_b64}})
        parts.append({
            "text": f"Using the EXACT same art style, palette and rendering as this reference image, paint a new scene: {prompt} {STYLE}"
        })
    else:
        parts.append({"text": f"{prompt} {STYLE}"})
    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {"imageConfig": {"aspectRatio": "16:9"}},
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(body).encode(),
        headers={"x-goog-api-key": KEY, "Content-Type": "application/json"},
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
            for part in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    data = base64.b64decode(part["inlineData"]["data"])
                    (OUT / f"{name}.png").write_bytes(data)
                    return base64.b64encode(data).decode()
            print(f"  no image part for {name}: {json.dumps(d)[:300]}", file=sys.stderr)
        except Exception as e:
            print(f"  attempt {attempt + 1} failed for {name}: {e}", file=sys.stderr)
            time.sleep(4)
    return None


hero_b64 = generate("hero", SCENES["hero"])
print("hero:", "ok" if hero_b64 else "FAILED")
for name, prompt in SCENES.items():
    if name == "hero":
        continue
    ok = generate(name, prompt, ref_b64=hero_b64)
    print(f"{name}:", "ok" if ok else "FAILED")
