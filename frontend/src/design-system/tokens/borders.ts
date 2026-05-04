/**
 * Border Design Tokens
 *
 * Agentic Chat design language.
 * Defines border widths, styles, and radii.
 *
 * @ai-context Use borderSemantics for component-specific border radius.
 */

// ============================================================================
// Border Width Tokens
// ============================================================================

export const borderWidth = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 3,
  heavy: 4,
} as const;

// ============================================================================
// Border Radius Tokens
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  default: 6,
  md: 8,
  lg: 10,
  xl: 12,
  "2xl": 16,
  "3xl": 20,
  "4xl": 24,
  full: 9999,
} as const;

// ============================================================================
// Semantic Border Tokens
// ============================================================================
// @ai-context ALWAYS use these for component-specific border radius.
// ============================================================================

export const borderSemantics = {
  radius: {
    /** 12px — all buttons */
    button: borderRadius.xl,
    /** 8px — all form inputs */
    input: borderRadius.md,
    /** 12px — cards and containers */
    card: borderRadius.xl,
    /** 16px — modals and dialogs */
    dialog: borderRadius["2xl"],
    /** 9999px — chips, badges, pills */
    chip: borderRadius.full,
    /** 9999px — avatars (circular) */
    avatar: borderRadius.full,
    /** 8px — tooltips */
    tooltip: borderRadius.md,
    /** 8px — dropdown menus */
    menu: borderRadius.md,
    /** 8px — tab items */
    tab: borderRadius.md,
    /** 12px — message bubbles */
    bubble: borderRadius.xl,
    /** 8px — code blocks */
    code: borderRadius.md,
  },

  width: {
    /** 1px — standard borders */
    default: borderWidth.thin,
    /** 2px — focus rings */
    focus: borderWidth.medium,
    /** 2px — selected/active states */
    active: borderWidth.medium,
    /** 1px — dividers */
    divider: borderWidth.thin,
  },
} as const;

export type BorderWidth = typeof borderWidth;
export type BorderRadius = typeof borderRadius;
export type BorderSemantics = typeof borderSemantics;
