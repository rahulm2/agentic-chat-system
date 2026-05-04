/**
 * Typography Design Tokens
 *
 * Agentic Chat design language.
 * Inter for all text — clean, readable, optimized for screens.
 *
 * @ai-context Use typographyPresets for complete text styles.
 * Use individual tokens (fontSize, fontWeight) only for custom combinations.
 */

// ============================================================================
// Font Family Tokens
// ============================================================================

export const fontFamily = {
  /** Primary font for all text — Inter */
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  /** Monospace font for code snippets, IDs */
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
} as const;

// ============================================================================
// Font Size Tokens (rem based, 16px base)
// ============================================================================

export const fontSize = {
  /** 11px — very compact labels */
  "2xs": "0.6875rem",
  /** 12px — small labels, badges, captions */
  xs: "0.75rem",
  /** 13px — dense UI text */
  sm: "0.8125rem",
  /** 14px — default body text */
  md: "0.875rem",
  /** 16px — slightly larger body */
  lg: "1rem",
  /** 18px — small headings, emphasized body */
  xl: "1.125rem",
  /** 20px — section headings */
  "2xl": "1.25rem",
  /** 24px — page headings */
  "3xl": "1.5rem",
  /** 30px — large headings */
  "4xl": "1.875rem",
  /** 36px — display headings */
  "5xl": "2.25rem",
  /** 48px — hero headings */
  "6xl": "3rem",
} as const;

// ============================================================================
// Font Weight Tokens
// ============================================================================

export const fontWeight = {
  /** 300 — light, for large display text */
  light: 300,
  /** 400 — normal body text */
  regular: 400,
  /** 500 — slightly emphasized */
  medium: 500,
  /** 600 — headings, emphasized labels */
  semibold: 600,
  /** 700 — strong emphasis, bold headings */
  bold: 700,
} as const;

// ============================================================================
// Line Height Tokens
// ============================================================================

export const lineHeight = {
  /** 1 — tight, single-line display text */
  none: 1,
  /** 1.2 — dense headings */
  tight: 1.2,
  /** 1.375 — compact headings */
  snug: 1.375,
  /** 1.5 — standard body text */
  normal: 1.5,
  /** 1.625 — relaxed reading */
  relaxed: 1.625,
  /** 2 — very loose */
  loose: 2,
} as const;

// ============================================================================
// Letter Spacing Tokens
// ============================================================================

export const letterSpacing = {
  /** -0.05em — tight headings */
  tighter: "-0.05em",
  /** -0.025em — slightly tight */
  tight: "-0.025em",
  /** 0 — default */
  normal: "0em",
  /** 0.025em — slightly wide */
  wide: "0.025em",
  /** 0.05em — wide labels, badges */
  wider: "0.05em",
  /** 0.1em — very wide all-caps labels */
  widest: "0.1em",
} as const;

// ============================================================================
// Typography Presets (complete text styles)
// ============================================================================
// @ai-context ALWAYS use these presets in components for consistent typography.
// They combine fontSize + fontWeight + lineHeight into ready-to-use styles.
// ============================================================================

export const typographyPresets = {
  /**
   * Display Headings — for hero sections, page titles
   */
  display: {
    /** 48px, bold, tight */
    lg: { fontSize: fontSize["6xl"], fontWeight: fontWeight.bold, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.tight },
    /** 36px, bold, tight */
    md: { fontSize: fontSize["5xl"], fontWeight: fontWeight.bold, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.tight },
    /** 30px, semibold, snug */
    sm: { fontSize: fontSize["4xl"], fontWeight: fontWeight.semibold, lineHeight: lineHeight.snug, letterSpacing: letterSpacing.tight },
  },

  /**
   * Headings — for page sections and cards
   */
  heading: {
    /** 24px, semibold — page-level headings */
    xl: { fontSize: fontSize["3xl"], fontWeight: fontWeight.semibold, lineHeight: lineHeight.snug },
    /** 20px, semibold — section headings */
    lg: { fontSize: fontSize["2xl"], fontWeight: fontWeight.semibold, lineHeight: lineHeight.snug },
    /** 18px, semibold — card headings */
    md: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, lineHeight: lineHeight.snug },
    /** 16px, semibold — sub-section headings */
    sm: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: lineHeight.normal },
    /** 14px, semibold — small headings */
    xs: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, lineHeight: lineHeight.normal },
  },

  /**
   * Body Text — for general content
   */
  body: {
    /** 16px, regular — large body */
    lg: { fontSize: fontSize.lg, fontWeight: fontWeight.regular, lineHeight: lineHeight.relaxed },
    /** 14px, regular — default body */
    md: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: lineHeight.normal },
    /** 13px, regular — dense UI body */
    sm: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: lineHeight.normal },
    /** 12px, regular — very compact body */
    xs: { fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: lineHeight.normal },
  },

  /**
   * Labels — for form labels, table headers, button text
   */
  label: {
    /** 14px, medium — standard labels */
    lg: { fontSize: fontSize.md, fontWeight: fontWeight.medium, lineHeight: lineHeight.normal },
    /** 13px, medium — compact labels */
    md: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: lineHeight.normal },
    /** 12px, medium — small labels, captions */
    sm: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, lineHeight: lineHeight.normal },
    /** 11px, medium — badge text, very compact */
    xs: { fontSize: fontSize["2xs"], fontWeight: fontWeight.medium, lineHeight: lineHeight.normal },
  },

  /**
   * Code — for code snippets, message IDs, technical data
   */
  code: {
    /** 14px mono */
    md: { fontSize: fontSize.md, fontFamily: fontFamily.mono, lineHeight: lineHeight.relaxed },
    /** 12px mono */
    sm: { fontSize: fontSize.xs, fontFamily: fontFamily.mono, lineHeight: lineHeight.normal },
  },
} as const;

export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
export type TypographyPresets = typeof typographyPresets;
