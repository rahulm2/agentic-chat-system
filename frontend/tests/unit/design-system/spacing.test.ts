import { describe, it, expect } from 'vitest';
import { spacingScale, spacing } from '../../../src/design-system/tokens/spacing';

describe('spacingScale', () => {
  it('is 0px at 0', () => {
    expect(spacingScale[0]).toBe(0);
  });

  it('4px base unit at 1', () => {
    expect(spacingScale[1]).toBe(4);
  });

  it('8px at 2', () => {
    expect(spacingScale[2]).toBe(8);
  });

  it('16px at 4', () => {
    expect(spacingScale[4]).toBe(16);
  });

  it('24px at 6', () => {
    expect(spacingScale[6]).toBe(24);
  });

  it('all values are non-negative integers', () => {
    for (const val of Object.values(spacingScale)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});

describe('spacing.component', () => {
  it('has xxs, xs, sm, md, lg, xl, 2xl', () => {
    expect(spacing.component.xxs).toBeDefined();
    expect(spacing.component.xs).toBeDefined();
    expect(spacing.component.sm).toBeDefined();
    expect(spacing.component.md).toBeDefined();
    expect(spacing.component.lg).toBeDefined();
    expect(spacing.component.xl).toBeDefined();
    expect(spacing.component['2xl']).toBeDefined();
  });

  it('values increase from xxs to 2xl', () => {
    const { xxs, xs, sm, md, lg, xl } = spacing.component;
    expect(xxs).toBeLessThan(xs);
    expect(xs).toBeLessThan(sm);
    expect(sm).toBeLessThan(md);
    expect(md).toBeLessThan(lg);
    expect(lg).toBeLessThan(xl);
  });
});

describe('spacing.gap', () => {
  it('has xs, sm, md, lg, xl, 2xl', () => {
    expect(spacing.gap.xs).toBeDefined();
    expect(spacing.gap.sm).toBeDefined();
    expect(spacing.gap.md).toBeDefined();
    expect(spacing.gap.lg).toBeDefined();
    expect(spacing.gap.xl).toBeDefined();
    expect(spacing.gap['2xl']).toBeDefined();
  });

  it('values increase', () => {
    const { xs, sm, md, lg, xl } = spacing.gap;
    expect(xs).toBeLessThanOrEqual(sm);
    expect(sm).toBeLessThanOrEqual(md);
    expect(md).toBeLessThanOrEqual(lg);
    expect(lg).toBeLessThanOrEqual(xl);
  });
});

describe('spacing.layout', () => {
  it('has xs, sm, md, lg, xl, 2xl', () => {
    expect(spacing.layout.xs).toBeDefined();
    expect(spacing.layout.sm).toBeDefined();
    expect(spacing.layout.md).toBeDefined();
    expect(spacing.layout.lg).toBeDefined();
    expect(spacing.layout.xl).toBeDefined();
    expect(spacing.layout['2xl']).toBeDefined();
  });
});

describe('spacing.chat', () => {
  it('has messageSameGap, messageGroupGap, bubblePaddingY, bubblePaddingX, inputPadding, headerOffset', () => {
    expect(spacing.chat.messageSameGap).toBeDefined();
    expect(spacing.chat.messageGroupGap).toBeDefined();
    expect(spacing.chat.bubblePaddingY).toBeDefined();
    expect(spacing.chat.bubblePaddingX).toBeDefined();
    expect(spacing.chat.inputPadding).toBeDefined();
    expect(spacing.chat.headerOffset).toBeDefined();
  });

  it('messageGroupGap is larger than messageSameGap', () => {
    expect(spacing.chat.messageGroupGap).toBeGreaterThan(spacing.chat.messageSameGap);
  });
});
