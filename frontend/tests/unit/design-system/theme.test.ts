import { describe, it, expect } from 'vitest';
import { createTheme } from '../../../src/design-system/theme/create-theme';
import { colorSemantics, borderSemantics } from '../../../src/design-system/tokens';

describe('createTheme', () => {
  it('creates a theme with default light mode', () => {
    const theme = createTheme();
    expect(theme.palette.mode).toBe('light');
  });

  it('creates a dark theme when paletteMode is dark', () => {
    const theme = createTheme({ paletteMode: 'dark' });
    expect(theme.palette.mode).toBe('dark');
  });

  describe('light theme palette', () => {
    const theme = createTheme({ paletteMode: 'light' });

    it('primary.main matches interactive.primary token', () => {
      expect(theme.palette.primary.main).toBe(colorSemantics.interactive.primary);
    });

    it('secondary.main matches brand.secondary token', () => {
      expect(theme.palette.secondary.main).toBe(colorSemantics.brand.secondary);
    });

    it('background.default is white', () => {
      expect(theme.palette.background.default).toBe('#FFFFFF');
    });

    it('background.paper is white', () => {
      expect(theme.palette.background.paper).toBe('#FFFFFF');
    });

    it('text.primary matches text.primary token', () => {
      expect(theme.palette.text.primary).toBe(colorSemantics.text.primary);
    });

    it('divider matches border.default token', () => {
      expect(theme.palette.divider).toBe(colorSemantics.border.default);
    });

    it('error.main is set', () => {
      expect(theme.palette.error.main).toBe(colorSemantics.status.error.main);
    });

    it('warning.main is set', () => {
      expect(theme.palette.warning.main).toBe(colorSemantics.status.warning.main);
    });

    it('info.main is set', () => {
      expect(theme.palette.info.main).toBe(colorSemantics.status.info.main);
    });

    it('success.main is set', () => {
      expect(theme.palette.success.main).toBe(colorSemantics.status.success.main);
    });
  });

  describe('dark theme palette', () => {
    const theme = createTheme({ paletteMode: 'dark' });

    it('background.default is dark', () => {
      // Dark background should not be white
      expect(theme.palette.background.default).not.toBe('#FFFFFF');
    });
  });

  describe('typography', () => {
    const theme = createTheme();

    it('fontFamily includes Inter', () => {
      expect(theme.typography.fontFamily).toContain('Inter');
    });

    it('button text is not transformed to uppercase', () => {
      const buttonTypo = (theme.typography as unknown as Record<string, Record<string, unknown>>)['button'];
      expect(buttonTypo?.textTransform).toBe('none');
    });

    it('h1 through h6 are defined', () => {
      for (const variant of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
        expect(theme.typography[variant]).toBeDefined();
        expect(theme.typography[variant].fontWeight).toBeGreaterThanOrEqual(600);
      }
    });
  });

  describe('shape', () => {
    const theme = createTheme();

    it('borderRadius matches input token', () => {
      expect(theme.shape.borderRadius).toBe(borderSemantics.radius.input);
    });
  });

  describe('component overrides', () => {
    const theme = createTheme();

    it('MuiButton override is defined', () => {
      expect(theme.components?.MuiButton).toBeDefined();
    });

    it('MuiTextField override is defined', () => {
      expect(theme.components?.MuiTextField).toBeDefined();
    });

    it('MuiCard override is defined', () => {
      expect(theme.components?.MuiCard).toBeDefined();
    });

    it('MuiDialog override is defined', () => {
      expect(theme.components?.MuiDialog).toBeDefined();
    });

    it('MuiChip override is defined', () => {
      expect(theme.components?.MuiChip).toBeDefined();
    });

    it('MuiTooltip override is defined', () => {
      expect(theme.components?.MuiTooltip).toBeDefined();
    });

    it('MuiAppBar override is defined', () => {
      expect(theme.components?.MuiAppBar).toBeDefined();
    });
  });
});
