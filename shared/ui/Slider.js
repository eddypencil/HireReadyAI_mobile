import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import RNNSlider from "@react-native-community/slider";
import { useTheme } from "../context/ThemeContext";
import { spacing, borderRadius, fontSize, fontWeight } from "../../src/theme";

export default function WeightSlider({ value, maxValue, onChange, disabled }) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.container}>
      <RNNSlider
        style={styles.slider}
        value={value}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={Math.max(maxValue, 0.01)}
        step={0.01}
        minimumTrackTintColor={c.primary}
        maximumTrackTintColor={c.border}
        thumbTintColor={c.card}
        disabled={disabled}
      />
      <View style={styles.tickContainer}>
        {[0, 25, 50, 75, 100].map((pct) => {
          const tickVal = (pct / 100) * maxValue;
          const isActive = Math.round(value * 100) >= Math.round(tickVal * 100);
          const isExact = Math.round(value * 100) === Math.round(tickVal * 100);
          return (
            <TouchableOpacity
              key={pct}
              onPress={() => !disabled && onChange(Math.round(tickVal * 100) / 100)}
              style={styles.tick}
              disabled={disabled}
            >
              <View
                style={[
                  styles.tickMark,
                  { backgroundColor: c.border },
                  isActive && { backgroundColor: c.primary },
                ]}
              />
              <Text
                style={[
                  styles.tickLabel,
                  { color: c['muted-foreground'] },
                  isExact && { color: c.primary, fontWeight: fontWeight.bold },
                ]}
              >
                {pct}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  slider: {
    width: "100%",
    height: 32,
  },
  tickContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  tick: {
    alignItems: "center",
    gap: spacing[1],
    paddingHorizontal: 2,
  },
  tickMark: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tickLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
