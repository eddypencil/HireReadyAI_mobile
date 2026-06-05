import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { colors } from "../../src/theme";

export default function WeightSlider({ value, maxValue, onChange }) {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={Math.max(maxValue, 0.01)}
        step={0.01}
        minimumTrackTintColor={colors.darkAmethyst[600]}
        maximumTrackTintColor={colors.gray[200]}
        thumbTintColor={colors.white}
      />
      <View style={styles.tickContainer}>
        {[0, 25, 50, 75, 100].map((pct) => {
          const tickVal = (pct / 100) * maxValue;
          return (
            <TouchableOpacity
              key={pct}
              onPress={() => onChange(Math.round(tickVal * 100) / 100)}
              style={styles.tick}
            >
              <View
                style={[
                  styles.tickMark,
                  Math.round(value * 100) >= Math.round(tickVal * 100) &&
                    styles.tickMarkActive,
                ]}
              />
              <Text
                style={[
                  styles.tickLabel,
                  Math.round(value * 100) === Math.round(tickVal * 100) &&
                    styles.tickLabelActive,
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
    gap: 4,
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
    gap: 4,
    paddingHorizontal: 2,
  },
  tickMark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[300],
  },
  tickMarkActive: {
    backgroundColor: colors.darkAmethyst[600],
  },
  tickLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: "500",
  },
  tickLabelActive: {
    color: colors.darkAmethyst[600],
    fontWeight: "700",
  },
});
