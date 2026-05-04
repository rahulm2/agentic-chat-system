/**
 * Spacing Design Tokens
 *
 * Based on 4px grid system for consistency.
 * Aligns with MUI's default spacing multiplier (theme.spacing(1) = 8px).
 *
 * @ai-context ALWAYS use semantic spacing tokens over raw scale values.
 */

// ============================================================================
// Spacing Scale (4px base unit)
// ============================================================================

export const spacingScale = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ============================================================================
// Semantic Spacing Tokens
// ============================================================================

export const spacing = {
  /**
   * Component Internal Spacing
   * @ai-usage Padding and gaps INSIDE components
   */
  component: {
    /** 4px — badge padding, tightest elements */
    xxs: spacingScale[1],
    /** 8px — button vertical padding, compact inputs */
    xs: spacingScale[2],
    /** 12px — button horizontal padding, standard inputs */
    sm: spacingScale[3],
    /** 16px — default card padding */
    md: spacingScale[4],
    /** 20px — comfortable card padding */
    lg: spacingScale[5],
    /** 24px — generous card/section padding */
    xl: spacingScale[6],
    /** 32px — large section padding */
    "2xl": spacingScale[8],
  },

  /**
   * Gap Spacing
   * @ai-usage flex/grid gaps between elements
   */
  gap: {
    /** 4px — tightest gap between inline items */
    xs: spacingScale[1],
    /** 8px — compact gap (icon + label, inline badge) */
    sm: spacingScale[2],
    /** 12px — standard gap between form fields */
    md: spacingScale[3],
    /** 16px — comfortable gap between cards */
    lg: spacingScale[4],
    /** 24px — generous gap between sections */
    xl: spacingScale[6],
    /** 32px — large gap between major sections */
    "2xl": spacingScale[8],
  },

  /**
   * Layout Spacing
   * @ai-usage Page-level margins and padding
   */
  layout: {
    /** 16px — mobile page margin */
    xs: spacingScale[4],
    /** 24px — standard page padding */
    sm: spacingScale[6],
    /** 32px — comfortable page padding */
    md: spacingScale[8],
    /** 48px — large section spacing */
    lg: spacingScale[12],
    /** 64px — page-level section separation */
    xl: spacingScale[16],
    /** 80px — major section separation */
    "2xl": spacingScale[20],
  },

  /**
   * Chat-specific Spacing
   * @ai-usage Message bubbles, chat input, message list
   */
  chat: {
    /** 8px — gap between adjacent messages from same sender */
    messageSameGap: spacingScale[2],
    /** 16px — gap between messages from different senders */
    messageGroupGap: spacingScale[4],
    /** 12px 16px — message bubble padding */
    bubblePaddingY: spacingScale[3],
    bubblePaddingX: spacingScale[4],
    /** 16px — chat input container padding */
    inputPadding: spacingScale[4],
    /** 20px — chat header height offset */
    headerOffset: spacingScale[5],
  },
} as const;

export type SpacingScale = typeof spacingScale;
export type Spacing = typeof spacing;
