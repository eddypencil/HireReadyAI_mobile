import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

const MIN_LENGTH = 30;

function createStyles(c) {
  return StyleSheet.create({
    container: { gap: 16 },
    inputWrapper: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    input: {
      minHeight: 180,
      fontSize: 15,
      color: c.foreground,
      lineHeight: 24,
    },
    footer: { gap: 16 },
    footerLeft: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
    },
    badgeText: { fontSize: 11, fontWeight: "600" },
    wordCount: { fontSize: 12, color: c['muted-foreground'], fontWeight: "500" },
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

export default function TextQuestion({ onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const s = createStyles(c);

  const [value, setValue] = useState("");
  const charCount = value.trim().length;
  const tooShort = charCount < MIN_LENGTH;

  return (
    <View style={s.container}>
      <View style={s.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Type your answer here…"
          placeholderTextColor={c['muted-foreground']}
          multiline
          textAlignVertical="top"
          style={s.input}
        />
      </View>

      <View style={s.footer}>
        <View style={s.footerLeft}>
          <View style={[
            s.badge,
            { 
              backgroundColor: tooShort ? `${c.warning}1a` : `${c.success}1a`,
              borderColor: tooShort ? `${c.warning}33` : `${c.success}33`
            }
          ]}>
            <Ionicons
              name={tooShort ? "alert-circle" : "checkmark-circle"}
              size={14}
              color={tooShort ? c.warning : c.success}
            />
            <Text style={[s.badgeText, { color: tooShort ? c.warning : c.success }]}>
              {charCount}{charCount >= MIN_LENGTH ? " chars" : ` chars (min ${MIN_LENGTH})`}
            </Text>
          </View>
          {value.trim() ? (
            <Text style={s.wordCount}>
              {value.trim().split(/\s+/).length} words
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => onAnswer(value.trim())}
          disabled={tooShort}
          activeOpacity={0.8}
          style={[s.submitBtn, { opacity: tooShort ? 0.4 : 1 }]}
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
