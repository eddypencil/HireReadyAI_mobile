import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

export default function MultipleChoiceQuestion({ question, onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const [selected, setSelected] = useState(null);
  const options = question?.options ?? [];

  return (
    <View style={{ gap: 20 }}>
      <ScrollView style={{ maxHeight: 360 }} nestedScrollEnabled>
        <View style={{ gap: 10 }}>
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selected === opt;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelected(opt)}
                activeOpacity={0.75}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? c.primary : c.border,
                  backgroundColor: isSelected ? `${c.primary}0f` : c.card,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: isSelected ? c.primary : c['surface-muted'],
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={16} color={c['destructive-foreground']} />
                  ) : (
                    <Text style={{ fontSize: 11, fontWeight: "700", color: c['muted-foreground'] }}>{letter}</Text>
                  )}
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: c.foreground, lineHeight: 20 }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 12, color: c['muted-foreground'] }}>
          {selected !== null ? "Answer selected" : "Select one option"}
        </Text>
        <TouchableOpacity
          onPress={() => onAnswer(selected)}
          disabled={selected === null}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: c.primary,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 10,
            opacity: selected === null ? 0.4 : 1,
          }}
        >
          <Ionicons name="checkmark-circle" size={16} color={c['destructive-foreground']} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: c['destructive-foreground'] }}>
            Submit Answer →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
