import { Platform, StyleSheet } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const lightColors = {
  background: '#ffffff',
  foreground: '#012a4a',
  surface: '#ffffff',
  'surface-muted': '#eef7fa',
  'surface-hover': '#e7f3f7',
  card: '#ffffff',
  popover: '#ffffff',
  primary: '#01497c',
  'primary-hover': '#013a63',
  secondary: '#e7f3f7',
  muted: '#eef7fa',
  'muted-foreground': '#468faf',
  accent: '#2a6f97',
  ring: '#2a6f97',
  sidebar: '#012a4a',
  'sidebar-foreground': '#cfe7f2',
  'sidebar-active': '#01497c',
  border: '#cfe7f2',
  input: '#cfe7f2',
  success: '#059669',
  warning: '#d97706',
  destructive: '#dc2626',
  'destructive-foreground': '#ffffff',
  'stage-applied': '#89c2d9',
  'stage-screening': '#61a5c2',
  'stage-interview': '#2c7da0',
  'stage-assessment': '#2a6f97',
  'stage-final': '#01497c',
  'stage-hired': '#468faf',
};

export const darkColors = {
  background: '#061826',
  foreground: '#eef7fa',
  surface: '#0b2336',
  'surface-muted': '#0e2a40',
  'surface-hover': '#143b56',
  card: '#0b2336',
  popover: '#0b2336',
  primary: '#468faf',
  'primary-hover': '#61a5c2',
  secondary: '#143b56',
  muted: '#0e2a40',
  'muted-foreground': '#89c2d9',
  accent: '#89c2d9',
  ring: '#468faf',
  sidebar: '#02192b',
  'sidebar-foreground': '#cfe7f2',
  'sidebar-active': '#01497c',
  border: 'rgba(207, 231, 242, 0.1)',
  input: 'rgba(207, 231, 242, 0.16)',
  success: '#059669',
  warning: '#d97706',
  destructive: '#dc2626',
  'destructive-foreground': '#ffffff',
  'stage-applied': '#89c2d9',
  'stage-screening': '#61a5c2',
  'stage-interview': '#2c7da0',
  'stage-assessment': '#2a6f97',
  'stage-final': '#468faf',
  'stage-hired': '#468faf',
};

export const spacing = {
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
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
};

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const letterSpacing = {
  tight: -0.025 * 16,
  normal: 0,
  wide: 0.025 * 16,
  wider: 0.05 * 16,
};

export const shadow = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#01497c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
};

export function createTheme(isDark = false) {
  const c = isDark ? darkColors : lightColors;
  return {
    colors: {
      ...c,
      white: '#ffffff',
      black: '#000000',
      gray: {
        50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb',
        300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280',
        600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
      },
      emerald: {
        50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
        300: '#6ee7b7', 400: '#34d399', 500: '#10b981',
        600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
      },
      red: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca',
        300: '#fca5a5', 400: '#f87171', 500: '#ef4444',
        600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d',
      },
      amber: {
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
        300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b',
        600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f',
      },
      stage: { applied: '#89c2d9', screening: '#61a5c2', interview: '#2c7da0', assessment: '#2a6f97', final: '#01497c', hired: '#468faf' },
      chart: ['#01497c', '#2a6f97', '#468faf', '#89c2d9', '#61a5c2'],
      darkAmethyst: {
        50: '#eef7fa', 100: '#cfe7f2', 200: '#b0d7ea',
        300: '#89c2d9', 400: '#61a5c2', 500: '#468faf',
        600: '#01497c', 700: '#013a63', 800: '#012a4a', 900: '#011e36', 950: '#001529',
      },
      mauveMagic: {
        50: '#eef7fa', 100: '#cfe7f2', 200: '#b0d7ea',
        300: '#89c2d9', 400: '#61a5c2', 500: '#468faf',
        600: '#01497c', 700: '#013a63', 800: '#012a4a', 900: '#011e36', 950: '#001529',
      },
    },
    isDark,
    spacing,
    borderRadius,
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing,
    shadow,
    fontFamily,
    typography: {
      h1: {
        fontSize: fontSize['3xl'],
        lineHeight: 36,
        fontWeight: fontWeight.extrabold,
        letterSpacing: letterSpacing.tight,
        color: c.foreground,
        fontFamily,
      },
      h2: {
        fontSize: fontSize['2xl'],
        lineHeight: 32,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight,
        color: c.foreground,
        fontFamily,
      },
      h3: {
        fontSize: fontSize.xl,
        lineHeight: 28,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight,
        color: c.foreground,
        fontFamily,
      },
      h4: {
        fontSize: fontSize.lg,
        lineHeight: 28,
        fontWeight: fontWeight.semibold,
        color: c.foreground,
        fontFamily,
      },
      h5: {
        fontSize: fontSize.base,
        lineHeight: 24,
        fontWeight: fontWeight.semibold,
        color: c.foreground,
        fontFamily,
      },
      h6: {
        fontSize: fontSize.sm,
        lineHeight: 20,
        fontWeight: fontWeight.bold,
        color: c.foreground,
        fontFamily,
      },
      body: {
        fontSize: fontSize.sm,
        lineHeight: 20,
        color: c.foreground,
        fontFamily,
      },
      'body-secondary': {
        fontSize: fontSize.sm,
        lineHeight: 20,
        color: c['muted-foreground'],
        fontFamily,
      },
      'body-large': {
        fontSize: fontSize.base,
        lineHeight: 24,
        color: c.foreground,
        fontFamily,
      },
      caption: {
        fontSize: fontSize.xs,
        lineHeight: 16,
        color: c['muted-foreground'],
        fontFamily,
      },
      label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: c.foreground,
        fontFamily,
      },
    },
  };
}

export const defaultTheme = createTheme(false);

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: lightColors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: spacing[4],
    ...shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap1: { gap: spacing[1] },
  gap2: { gap: spacing[2] },
  gap3: { gap: spacing[3] },
  gap4: { gap: spacing[4] },
  gap6: { gap: spacing[6] },
});

// Backward compatibility — legacy color palette used by feature components
export const colors = {
  primary: lightColors.primary,
  primaryHover: lightColors['primary-hover'],
  sidebarBg: lightColors.sidebar,
  secondary: lightColors.accent,
  accent: lightColors.accent,
  background: lightColors.background,
  surface: lightColors['surface-muted'],
  surfaceHover: lightColors['surface-hover'],
  border: lightColors.border,
  foreground: lightColors.foreground,
  mutedForeground: lightColors['muted-foreground'],
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
  stage: { applied: '#89c2d9', screening: '#61a5c2', interview: '#2c7da0', assessment: '#2a6f97', final: '#01497c', hired: '#468faf' },
  chart: ['#01497c', '#2a6f97', '#468faf', '#89c2d9', '#61a5c2'],
  darkAmethyst: { 50: '#eef7fa', 100: '#cfe7f2', 200: '#b0d7ea', 300: '#89c2d9', 400: '#61a5c2', 500: '#468faf', 600: '#01497c', 700: '#013a63', 800: '#012a4a', 900: '#011e36', 950: '#001529' },
  mauveMagic: { 50: '#eef7fa', 100: '#cfe7f2', 200: '#b0d7ea', 300: '#89c2d9', 400: '#61a5c2', 500: '#468faf', 600: '#01497c', 700: '#013a63', 800: '#012a4a', 900: '#011e36', 950: '#001529' },
};
