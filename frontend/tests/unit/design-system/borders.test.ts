import { describe, it, expect } from 'vitest';
import { borderWidth, borderRadius, borderSemantics } from '../../../src/design-system/tokens/borders';

describe('borderWidth', () => {
  it('none is 0', () => {
    expect(borderWidth.none).toBe(0);
  });

  it('thin is 1px', () => {
    expect(borderWidth.thin).toBe(1);
  });

  it('medium is 2px', () => {
    expect(borderWidth.medium).toBe(2);
  });
});

describe('borderRadius', () => {
  it('none is 0', () => {
    expect(borderRadius.none).toBe(0);
  });

  it('full is 9999 (pill shape)', () => {
    expect(borderRadius.full).toBe(9999);
  });

  it('scale increases from xs to 4xl', () => {
    const order = [
      borderRadius.xs,
      borderRadius.sm,
      borderRadius.default,
      borderRadius.md,
      borderRadius.lg,
      borderRadius.xl,
      borderRadius['2xl'],
      borderRadius['3xl'],
      borderRadius['4xl'],
    ];
    for (let i = 1; i < order.length; i++) {
      expect(order[i]!).toBeGreaterThan(order[i - 1]!);
    }
  });
});

describe('borderSemantics.radius', () => {
  it('button is 12px', () => {
    expect(borderSemantics.radius.button).toBe(12);
  });

  it('input is 8px', () => {
    expect(borderSemantics.radius.input).toBe(8);
  });

  it('card is 12px', () => {
    expect(borderSemantics.radius.card).toBe(12);
  });

  it('dialog is 16px (larger than card)', () => {
    expect(borderSemantics.radius.dialog).toBeGreaterThanOrEqual(borderSemantics.radius.card);
  });

  it('chip is full (pill)', () => {
    expect(borderSemantics.radius.chip).toBe(borderRadius.full);
  });

  it('avatar is full (circular)', () => {
    expect(borderSemantics.radius.avatar).toBe(borderRadius.full);
  });

  it('has tooltip, menu, tab, bubble, code', () => {
    expect(borderSemantics.radius.tooltip).toBeDefined();
    expect(borderSemantics.radius.menu).toBeDefined();
    expect(borderSemantics.radius.tab).toBeDefined();
    expect(borderSemantics.radius.bubble).toBeDefined();
    expect(borderSemantics.radius.code).toBeDefined();
  });
});

describe('borderSemantics.width', () => {
  it('default is 1px (thin)', () => {
    expect(borderSemantics.width.default).toBe(borderWidth.thin);
  });

  it('focus is 2px (medium)', () => {
    expect(borderSemantics.width.focus).toBe(borderWidth.medium);
  });

  it('divider is 1px', () => {
    expect(borderSemantics.width.divider).toBe(1);
  });
});
