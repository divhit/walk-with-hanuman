#!/usr/bin/env python3
"""Generate painted art for the full 14-chapter Ramayana.

Style-anchored to public/scenes/hero.jpg. Idempotent: skips existing jpgs.
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
    # Ch1 — The Birth of the Princes
    "n1_ravana_boon": "The ten-headed demon king Ravana stands in deep meditation on a mountain as the radiant creator god Brahma appears in the sky granting him a glowing golden boon, cosmic light swirling — a moment of awe and pride.",
    "n1_yajna": "A grand royal fire ritual: priests around a great sacred fire from which a shining celestial being rises holding a golden pot of divine kheer, the old king receiving it with wonder, queens watching.",
    "n1_princes": "Inside the Ayodhya palace, three radiant queens cradle four newborn princes wrapped in silk while the old king weeps with joy, lamps and garlands everywhere.",
    "n1_bond": "Four young princes in a palace courtyard: two pairs of inseparable brothers — one pair practicing bow and arrow together, the other pair reading a scroll together — warm evening light.",
    # Ch2 — The Demon of the Forest
    "n2_yajna_attack": "Terrified forest sages shield a sacred fire altar as dark shadowy rakshasa shapes rain filth from a storm sky above the forest, the flames flickering — ominous but stylized, not gory.",
    "n2_journey": "The sage Vishwamitra leads young Rama and Lakshmana with bows along the river Sarayu into wilder and darker forest, teaching them glowing secret mantras that shimmer in the air.",
    "n2_astras": "Young Rama stands with eyes closed as luminous divine weapons — discs, tridents, radiant arrows — circle around him in rings of light, the sage Vishwamitra blessing him.",
    "n2_maricha_flung": "Young Rama's arrow of white light strikes a demon and hurls him far across the sky over the distant ocean like a comet, while the sacred fire below burns safely and sages rejoice.",
    # Ch3 — The Bow and the Wedding
    "n3_ahalya": "In a silent ashram, a woman made of grey stone awakens into radiant living color as young Rama's foot touches the stone, light spreading like dawn — wonder and grace.",
    "n3_mithila": "A flowering palace garden in Mithila at dawn: young princess Sita among her friends picking flowers looks up and meets the eyes of young Rama across the garden — a gentle, luminous first meeting.",
    "n3_kings_fail": "In Janaka's great hall, proud kings strain and heave together at an enormous ornate celestial bow that will not move an inch, some tumbling over, courtiers hiding smiles — gently comic.",
    "n3_parashurama": "On the royal road, a towering fierce ascetic with a blazing axe blocks the wedding procession, while calm young Rama bows respectfully and receives a shining divine bow from him — anger meeting serenity.",
    # Ch4 — The Two Boons
    "n4_kaikeyi_war": "A great battle of gods and demons long ago: young queen Kaikeyi bravely drives the king's war chariot through the chaos, holding the broken wheel with her own hand, saving the wounded king — heroic.",
    # Ch5 — Bharata's Vow
    "n5_shravan": "A moonlit riverbank long ago: a young prince with a bow looks stricken beside a fallen water pot, while in the distance a devoted boy's cart carrying his blind old parents waits under the stars — sorrowful, gentle, no gore.",
    "n5_grief": "The old king lies peacefully on his royal bed as queens grieve softly beside dimming oil lamps, the palace hushed under a night sky — a gentle passing, tender not frightening.",
    "n5_bharata_return": "Prince Bharata, travel-worn and anguished, confronts his mother in the palace hall, turning away from the throne she offers, the bent old maid shrinking into shadows.",
    "n5_chitrakoot": "On the green hill of Chitrakoot, an enormous royal procession kneels before a humble leaf hut as Bharata begs at Rama's feet, Rama gently raising him up — emotional, golden morning light.",
    "n5_nandigram": "In a simple village hut, Bharata in hermit's bark cloth bows before golden sandals enthroned on a royal seat, ruling the kingdom as their humble servant, one bright lamp burning.",
    # Ch6 — The Forest Years
    "n6_sages": "Deep forest ashrams: gentle rishis and their families bless Rama, Sita and Lakshmana; the sage's wife Anasuya lovingly gifts Sita celestial garments and jewels, deer and peacocks nearby.",
    "n6_agastya": "The great sage Agastya in his mountain ashram presents Rama with a mighty glowing bow, two inexhaustible quivers and a radiant sword, light streaming from the weapons.",
    "n6_shurpanakha": "At the forest cottage, a rakshasi appears half in glamorous golden illusion and half in her wild true form, reaching toward startled Rama while Lakshmana steps protectively forward — stylized, dramatic, not gory.",
    "n6_khara": "Rama stands alone and calm as a storm of arrows of light fans from his bow against a charging horde of shadowy rakshasa warriors filling the dusk forest — epic and stylized.",
    "n6_lanka_news": "In Lanka's dark golden throne hall, the wounded rakshasi kneels before ten-headed Ravana, gesturing passionately as she describes Sita's beauty; Ravana leans forward, eyes kindling.",
    # Ch8 — Friends on the Path
    "n8_jatayu_dying": "At sunset, Rama and Lakshmana kneel tenderly beside the great wounded eagle Jatayu, cradling his noble head as he speaks his last words, golden feathers scattered, soft sacred light.",
    "n8_kabandha": "From a ritual fire in a forest clearing rises a beautiful shining celestial being, freed from a monstrous form, pointing the two brothers toward the south — transformation and hope.",
    "n8_shabari": "Inside a humble hermitage, the old ascetic woman Shabari, face full of love, offers half-tasted berries to a warmly smiling Rama who accepts them like treasure — devotion, the sweetest scene.",
    "n8_pact": "Beside a small sacred fire on a mountain ledge, Rama and the monkey king Sugriva clasp hands in sworn friendship as Hanuman stands between them beaming, Lakshmana watching.",
    # Ch9 — The Monkey King
    "n9_dundubhi": "Young-hearted Rama playfully flicks an enormous giant's skeleton across the sky with his toe, and with a single arrow pierces seven towering sal trees standing in a row — monkeys gaping in awe.",
    "n9_tara": "The monkey queen Tara grieves with dignity over fallen Vali as Rama speaks gentle words of comfort and young prince Angada bows his head — solemn, compassionate, dusk light.",
    "n9_monsoon": "Monsoon rains over the mountains: Rama sits pensive at a cave mouth watching grey curtains of rain, while far below the monkey city glows with feast fires — longing and waiting.",
    "n9_muster": "A vast sea of monkey and bear warriors gathers from every horizon across hills and valleys, banners and staffs raised, under a sky of racing clouds — breathtaking scale.",
    "n9_ring": "Rama places his golden ring into Hanuman's cupped hands, looking into his eyes with complete trust, while search parties of monkeys ready themselves behind — a quiet, weighty moment.",
    # Ch10 — The Great Leap
    "n10_sampati": "On a sea cliff, an ancient giant vulture with burnt wings speaks to the gathered monkeys as new feathers begin to glow and sprout on his wings, moonlit ocean far below.",
    "n10_surasa": "Over the night ocean, gigantic sea-serpent jaws rise from the waves as a tiny thumb-sized glowing Hanuman darts cleverly through them, stars and spray around — thrilling, playful.",
    "n10_lanka_gate": "Perched tiny on a mountain rim at night, Hanuman gazes down at the golden city of Lanka glittering with ten thousand lamps below, its towers rising into the starry sky.",
    # Ch11 — The Burning of Lanka
    "n11_search_palace": "Tiny cat-sized Hanuman creeps through Ravana's opulent moonlit palace among sleeping courtiers and gilded pillars, searching every face — hushed, jewel-toned night.",
    "n11_sita_defiance": "In the ashoka grove, Sita sits radiating quiet power, holding a single blade of grass before her like a shield between herself and the towering shadowed form of Ravana — her dignity outshines his crown.",
    "n11_capture": "Hanuman, bound in glowing serpent coils before Ravana's golden court, stands utterly calm and faintly smiling while rakshasas wrap his long tail with cloth — composure amid menace.",
    "n11_burning": "Giant Hanuman bounds across the rooftops of Lanka at night, his blazing tail trailing arcs of ember fire as towers catch flame behind him, his face fierce and joyful — iconic, stylized.",
    "n11_return": "Hanuman lands on the northern shore among cheering monkeys, holding aloft Sita's shining hair-jewel like a tiny star, the sea and dawn sky behind — triumph and joy.",
    # Ch12 — The Bridge Across the Sea
    "n12_ocean_wrath": "Rama, luminous with restrained power, draws a blazing arrow at the churning midnight ocean while the ocean god Samudra rises from the waves with folded hands, crowned with coral and pearls.",
    "n12_crossing": "The vast army crosses the great stone causeway over the sea at dawn — Rama carried on Hanuman's shoulders, Lakshmana on Angada's — banners, spray and golden light.",
    "n12_angada_embassy": "The young monkey prince Angada stands tall and defiant in Ravana's golden court, one foot planted immovably while rakshasa warriors strain uselessly to lift it — courage in the lion's den.",
    # Ch13 — The Great Battle
    "n13_nagapash": "Rama and Lakshmana lie bound in coils of shadowy serpent-arrows on the battlefield as the colossal golden eagle Garuda descends from the clouds in glory, serpents fleeing from his light.",
    "n13_kumbhakarna": "The gentle-faced colossal giant Kumbhakarna, tall as a tower, wades through the battlefield like a walking mountain as monkeys scatter like leaves — awe-inspiring, stylized, not gory.",
    "n13_indrajit": "Lakshmana duels the sorcerer prince Indrajit amid storm clouds and shattered illusions, arrows of light crossing arrows of shadow in a violet sky.",
    # Ch14 — The Return of the Light
    "n14_reunion": "Sita walks serene and radiant through gentle sacred flames as the fire god Agni himself, crowned in light, presents her untouched to an overcome Rama — reverent, luminous, triumphant.",
    "n14_pushpaka": "The flying palace Pushpaka soars home through sunset clouds as Rama, Sita, Lakshmana, Hanuman and friends lean over its lotus railings, pointing down at the tiny bridge, mountains and forests of their whole journey below.",
    "n14_bharata_reunion": "Bharata, in hermit robes, runs weeping with joy to embrace Rama at the edge of Ayodhya, holding the golden sandals high, crowds erupting behind him.",
    "n14_coronation": "The grand coronation: Rama and Sita enthroned in golden splendor, Lakshmana, Bharata and Shatrughna beside them, Vibhishana and Sugriva honored guests, and Hanuman kneeling contentedly at their feet.",
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
