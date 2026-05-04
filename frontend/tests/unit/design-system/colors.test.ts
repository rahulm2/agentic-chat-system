import { describe, it, expect } from 'vitest';
import {
  colorPrimitives,
  colorSemantics,
  colorAlphas,
} from '../../../src/design-system/tokens/colors';

describe('colorPrimitives', () => {
  it('defines a complete neutral scale from 50 to 900', () => {
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
    for (const step of steps) {
      expect(colorPrimitives.neutral[step]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('defines blue scale with 500 as primary interactive blue', () => {
    expect(colorPrimitives.blue[500]).toBe('#2563EB');
  });

  it('defines teal scale with 500 as secondary accent', () => {
    expect(colorPrimitives.teal[500]).toBe('#0891B2');
  });

  it('defines red, orange, green, cyan, purple scales', () => {
    expect(colorPrimitives.red[500]).toMatch(/^#/);
    expect(colorPrimitives.orange[500]).toMatch(/^#/);
    expect(colorPrimitives.green[500]).toMatch(/^#/);
    expect(colorPrimitives.cyan[500]).toMatch(/^#/);
    expect(colorPrimitives.purple[500]).toMatch(/^#/);
  });

  it('defines white, black, transparent', () => {
    expect(colorPrimitives.white).toBe('#FFFFFF');
    expect(colorPrimitives.black).toBe('#000000');
    expect(colorPrimitives.transparent).toBe('transparent');
  });
});

describe('colorSemantics', () => {
  describe('text', () => {
    it('has primary, secondary, tertiary, disabled, inverse, muted, body, placeholder', () => {
      expect(colorSemantics.text.primary).toBeDefined();
      expect(colorSemantics.text.secondary).toBeDefined();
      expect(colorSemantics.text.tertiary).toBeDefined();
      expect(colorSemantics.text.disabled).toBeDefined();
      expect(colorSemantics.text.inverse).toBe('#FFFFFF');
      expect(colorSemantics.text.muted).toBeDefined();
      expect(colorSemantics.text.body).toBeDefined();
      expect(colorSemantics.text.placeholder).toBeDefined();
    });

    it('primary text is the darkest neutral', () => {
      expect(colorSemantics.text.primary).toBe(colorPrimitives.neutral[900]);
    });
  });

  describe('background', () => {
    it('has default, paper, subtle, muted, inverse, disabled', () => {
      expect(colorSemantics.background.default).toBe('#FFFFFF');
      expect(colorSemantics.background.paper).toBe('#FFFFFF');
      expect(colorSemantics.background.subtle).toBeDefined();
      expect(colorSemantics.background.muted).toBeDefined();
      expect(colorSemantics.background.inverse).toBeDefined();
      expect(colorSemantics.background.disabled).toContain('rgba');
    });
  });

  describe('border', () => {
    it('has default, subtle, strong, focus, disabled', () => {
      expect(colorSemantics.border.default).toBeDefined();
      expect(colorSemantics.border.subtle).toBeDefined();
      expect(colorSemantics.border.strong).toBeDefined();
      expect(colorSemantics.border.focus).toBe(colorPrimitives.blue[500]);
      expect(colorSemantics.border.disabled).toBeDefined();
    });
  });

  describe('interactive', () => {
    it('has primary, primaryHover, primaryActive, secondary, ghost, ghostHover', () => {
      expect(colorSemantics.interactive.primary).toBe(colorPrimitives.blue[500]);
      expect(colorSemantics.interactive.primaryHover).toBe(colorPrimitives.blue[600]);
      expect(colorSemantics.interactive.primaryActive).toBe(colorPrimitives.blue[700]);
      expect(colorSemantics.interactive.secondary).toBeDefined();
      expect(colorSemantics.interactive.ghost).toBe('transparent');
      expect(colorSemantics.interactive.ghostHover).toBeDefined();
    });
  });

  describe('status', () => {
    const statuses = ['success', 'error', 'warning', 'info'] as const;

    it.each(statuses)('%s has main, light, lightest, dark, darkest, contrast', (status) => {
      const s = colorSemantics.status[status];
      expect(s.main).toBeDefined();
      expect(s.light).toBeDefined();
      expect(s.lightest).toBeDefined();
      expect(s.dark).toBeDefined();
      expect(s.darkest).toBeDefined();
      expect(s.contrast).toBe('#FFFFFF');
    });
  });

  describe('brand', () => {
    it('has primary, secondary, accent, lightest', () => {
      expect(colorSemantics.brand.primary).toBe(colorPrimitives.blue[500]);
      expect(colorSemantics.brand.secondary).toBe(colorPrimitives.teal[500]);
      expect(colorSemantics.brand.accent).toBeDefined();
      expect(colorSemantics.brand.lightest).toBeDefined();
    });
  });

  describe('ai', () => {
    it('has messageBg, messageBorder, stream, toolBg, toolBorder, reasoningBg, reasoningBorder', () => {
      expect(colorSemantics.ai.messageBg).toBeDefined();
      expect(colorSemantics.ai.messageBorder).toBeDefined();
      expect(colorSemantics.ai.stream).toBeDefined();
      expect(colorSemantics.ai.toolBg).toBeDefined();
      expect(colorSemantics.ai.toolBorder).toBeDefined();
      expect(colorSemantics.ai.reasoningBg).toBeDefined();
      expect(colorSemantics.ai.reasoningBorder).toBeDefined();
    });
  });

  describe('icon', () => {
    it('has primary, secondary, disabled, inverse', () => {
      expect(colorSemantics.icon.primary).toBeDefined();
      expect(colorSemantics.icon.secondary).toBeDefined();
      expect(colorSemantics.icon.disabled).toBeDefined();
      expect(colorSemantics.icon.inverse).toBe('#FFFFFF');
    });
  });

  describe('overlay', () => {
    it('has backdrop, medium, subtle, strong, frosted', () => {
      expect(colorSemantics.overlay.backdrop).toBe('rgba(0,0,0,0.5)');
      expect(colorSemantics.overlay.medium).toBeDefined();
      expect(colorSemantics.overlay.subtle).toBeDefined();
      expect(colorSemantics.overlay.strong).toBeDefined();
      expect(colorSemantics.overlay.frosted).toBeDefined();
    });
  });
});

describe('colorAlphas', () => {
  it('has alpha4, alpha8, alpha12, alpha30, alpha50', () => {
    expect(colorAlphas.alpha4).toContain('0.04');
    expect(colorAlphas.alpha8).toContain('0.08');
    expect(colorAlphas.alpha12).toContain('0.12');
    expect(colorAlphas.alpha30).toContain('0.3');
    expect(colorAlphas.alpha50).toContain('0.5');
  });
});
