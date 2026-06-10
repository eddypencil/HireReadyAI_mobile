import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../src/theme';

const variantStyles = {
  default: (c) => ({
    bg: c.primary,
    text: c['destructive-foreground'],
    border: 'transparent',
  }),
  outline: (c) => ({
    bg: 'transparent',
    text: c.foreground,
    border: c.border,
  }),
  secondary: (c) => ({
    bg: c.secondary,
    text: c['muted-foreground'],
    border: 'transparent',
  }),
  ghost: (c) => ({
    bg: 'transparent',
    text: c.foreground,
    border: 'transparent',
  }),
  destructive: (c) => ({
    bg: c.destructive,
    text: c['destructive-foreground'],
    border: 'transparent',
  }),
  link: (c) => ({
    bg: 'transparent',
    text: c.primary,
    border: 'transparent',
  }),
};

const sizeStyles = {
  xs: { height: 24, px: spacing[2], fontSize: fontSize.xs },
  sm: { height: 28, px: spacing[2.5], fontSize: 12.8 },
  default: { height: 40, px: spacing[4], py: spacing[2.5], fontSize: fontSize.sm },
  lg: { height: 36, px: spacing[2.5], fontSize: fontSize.sm },
  icon: { size: 32, fontSize: fontSize.base },
  'icon-sm': { size: 28, fontSize: fontSize.sm },
  'icon-lg': { size: 36, fontSize: fontSize.base },
};

export default function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  children,
  style,
  textStyle,
  ...props
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const variantStyle = variantStyles[variant](c);
  const sizeStyle = sizeStyles[size];
  const isIcon = size.startsWith('icon');
  const dim = isIcon ? sizeStyle.size : null;

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          height: dim || sizeStyle.height,
          paddingHorizontal: isIcon ? 0 : sizeStyle.px,
          paddingVertical: isIcon ? 0 : sizeStyle.py || 0,
          width: dim,
          borderRadius: borderRadius.lg,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: variantStyle.text,
              fontSize: sizeStyle.fontSize,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  text: {
    fontWeight: fontWeight.medium,
  },
});
