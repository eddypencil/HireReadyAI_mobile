import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

function createStyles(c) {
  return StyleSheet.create({
    container: { gap: 20 },
    scrollContainer: { maxHeight: 360 },
    optionsList: { gap: 12 },
    optionBtn: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    indicator: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    indicatorText: { fontSize: 12, fontWeight: "700" },
    optionText: { flex: 1, fontSize: 15, color: c.foreground, lineHeight: 22 },
    footer: { gap: 16 },
    footerText: { fontSize: 13, color: c['muted-foreground'], fontWeight: "500", textAlign: "center" },
    submitBtn: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    submitText: { fontSize: 14, fontWeight: "600", color: c['destructive-foreground'] },
  });
}

export default function MultipleChoiceQuestion({ question, onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const s = createStyles(c);
  
  const [selected, setSelected] = useState(null);
  const options = question?.options ?? [];

  return (
    <View style={s.container}>
      <ScrollView style={s.scrollContainer} nestedScrollEnabled>
        <View style={s.optionsList}>
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selected === opt;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelected(opt)}
                activeOpacity={0.75}
                style={[
                  s.optionBtn,
                  {
                    borderColor: isSelected ? c.primary : c.border,
                    backgroundColor: isSelected ? `${c.primary}0f` : c.card,
                  }
                ]}
              >
                <View style={[
                  s.indicator,
                  { backgroundColor: isSelected ? c.primary : c['surface-muted'] }
                ]}>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={16} color={c['destructive-foreground']} />
                  ) : (
                    <Text style={[s.indicatorText, { color: c['muted-foreground'] }]}>{letter}</Text>
                  )}
                </View>
                <Text style={s.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Text style={s.footerText}>
          {selected !== null ? "Answer selected" : "Select one option"}
        </Text>
        <TouchableOpacity
          onPress={() => onAnswer(selected)}
          disabled={selected === null}
          activeOpacity={0.8}
          style={[s.submitBtn, { opacity: selected === null ? 0.4 : 1 }]}
        >
          <Ionicons name="checkmark-circle" size={18} color={c['destructive-foreground']} />
          <Text style={s.submitText}>
            Submit Answer →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
