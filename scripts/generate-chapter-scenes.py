#!/usr/bin/env python3
"""Generate painted art for chapters 1, 2, 4, 5 (chapter 3 already exists).

Uses public/scenes/hero.jpg as the style anchor so everything matches.
Skips files that already exist, so it is safe to re-run for failures.
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

STYLE = (
    "Illustration in the style of a luxurious Indian storybook: Kerala mural and "
    "Pattachitra inspired, rich flat shapes with ornate gold detailing, painterly "
    "textures, glowing rim light. Dusk palette of deep indigo, violet, ember orange "
    "and marigold gold. Cinematic wide composition, magical and warm, suitable for "
    "children — beautiful, never scary or gory. No text, no borders, no watermark."
)

SCENES = {
    # Chapter 1 — The Four Princes
    "c1_ayodhya": "The grand ancient city of Ayodhya at golden hour: ornate palaces, temple spires and festive flags along the Sarayu river. On a palace balcony, wise King Dasharatha smiles at four small princes playing at his feet.",
    "c1_gurukul": "A peaceful forest gurukul under a giant banyan tree: four young princes practicing archery and reading palm-leaf scrolls while a gentle sage teaches them. Morning light through leaves, deer watching.",
    "c1_vishwamitra": "A fierce ancient sage with a tall staff and blazing eyes stands in a royal court making a demand; the old king looks worried on his throne while young prince Rama steps forward bravely with his bow, brother Lakshmana at his side.",
    "c1_tataka": "Young prince Rama, calm and radiant, draws his glowing bow in a dark twisted forest while an enormous shadowy demoness looms between dead trees. Stylized, dramatic but not frightening.",
    "c1_bow": "The great hall of Mithila: young Rama effortlessly lifts an enormous ornate celestial bow that glows with divine light, astonished kings watching, princess Sita holding a flower garland, radiance filling the hall.",
    "c1_wedding": "A joyous royal wedding: Rama and Sita exchange marigold garlands under a golden mandap, oil lamps and flower petals everywhere, families beaming, festive night sky.",
    # Chapter 2 — The Promise
    "c2_coronation": "Ayodhya decorated overnight for a coronation: garlands, banners, rangoli and thousands of marigolds, joyful crowds at dawn before the shining palace.",
    "c2_kaikeyi": "A dim, moody palace chamber: a beautiful queen sits troubled by an oil lamp while a bent old servant woman whispers poison into her ear, long shadows on ornate walls.",
    "c2_boons": "A heartbroken old king slumped at the foot of his own throne, reaching out pleading, while the queen stands firm holding up two fingers — two promised boons. Dramatic torch-lit hall.",
    "c2_departure": "Prince Rama, princess Sita and Lakshmana dressed in simple bark cloth walking out through the great city gates at dusk while crowds of citizens weep and reach after them.",
    "c2_forest": "At dawn, a humble wooden boat carries Rama, Sita and Lakshmana across the wide sacred Ganga river; the kind boatman Guha rows, mist and golden light on the water.",
    "c2_sandals": "In the royal court, prince Bharata kneels and reverently places a pair of golden sandals upon the empty throne, courtiers bowing, one bright oil lamp shining. Solemn and moving.",
    # Chapter 4 — The Great Leap
    "c4_meeting": "In a sunlit mountain forest, Hanuman the noble monkey with a small golden crown bows with joined palms before Rama and Lakshmana — the first meeting, warm light, mutual wonder.",
    "c4_vali": "Two mighty crowned monkey kings duel in a jungle clearing, evenly matched, while Rama watches from behind trees with his bow drawn — tension and moral weight, stylized.",
    "c4_search": "Monkey scouts stand on towering sea cliffs at night gazing across an endless moonlit ocean toward a faint glow on the horizon, waves crashing far below.",
    "c4_jambavan": "On the night shore, a wise old bear speaks to Hanuman, who is beginning to GROW gigantic and glow with golden power, remembering who he is. Stars and moon above the sea.",
    "c4_leap": "Gigantic Hanuman soars over the open daytime ocean mid-leap, tail streaming, gold-lined clouds parting, waves rolling far below — pure epic joy.",
    "c4_ashoka": "A beautiful ashoka grove in Lanka: Sita sits sorrowful but dignified beneath a flowering tree, while a tiny Hanuman perched on a branch above lowers Rama's golden ring toward her, fireflies glowing.",
    # Chapter 5 — The Bridge and the Lamps
    "c5_vibhishana": "A noble, kind-faced rakshasa prince in royal robes flies across the dark night sea away from the burning towers of Lanka toward distant campfires on the far shore — leaving his brother for what is right.",
    "c5_bridge": "Monkeys and bears building a great stone causeway across the sunset ocean, boulders floating on the water; in the foreground a tiny squirrel proudly carries a pebble. Hopeful and grand.",
    "c5_battle": "A vast stylized battle before the golden walls of Lanka: the monkey army with banners and boulders facing the rakshasa host, dramatic storm-and-ember sky, epic but not gory.",
    "c5_sanjeevani": "Hanuman flies through the starry night sky carrying an entire glowing Himalayan mountain on one palm, herbs shimmering with healing light on its slopes, moonlit clouds streaming past.",
    "c5_ravana_falls": "The final duel: Rama draws a radiant arrow of pure light facing the ten-headed demon king Ravana across the battlefield, cosmic golden light against storm violet — a sacred, awe-filled moment, not gory.",
    "c5_diwali": "Ayodhya at night lit by thousands and thousands of tiny oil lamps on every roof, wall and river step, as a celestial flying chariot descends toward the palace and crowds celebrate — the first Diwali.",
}


def generate(name, prompt, ref_b64):
    parts = [
        {"inline_data": {"mime_type": "image/jpeg", "data": ref_b64}},
        {"text": f"Using the EXACT same art style, palette and rendering as this reference image, paint a new scene: {prompt} {STYLE}"},
    ]
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
            with urllib.request.urlopen(req, timeout=240) as r:
                d = json.load(r)
            for part in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    (OUT / f"{name}.png").write_bytes(base64.b64decode(part["inlineData"]["data"]))
                    return True
            print(f"  no image part for {name}", file=sys.stderr)
        except Exception as e:
            print(f"  attempt {attempt + 1} failed for {name}: {e}", file=sys.stderr)
            time.sleep(5)
    return False


ref_b64 = base64.b64encode((OUT / "hero.jpg").read_bytes()).decode()
failed = []
for name, prompt in SCENES.items():
    if (OUT / f"{name}.jpg").exists():
        print(f"{name}: exists, skipping")
        continue
    ok = generate(name, prompt, ref_b64)
    print(f"{name}:", "ok" if ok else "FAILED", flush=True)
    if not ok:
        failed.append(name)
print("DONE. failed:", failed or "none")
