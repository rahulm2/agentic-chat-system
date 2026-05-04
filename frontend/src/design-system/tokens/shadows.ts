/**
 * Shadow Design Tokens
 *
 * Agentic Chat design language.
 * Subtle shadows for depth; floating elements use stronger shadows.
 *
 * @ai-context ALWAYS use semantic shadow tokens (shadowSemantics) for UI elements.
 */

// ============================================================================
// Shadow Scale
// ============================================================================

export const shadows = {
  none: "none",
  xs: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
  sm: "0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px -1px rgba(16, 24, 40, 0.1)",
  md: "0px 4px 6px -1px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.1)",
  lg: "0px 10px 15px -3px rgba(16, 24, 40, 0.1), 0px 4px 6px -4px rgba(16, 24, 40, 0.1)",
  xl: "0px 20px 25px -5px rgba(16, 24, 40, 0.1), 0px 8px 10px -6px rgba(16, 24, 40, 0.1)",
  "2xl": "0px 25px 50px -12px rgba(16, 24, 40, 0.25)",
} as const;

// ============================================================================
// Semantic Shadow Tokens
// ============================================================================

export const shadowSemantics = {
  /** Default shadow for cards and containers */
  card: shadows.sm,
  /** Hover state for cards */
  cardHover: shadows.md,
  /** Shadow for dropdown menus */
  dropdown: shadows.lg,
  /** Shadow for popovers */
  popover: shadows.lg,
  /** Shadow for modals */
  modal: shadows["2xl"],
  /** Shadow for dialogs */
  dialog: shadows["2xl"],
  /** Shadow for tooltips */
  tooltip: shadows.md,
  /** Shadow for primary buttons */
  button: shadows.xs,
  /** Focus ring for form inputs (blue glow) */
  inputFocus: "0px 0px 0px 4px rgba(37, 99, 235, 0.24)",
  /** Focus ring for error state inputs (red glow) */
  inputFocusError: "0px 0px 0px 4px rgba(239, 68, 68, 0.24)",
  /** Navigation bars and headers */
  nav: shadows.xs,
  /** Message bubble shadow for AI messages */
  bubble: shadows.xs,
} as const;

export type Shadows = typeof shadows;
export type ShadowSemantics = typeof shadowSemantics;
