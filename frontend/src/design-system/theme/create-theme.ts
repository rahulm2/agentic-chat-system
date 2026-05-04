import {
  createTheme as createMuiTheme,
  responsiveFontSizes,
} from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import {
  colorPrimitives,
  colorSemantics,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  borderSemantics,
  shadowSemantics,
} from '../tokens';

export type PaletteMode = 'light' | 'dark';

interface ThemeConfig {
  paletteMode?: PaletteMode;
  responsiveFontSizes?: boolean;
}

export const createTheme = (config: ThemeConfig = {}): Theme => {
  const { paletteMode = 'light' } = config;
  const isDark = paletteMode === 'dark';

  let theme = createMuiTheme({
    palette: {
      mode: paletteMode,
      primary: {
        main: colorSemantics.interactive.primary,
        light: colorPrimitives.blue[400],
        dark: colorSemantics.interactive.primaryHover,
        contrastText: colorSemantics.text.inverse,
      },
      secondary: {
        main: colorSemantics.brand.secondary,
        light: colorPrimitives.teal[400],
        dark: colorPrimitives.teal[600],
        contrastText: colorSemantics.text.inverse,
      },
      error: {
        main: colorSemantics.status.error.main,
        light: colorSemantics.status.error.light,
        dark: colorSemantics.status.error.dark,
        contrastText: colorSemantics.status.error.contrast,
      },
      warning: {
        main: colorSemantics.status.warning.main,
        light: colorSemantics.status.warning.light,
        dark: colorSemantics.status.warning.dark,
        contrastText: colorSemantics.status.warning.contrast,
      },
      info: {
        main: colorSemantics.status.info.main,
        light: colorSemantics.status.info.light,
        dark: colorSemantics.status.info.dark,
        contrastText: colorSemantics.status.info.contrast,
      },
      success: {
        main: colorSemantics.status.success.main,
        light: colorSemantics.status.success.light,
        dark: colorSemantics.status.success.dark,
        contrastText: colorSemantics.status.success.contrast,
      },
      background: {
        default: isDark ? colorPrimitives.neutral[900] : colorSemantics.background.default,
        paper: isDark ? colorPrimitives.neutral[800] : colorSemantics.background.paper,
      },
      text: {
        primary: isDark ? colorPrimitives.neutral[100] : colorSemantics.text.primary,
        secondary: isDark ? colorPrimitives.neutral[400] : colorSemantics.text.secondary,
        disabled: colorSemantics.text.disabled,
      },
      divider: colorSemantics.border.default,
      action: {
        hover: colorSemantics.interactive.ghostHover,
        disabled: colorSemantics.text.disabled,
        disabledBackground: colorSemantics.background.muted,
      },
    },

    typography: {
      fontFamily: fontFamily.body,
      h1: {
        fontSize: fontSize['5xl'],
        fontWeight: fontWeight.bold,
        lineHeight: lineHeight.tight,
      },
      h2: {
        fontSize: fontSize['4xl'],
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.tight,
      },
      h3: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.snug,
      },
      h4: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.snug,
      },
      h5: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.normal,
      },
      h6: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.normal,
      },
      body1: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.regular,
        lineHeight: lineHeight.normal,
      },
      body2: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.regular,
        lineHeight: lineHeight.normal,
      },
      subtitle1: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        lineHeight: lineHeight.normal,
      },
      subtitle2: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        lineHeight: lineHeight.normal,
      },
      caption: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.regular,
        lineHeight: lineHeight.normal,
      },
      overline: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.normal,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
      button: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        lineHeight: lineHeight.normal,
        textTransform: 'none',
      },
    },

    shape: {
      borderRadius: borderSemantics.radius.input,
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderSemantics.radius.button,
            boxShadow: shadowSemantics.button,
            textTransform: 'none',
            fontWeight: fontWeight.semibold,
            '&:hover': {
              boxShadow: shadowSemantics.button,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: borderSemantics.radius.input,
              '&.Mui-focused fieldset': {
                boxShadow: shadowSemantics.inputFocus,
              },
              '&.Mui-error.Mui-focused fieldset': {
                boxShadow: shadowSemantics.inputFocusError,
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: borderSemantics.radius.input,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderSemantics.radius.card,
            boxShadow: shadowSemantics.card,
            '&:hover': {
              boxShadow: shadowSemantics.cardHover,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: borderSemantics.radius.card,
          },
          elevation1: {
            boxShadow: shadowSemantics.card,
          },
          elevation2: {
            boxShadow: shadowSemantics.cardHover,
          },
          elevation3: {
            boxShadow: shadowSemantics.dropdown,
          },
          elevation8: {
            boxShadow: shadowSemantics.modal,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderSemantics.radius.chip,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: borderSemantics.radius.tooltip,
            boxShadow: shadowSemantics.tooltip,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: borderSemantics.radius.dialog,
            boxShadow: shadowSemantics.dialog,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: borderSemantics.radius.menu,
            boxShadow: shadowSemantics.dropdown,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: shadowSemantics.nav,
            backgroundColor: isDark
              ? colorPrimitives.neutral[900]
              : colorSemantics.brand.primary,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: borderSemantics.radius.button,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: fontFamily.body,
            backgroundColor: isDark
              ? colorPrimitives.neutral[900]
              : colorSemantics.background.subtle,
          },
        },
      },
    },
  });

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};
