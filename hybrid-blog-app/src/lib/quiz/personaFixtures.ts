import { CORE_DIMENSION_COUNT } from './dimensions';
import { computeScores, getSoulFlavor, matchType, scoresToVector } from './engine';
import { QUESTIONS } from './questions';
import { PERSONALITY_TYPES } from './types';

export type AnswerMap = Record<string, string>;

export interface PublicPersonaFixture {
  id: string;
  label: string;
  note: string;
  answers: AnswerMap;
  expectedType: string;
}

export interface PersonaMatch {
  type: string;
  flavor: string;
  topMatches: Array<{ id: string; distance: number }>;
}

function manhattan(a: number[], b: number[], len = CORE_DIMENSION_COUNT): number {
  let sum = 0;
  for (let i = 0; i < len; i++) sum += Math.abs((a[i] ?? 4) - (b[i] ?? 4));
  return sum;
}

export function evaluatePersona(fixture: PublicPersonaFixture): PersonaMatch {
  const scores = computeScores(QUESTIONS, fixture.answers);
  const vector = scoresToVector(scores);
  const type = matchType(scores);
  const flavor = getSoulFlavor(scores);
  const topMatches = PERSONALITY_TYPES
    .filter((ptype) => !ptype.hidden)
    .map((ptype) => ({ id: ptype.id, distance: manhattan(vector, ptype.vector) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return { type: type.id, flavor: flavor.id, topMatches };
}

/**
 * Calibration fixtures are public-persona caricatures, not claims about private
 * beliefs. They make archetype tuning reproducible: if questions or vectors
 * drift, tests show exactly which stereotype moved.
 */
export const PUBLIC_PERSONA_FIXTURES: PublicPersonaFixture[] = [
  {
    id: 'ilya_public_caricature',
    label: 'Ilya Sutskever (public-persona caricature)',
    note: 'Safety-sensitive, mechanism-first, slow-science, skeptical of unexplained capability jumps.',
    expectedType: 'alignment_monk',
    answers: {
      q1: 'a',
      q2: 'a',
      q3: 'c',
      q4: 'a',
      q5: 'b',
      q6: 'a',
      q7: 'a',
      q8: 'd',
      q9: 'a',
      q10: 'a',
      q11: 'c',
      q12: 'a',
      q13: 'a',
      q14: 'd',
      q15: 'c',
      q16: 'a',
      q17: 'a',
      q18: 'a',
      q19: 'a',
      q20: 'a',
      q21: 'a',
      q22: 'a',
      q23: 'a',
      q24: 'a',
      q25: 'a',
      q26: 'd',
      q27: 'd',
      q28: 'b',
      q29: 'c',
      q30: 'a',
    },
  },
  {
    id: 'sam_public_caricature',
    label: 'Sam Altman (public-persona caricature)',
    note: 'Frontier deployment, product loops, institutional stewardship, high tolerance for controlled acceleration.',
    expectedType: 'frontier_steward',
    answers: {
      q1: 'd',
      q2: 'b',
      q3: 'c',
      q4: 'c',
      q5: 'c',
      q6: 'd',
      q7: 'd',
      q8: 'c',
      q9: 'd',
      q10: 'd',
      q11: 'd',
      q12: 'c',
      q13: 'd',
      q14: 'c',
      q15: 'd',
      q16: 'c',
      q17: 'd',
      q18: 'c',
      q19: 'a',
      q20: 'b',
      q21: 'b',
      q22: 'b',
      q23: 'a',
      q24: 'a',
      q25: 'b',
      q26: 'd',
      q27: 'd',
      q28: 'c',
      q29: 'd',
      q30: 'b',
    },
  },
  {
    id: 'demis_public_caricature',
    label: 'Demis Hassabis (public-persona caricature)',
    note: 'Science-led, empirical, scaling-aware, game/RL-flavored, comfortable with controlled frontier labs.',
    expectedType: 'scaling_scientist',
    answers: {
      q1: 'c',
      q2: 'c',
      q3: 'd',
      q4: 'a',
      q5: 'd',
      q6: 'b',
      q7: 'c',
      q8: 'a',
      q9: 'b',
      q10: 'b',
      q11: 'a',
      q12: 'b',
      q13: 'a',
      q14: 'b',
      q15: 'a',
      q16: 'd',
      q17: 'c',
      q18: 'b',
      q19: 'a',
      q20: 'b',
      q21: 'a',
      q22: 'a',
      q23: 'b',
      q24: 'b',
      q25: 'a',
      q26: 'd',
      q27: 'c',
      q28: 'b',
      q29: 'c',
      q30: 'c',
    },
  },
];
