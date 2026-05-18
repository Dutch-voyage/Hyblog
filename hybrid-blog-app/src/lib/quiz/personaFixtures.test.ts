import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './questions';
import { PUBLIC_PERSONA_FIXTURES, evaluatePersona } from './personaFixtures';

describe('public-persona quiz calibration', () => {
  it('keeps every fixture synchronized with the current question set', () => {
    const questionIds = new Set(QUESTIONS.map((question) => question.id));

    for (const fixture of PUBLIC_PERSONA_FIXTURES) {
      expect(Object.keys(fixture.answers).sort()).toEqual([...questionIds].sort());
    }
  });

  it('matches public-persona caricatures to their intended archetypes', () => {
    for (const fixture of PUBLIC_PERSONA_FIXTURES) {
      const result = evaluatePersona(fixture);
      expect(result.type, `${fixture.label}: ${JSON.stringify(result.topMatches)}`).toBe(
        fixture.expectedType,
      );
    }
  });
});
