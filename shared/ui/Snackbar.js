import { useRef, useEffect } from "react";
import { Animated, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

export default function Snackbar({ message, visible, onDismiss, duration = 4000 }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => handleDismiss(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 100, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: c.destructive,
          opacity,
          transform: [{ translateY }],
          bottom: insets.bottom + 20,
        },
      ]}
    >
      <TouchableOpacity onPress={handleDismiss} style={styles.touchable} activeOpacity={0.9}>
        <Text style={[styles.text, { color: c['destructive-foreground'] }]}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 12,
    zIndex: 100,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  touchable: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
