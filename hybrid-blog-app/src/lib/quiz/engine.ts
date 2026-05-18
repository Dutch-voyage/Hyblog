import { DIMENSION_IDS, CORE_DIMENSION_COUNT, type DimensionId } from './dimensions';
import { PERSONALITY_TYPES, SOUL_FLAVORS, type PersonalityType, type SoulFlavor } from './types';
import type { QuizQuestion } from './questions';

export type DimensionScores = Record<DimensionId, number>;

interface ScoreAccumulator {
  sum: number;
  count: number;
}

/**
 * Compute per-dimension scores (1-7) from the user's selected answers.
 * Each answer may contribute to multiple dimensions; we average all
 * contributions per dimension.  Dimensions with no data default to 4 (neutral).
 */
export function computeScores(
  questions: QuizQuestion[],
  answers: Record<string, string>,
): DimensionScores {
  const accum: Record<string, ScoreAccumulator> = {};
  for (const id of DIMENSION_IDS) {
    accum[id] = { sum: 0, count: 0 };
  }

  for (const q of questions) {
    const chosenId = answers[q.id];
    if (!chosenId) continue;
    const option = q.options.find((o) => o.id === chosenId);
    if (!option) continue;
    for (const [dim, value] of Object.entries(option.scores)) {
      accum[dim].sum += value;
      accum[dim].count += 1;
    }
  }

  const scores = {} as DimensionScores;
  for (const id of DIMENSION_IDS) {
    scores[id] = accum[id].count > 0 ? accum[id].sum / accum[id].count : 4;
  }
  return scores;
}

/** Manhattan distance between two vectors (only first `len` elements). */
function manhattan(a: number[], b: number[], len: number): number {
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += Math.abs((a[i] ?? 4) - (b[i] ?? 4));
  }
  return sum;
}

/** Convert DimensionScores to an ordered number array (indexed by DIMENSION_IDS). */
export function scoresToVector(scores: DimensionScores): number[] {
  return DIMENSION_IDS.map((id) => scores[id]);
}

/**
 * Match the user's score vector to the nearest PersonalityType
 * using Manhattan Distance over the 12 core dimensions.
 */
export function matchType(scores: DimensionScores): PersonalityType {
  const userVec = scoresToVector(scores);
  let bestType = PERSONALITY_TYPES[0];
  let bestDist = Infinity;

  for (const ptype of PERSONALITY_TYPES) {
    if (ptype.hidden) continue;
    const dist = manhattan(userVec, ptype.vector, CORE_DIMENSION_COUNT);
    if (dist < bestDist) {
      bestDist = dist;
      bestType = ptype;
    }
  }
  return bestType;
}

/** Determine the reader's Soul Flavor badge from Model 5 dimensions. */
export function getSoulFlavor(scores: DimensionScores): SoulFlavor {
  const otaku = scores.otakuAlignment;
  const gamer = scores.gamerType;
  const rhythm = scores.lifeRhythm;

  // Soul Flavor is intentionally conservative: it should only appear when the
  // reader gives a strong dessert signal, not merely because they skipped it.
  if (otaku >= 6 && gamer >= 6) return SOUL_FLAVORS.weebGamer;
  if (otaku >= 6) return SOUL_FLAVORS.otaku;
  if (gamer >= 6 && rhythm >= 5.5) return SOUL_FLAVORS.nightGamer;
  if (gamer >= 6) return SOUL_FLAVORS.gamer;
  if (rhythm <= 1.8) return SOUL_FLAVORS.structured;
  if (rhythm >= 6.2) return SOUL_FLAVORS.nightOwl;
  return SOUL_FLAVORS.balanced;
}

/** Retrieve a type by its id string, or undefined. */
export function getTypeById(id: string): PersonalityType | undefined {
  return PERSONALITY_TYPES.find((t) => t.id === id);
}

/** Retrieve a soul flavor by its id string, or the balanced default. */
export function getFlavorById(id: string): SoulFlavor {
  return (
    Object.values(SOUL_FLAVORS).find((f) => f.id === id) ??
    SOUL_FLAVORS.balanced
  );
}
