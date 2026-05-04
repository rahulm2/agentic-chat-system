import { describe, it, expect } from 'vitest';
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typographyPresets,
} from '../../../src/design-system/tokens/typography';

describe('fontFamily', () => {
  it('body includes Inter', () => {
    expect(fontFamily.body).toContain('Inter');
  });

  it('mono includes SFMono-Regular', () => {
    expect(fontFamily.mono).toContain('SFMono-Regular');
  });
});

describe('fontSize', () => {
  it('md is 0.875rem (14px)', () => {
    expect(fontSize.md).toBe('0.875rem');
  });

  it('lg is 1rem (16px)', () => {
    expect(fontSize.lg).toBe('1rem');
  });

  it('scale is increasing from 2xs to 6xl', () => {
    const sizes = [
      fontSize['2xs'],
      fontSize.xs,
      fontSize.sm,
      fontSize.md,
      fontSize.lg,
      fontSize.xl,
      fontSize['2xl'],
      fontSize['3xl'],
      fontSize['4xl'],
      fontSize['5xl'],
      fontSize['6xl'],
    ];
    // All should be rem strings
    for (const s of sizes) {
      expect(s).toMatch(/^\d+(\.\d+)?rem$/);
    }
    // Convert to numbers and verify increasing order
    const nums = sizes.map((s) => parseFloat(s));
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]!).toBeGreaterThan(nums[i - 1]!);
    }
  });
});

describe('fontWeight', () => {
  it('regular is 400', () => {
    expect(fontWeight.regular).toBe(400);
  });

  it('semibold is 600', () => {
    expect(fontWeight.semibold).toBe(600);
  });

  it('bold is 700', () => {
    expect(fontWeight.bold).toBe(700);
  });
});

describe('lineHeight', () => {
  it('normal is 1.5', () => {
    expect(lineHeight.normal).toBe(1.5);
  });

  it('tight is less than normal', () => {
    expect(lineHeight.tight).toBeLessThan(lineHeight.normal);
  });
});

describe('letterSpacing', () => {
  it('normal is 0em', () => {
    expect(letterSpacing.normal).toBe('0em');
  });
});

describe('typographyPresets', () => {
  describe('display', () => {
    it('lg has fontSize, fontWeight, lineHeight, letterSpacing', () => {
      expect(typographyPresets.display.lg.fontSize).toBeDefined();
      expect(typographyPresets.display.lg.fontWeight).toBe(fontWeight.bold);
      expect(typographyPresets.display.lg.lineHeight).toBeDefined();
      expect(typographyPresets.display.lg.letterSpacing).toBeDefined();
    });

    it('sm is smaller than lg', () => {
      const lgSize = parseFloat(typographyPresets.display.lg.fontSize);
      const smSize = parseFloat(typographyPresets.display.sm.fontSize);
      expect(lgSize).toBeGreaterThan(smSize);
    });
  });

  describe('heading', () => {
    const sizes = ['xl', 'lg', 'md', 'sm', 'xs'] as const;

    it.each(sizes)('%s has fontSize, fontWeight, lineHeight', (size) => {
      const preset = typographyPresets.heading[size];
      expect(preset.fontSize).toBeDefined();
      expect(preset.fontWeight).toBe(fontWeight.semibold);
      expect(preset.lineHeight).toBeDefined();
    });

    it('xl is largest heading', () => {
      const xlSize = parseFloat(typographyPresets.heading.xl.fontSize);
      const xsSize = parseFloat(typographyPresets.heading.xs.fontSize);
      expect(xlSize).toBeGreaterThan(xsSize);
    });
  });

  describe('body', () => {
    const sizes = ['lg', 'md', 'sm', 'xs'] as const;

    it.each(sizes)('%s has regular weight', (size) => {
      expect(typographyPresets.body[size].fontWeight).toBe(fontWeight.regular);
    });
  });

  describe('label', () => {
    const sizes = ['lg', 'md', 'sm', 'xs'] as const;

    it.each(sizes)('%s has medium weight', (size) => {
      expect(typographyPresets.label[size].fontWeight).toBe(fontWeight.medium);
    });
  });

  describe('code', () => {
    it('md uses mono font', () => {
      expect(typographyPresets.code.md.fontFamily).toBe(fontFamily.mono);
    });

    it('sm uses mono font', () => {
      expect(typographyPresets.code.sm.fontFamily).toBe(fontFamily.mono);
    });
  });
});
