import { describe, it, expect } from 'vitest';
import { STEP_HELP, FAQ } from '../help';
import { WIZARD_STEPS } from '../constants';

describe('ajuda', () => {
  it('há uma orientação para cada passo do wizard', () => {
    expect(STEP_HELP).toHaveLength(WIZARD_STEPS.length);
    for (const h of STEP_HELP) {
      expect(h.goal.length).toBeGreaterThan(10);
      expect(h.how.length).toBeGreaterThan(0);
      expect(h.tip.length).toBeGreaterThan(10);
    }
  });
  it('FAQ sem perguntas repetidas', () => {
    expect(new Set(FAQ.map((f) => f.q)).size).toBe(FAQ.length);
  });
});
