import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

const MIN_LENGTH = 30;

export default function TextQuestion({ onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const [value, setValue] = useState("");
  const charCount = value.trim().length;
  const tooShort = charCount < MIN_LENGTH;

  return (
    <View style={{ gap: 16 }}>
      <View style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Type your answer here…"
          placeholderTextColor={c['muted-foreground']}
          multiline
          textAlignVertical="top"
          style={{
            minHeight: 160,
            fontSize: 14,
            color: c.foreground,
            lineHeight: 22,
          }}
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: tooShort ? `${c.warning}1a` : `${c.success}1a`,
            borderWidth: 1,
            borderColor: tooShort ? `${c.warning}33` : `${c.success}33`,
          }}>
            <Ionicons
              name={tooShort ? "alert-circle" : "checkmark-circle"}
              size={12}
              color={tooShort ? c.warning : c.success}
            />
            <Text style={{ fontSize: 11, fontWeight: "600", color: tooShort ? c.warning : c.success }}>
              {charCount}{charCount >= MIN_LENGTH ? " chars" : ` chars (min ${MIN_LENGTH})`}
            </Text>
          </View>
          {value.trim() ? (
            <Text style={{ fontSize: 11, color: c['muted-foreground'] }}>
              {value.trim().split(/\s+/).length} words
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => onAnswer(value.trim())}
          disabled={tooShort}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: c.primary,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 10,
            opacity: tooShort ? 0.4 : 1,
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
