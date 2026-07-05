/* The five chapters of the Ramayana journey. */

export const CHAPTERS = [
  {
    key: "princes",
    num: 1,
    title: "The Four Princes",
    tagline:
      "A king's wish, a demon in the forest, and the bow no one could lift.",
    card: "c1_bow",
    scenes: {
      c1_ayodhya: "The city of Ayodhya",
      c1_gurukul: "Learning in the forest",
      c1_vishwamitra: "The sage's demand",
      c1_tataka: "The demon of the forest",
      c1_bow: "The bow of Shiva",
      c1_wedding: "Rama and Sita",
    },
  },
  {
    key: "promise",
    num: 2,
    title: "The Promise",
    tagline:
      "Two boons, a broken-hearted king, and a throne that held only sandals.",
    card: "c2_sandals",
    scenes: {
      c2_coronation: "The city rejoices",
      c2_kaikeyi: "A whisper in the palace",
      c2_boons: "The two boons",
      c2_departure: "Into exile",
      c2_forest: "Crossing the Ganga",
      c2_sandals: "Bharata's answer",
    },
  },
  {
    key: "golden_deer",
    num: 3,
    title: "The Golden Deer",
    tagline:
      "A deer too beautiful to be real, a line that must not be crossed.",
    card: "golden_deer",
    scenes: {
      panchavati: "The cottage at Panchavati",
      golden_deer: "The golden deer",
      chase: "The chase",
      sita_worries: "The cry in the forest",
      rekha: "Lakshmana's circle",
      sadhu: "The stranger at the line",
      ravana: "The demon king revealed",
      jatayu: "Jatayu the brave",
      promise: "Rama's promise",
    },
  },
  {
    key: "leap",
    num: 4,
    title: "The Great Leap",
    tagline:
      "Hanuman meets Rama, remembers who he is, and jumps an entire ocean.",
    card: "c4_leap",
    scenes: {
      c4_meeting: "The day I met Rama",
      c4_vali: "The duel of brothers",
      c4_search: "The endless ocean",
      c4_jambavan: "Remember who you are",
      c4_leap: "The leap",
      c4_ashoka: "Finding Sita",
    },
  },
  {
    key: "lamps",
    num: 5,
    title: "The Bridge and the Lamps",
    tagline:
      "A bridge of floating stones, a mountain in one hand, and the first Diwali.",
    card: "c5_diwali",
    scenes: {
      c5_vibhishana: "The brother who chose right",
      c5_bridge: "The bridge of stones",
      c5_battle: "The battle for Lanka",
      c5_sanjeevani: "The mountain in his hand",
      c5_ravana_falls: "The arrow of light",
      c5_diwali: "The first Diwali",
    },
  },
];

export const CHAPTER_BY_KEY = Object.fromEntries(
  CHAPTERS.map((c) => [c.key, c]),
);

export const ALL_SCENE_TITLES = Object.assign(
  {},
  ...CHAPTERS.map((c) => c.scenes),
);

const DONE_KEY = "wwh_completed_chapters";

export function completedChapters() {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY)) || [];
  } catch {
    return [];
  }
}

export function markChapterDone(key) {
  const done = new Set(completedChapters());
  done.add(key);
  localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
}
