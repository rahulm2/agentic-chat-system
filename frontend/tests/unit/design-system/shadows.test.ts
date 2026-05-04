import { describe, it, expect } from 'vitest';
import { shadows, shadowSemantics } from '../../../src/design-system/tokens/shadows';

describe('shadows', () => {
  it('none is the string "none"', () => {
    expect(shadows.none).toBe('none');
  });

  it('xs through 2xl are valid box-shadow strings', () => {
    const scale = [shadows.xs, shadows.sm, shadows.md, shadows.lg, shadows.xl, shadows['2xl']];
    for (const s of scale) {
      expect(s).toContain('rgba');
      expect(s).toContain('px');
    }
  });
});

describe('shadowSemantics', () => {
  it('card uses shadows.sm', () => {
    expect(shadowSemantics.card).toBe(shadows.sm);
  });

  it('cardHover uses shadows.md', () => {
    expect(shadowSemantics.cardHover).toBe(shadows.md);
  });

  it('cardHover is different from card (more prominent)', () => {
    expect(shadowSemantics.cardHover).not.toBe(shadowSemantics.card);
  });

  it('modal uses shadows.2xl (highest common elevation)', () => {
    expect(shadowSemantics.modal).toBe(shadows['2xl']);
  });

  it('dialog equals modal', () => {
    expect(shadowSemantics.dialog).toBe(shadowSemantics.modal);
  });

  it('dropdown uses shadows.lg', () => {
    expect(shadowSemantics.dropdown).toBe(shadows.lg);
  });

  it('inputFocus is a blue glow shadow', () => {
    expect(shadowSemantics.inputFocus).toContain('37, 99, 235');
  });

  it('inputFocusError is a red glow shadow', () => {
    expect(shadowSemantics.inputFocusError).toContain('239, 68, 68');
  });

  it('has nav, button, tooltip, popover, bubble', () => {
    expect(shadowSemantics.nav).toBeDefined();
    expect(shadowSemantics.button).toBeDefined();
    expect(shadowSemantics.tooltip).toBeDefined();
    expect(shadowSemantics.popover).toBeDefined();
    expect(shadowSemantics.bubble).toBeDefined();
  });
});
