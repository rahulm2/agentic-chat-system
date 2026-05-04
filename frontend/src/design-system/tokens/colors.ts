/**
 * Color Design Tokens
 *
 * Agentic Chat design language — cool neutral scale with blue/teal brand accent.
 *
 * @ai-context ALWAYS use semantic tokens (colorSemantics) over primitive tokens (colorPrimitives).
 * Primitive tokens are building blocks - never use them directly in components.
 */

// ============================================================================
// Primitive Color Tokens (Scale-based)
// ============================================================================
// @ai-warning NEVER use primitive colors directly in components.
// These are building blocks for semantic tokens only.
// ============================================================================

export const colorPrimitives = {
  neutral: {
    50: "#F8F9FA",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D2D6DB",
    400: "#9DA4AE",
    500: "#6C737F",
    600: "#4D5761",
    700: "#2F3746",
    800: "#1C2536",
    900: "#111927",
  },

  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    /** #2563EB - Primary interactive blue */
    500: "#2563EB",
    600: "#1D4ED8",
    700: "#1E40AF",
    800: "#1E3A8A",
    900: "#1E3356",
  },

  teal: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    /** #0891B2 - Secondary teal accent */
    500: "#0891B2",
    600: "#0E7490",
    700: "#155E75",
    800: "#164E63",
    900: "#083344",
  },

  green: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#16A34A",
    600: "#15803D",
    700: "#166534",
    800: "#14532D",
    900: "#052E16",
  },

  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },

  orange: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  cyan: {
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#A5F3FC",
    300: "#67E8F9",
    400: "#22D3EE",
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },

  purple: {
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D5FF",
    300: "#D8B4FE",
    400: "#C084FC",
    500: "#A855F7",
    600: "#9333EA",
    700: "#7C3AED",
    800: "#6D28D9",
    900: "#4C1D95",
  },

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

// ============================================================================
// Semantic Color Tokens
// ============================================================================
// @ai-context ALWAYS use these semantic tokens in components.
// They describe PURPOSE and INTENT, not just appearance.
// ============================================================================

export const colorSemantics = {
  /**
   * Text Colors
   * @ai-usage Use for ALL text rendering
   */
  text: {
    /** Main headings, body text, important content — #111927 */
    primary: colorPrimitives.neutral[900],
    /** Supporting text, descriptions — #6C737F */
    secondary: colorPrimitives.neutral[500],
    /** Muted text, fine print — #6C737F */
    tertiary: colorPrimitives.neutral[500],
    /** Text on disabled elements — #9DA4AE */
    disabled: colorPrimitives.neutral[400],
    /** Text on dark backgrounds — #FFFFFF */
    inverse: colorPrimitives.white,
    /** Slightly emphasized secondary text — #2F3746 */
    muted: colorPrimitives.neutral[700],
    /** Default body text — #4D5761 */
    body: colorPrimitives.neutral[600],
    /** Input placeholder text — #9DA4AE */
    placeholder: colorPrimitives.neutral[400],
  },

  /**
   * Background Colors
   * @ai-usage Use for surface and container backgrounds
   */
  background: {
    /** Main page background, card backgrounds — #FFFFFF */
    default: colorPrimitives.white,
    /** Elevated surfaces — #FFFFFF */
    paper: colorPrimitives.white,
    /** Subtle section differentiation — #F8F9FA */
    subtle: colorPrimitives.neutral[50],
    /** Stronger differentiation, disabled states — #F3F4F6 */
    muted: colorPrimitives.neutral[100],
    /** Dark navigation, inverted sections — #111927 */
    inverse: colorPrimitives.neutral[900],
    /** Disabled overlay — rgba(255, 255, 255, 0.8) */
    disabled: "rgba(255, 255, 255, 0.8)",
  },

  /**
   * Border Colors
   * @ai-usage Use for all borders and dividers
   */
  border: {
    /** Standard borders for cards, inputs — #E5E7EB */
    default: colorPrimitives.neutral[200],
    /** Light borders, internal dividers — #F3F4F6 */
    subtle: colorPrimitives.neutral[100],
    /** Emphasized borders, active states — #D2D6DB */
    strong: colorPrimitives.neutral[300],
    /** Focus rings for accessibility — #2563EB */
    focus: colorPrimitives.blue[500],
    /** Borders on disabled elements — #E5E7EB */
    disabled: colorPrimitives.neutral[200],
  },

  /**
   * Interactive Colors
   * @ai-usage Use for buttons, links, and interactive elements
   */
  interactive: {
    /** Primary CTAs, main action buttons — #2563EB */
    primary: colorPrimitives.blue[500],
    /** Hover state for primary buttons — #1D4ED8 */
    primaryHover: colorPrimitives.blue[600],
    /** Active/pressed state — #1E40AF */
    primaryActive: colorPrimitives.blue[700],
    /** Secondary buttons, less prominent actions — #2F3746 */
    secondary: colorPrimitives.neutral[700],
    /** Hover state for secondary buttons */
    secondaryHover: "rgba(17, 25, 39, 0.9)",
    /** Ghost/text buttons at rest */
    ghost: "transparent",
    /** Hover state for ghost buttons — #F3F4F6 */
    ghostHover: colorPrimitives.neutral[100],
  },

  /**
   * Status Colors
   * @ai-usage Use for communicating status and feedback
   */
  status: {
    success: {
      main: "#16A34A",
      light: "#4ADE80",
      lightest: "rgba(22, 163, 74, 0.10)",
      dark: "#15803D",
      darkest: "#14532D",
      contrast: colorPrimitives.white,
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      lightest: "#FEF2F2",
      dark: "#DC2626",
      darkest: "#7F1D1D",
      contrast: colorPrimitives.white,
    },
    warning: {
      main: "#F59E0B",
      light: "#FDE68A",
      lightest: "#FFFBEB",
      dark: "#D97706",
      darkest: "#78350F",
      contrast: colorPrimitives.white,
    },
    info: {
      main: "#0891B2",
      light: "#A5F3FC",
      lightest: "#ECFEFF",
      dark: "#0E7490",
      darkest: "#164E63",
      contrast: colorPrimitives.white,
    },
  },

  /**
   * Brand Colors
   * @ai-usage Use for brand identity elements
   */
  brand: {
    /** Primary brand blue — #2563EB */
    primary: colorPrimitives.blue[500],
    /** Secondary brand teal — #0891B2 */
    secondary: colorPrimitives.teal[500],
    /** Accent — #60A5FA */
    accent: colorPrimitives.blue[400],
    /** Lightest brand tint — #BFDBFE */
    lightest: colorPrimitives.blue[200],
  },

  /**
   * AI / Streaming specific colors
   * @ai-usage For AI message bubbles, streaming indicators, tool calls
   */
  ai: {
    /** AI assistant message background */
    messageBg: colorPrimitives.blue[50],
    /** AI message border */
    messageBorder: colorPrimitives.blue[100],
    /** Streaming cursor/indicator */
    stream: colorPrimitives.teal[500],
    /** Tool call card background */
    toolBg: colorPrimitives.neutral[50],
    /** Tool call border */
    toolBorder: colorPrimitives.neutral[200],
    /** Reasoning panel background */
    reasoningBg: colorPrimitives.purple[50],
    /** Reasoning panel border */
    reasoningBorder: colorPrimitives.purple[200],
  },

  /**
   * Icon Colors
   */
  icon: {
    primary: colorPrimitives.neutral[700],
    secondary: colorPrimitives.neutral[500],
    disabled: colorPrimitives.neutral[400],
    inverse: colorPrimitives.white,
  },

  /**
   * Overlay Colors
   */
  overlay: {
    backdrop: "rgba(0,0,0,0.5)",
    medium: "rgba(0,0,0,0.3)",
    subtle: "rgba(0,0,0,0.08)",
    strong: "rgba(0,0,0,0.7)",
    frosted: "rgba(255,255,255,0.8)",
  },
} as const;

export const colorAlphas = {
  alpha4: "rgba(0,0,0,0.04)",
  alpha8: "rgba(0,0,0,0.08)",
  alpha12: "rgba(0,0,0,0.12)",
  alpha30: "rgba(0,0,0,0.3)",
  alpha50: "rgba(0,0,0,0.5)",
} as const;

/**
 * @ai-guide COLOR TOKEN SELECTION
 *
 * ## Text: primary / secondary / inverse / disabled / placeholder
 * ## Backgrounds: default / subtle / muted / inverse
 * ## Borders: default / subtle / strong / focus
 * ## Buttons: interactive.primary / secondary / ghost
 * ## Status: status.success/error/warning/info — .main (icon), .lightest (bg)
 * ## AI elements: ai.messageBg / ai.toolBg / ai.reasoningBg
 *
 * NEVER: hardcoded hex values, colorPrimitives in components
 */

export type ColorPrimitives = typeof colorPrimitives;
export type ColorSemantics = typeof colorSemantics;
export type ColorAlphas = typeof colorAlphas;
