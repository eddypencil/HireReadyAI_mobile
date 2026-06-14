import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useTheme } from "../../../shared/context/ThemeContext";

const QUESTION_STAGE_TYPES = new Set([
  "hr_interview", "technical_interview",
  "assessment", "assessment_test", "coding_test",
]);

export default function StageConfigDialog({ visible, libraryItem, onConfirm, onCancel }) {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  const isRtl = language === "ar";

  const [form, setForm] = useState({
    name: "",
    description: "",
    num_questions: "5",
    pass_score: "70",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criteriaState, setCriteriaState] = useState("idle"); // idle | generating | warning
  const [errors, setErrors] = useState({});

  // Reset form when opened with a new item
  React.useEffect(() => {
    if (visible && libraryItem) {
      setForm({
        name: libraryItem.label || "",
        description: "",
        num_questions: "5",
        pass_score: "70",
      });
      setErrors({});
      setCriteriaState("idle");
    }
  }, [visible, libraryItem]);

  const needsQuestions = QUESTION_STAGE_TYPES.has(libraryItem?.key);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t("stage_config_dialog.errors.name_required");
    if (!form.description.trim()) next.description = t("stage_config_dialog.errors.description_required");
    
    if (needsQuestions) {
      const numQ = parseInt(form.num_questions);
      if (isNaN(numQ) || numQ < 1) next.num_questions = t("stage_config_dialog.errors.num_questions_min");
    }
    
    const score = parseInt(form.pass_score);
    if (isNaN(score) || score < 0 || score > 100) next.pass_score = t("stage_config_dialog.errors.pass_score_range");
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      await onConfirm(libraryItem, {
        name: form.name.trim(),
        description: form.description.trim(),
        num_questions: needsQuestions ? parseInt(form.num_questions) : null,
        pass_score: parseInt(form.pass_score),
      }, setCriteriaState);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!libraryItem) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={[styles.header, isRtl && styles.rowReverse]}>
            <View style={[styles.headerLeft, isRtl && styles.rowReverse]}>
              <View style={styles.iconBox}>
                <Ionicons name="sparkles" size={16} color={c.primary} />
              </View>
              <View style={[isRtl && styles.textRight]}>
                <Text style={styles.title}>{t("stage_config_dialog.title")}</Text>
                <Text style={styles.subtitle}>{libraryItem.label}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn} disabled={isSubmitting}>
              <Ionicons name="close" size={20} color={c["muted-foreground"]} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={[styles.label, isRtl && styles.textRight]}>
                {t("stage_config_dialog.fields.name")}
                <Text style={styles.asterisk}> *</Text>
              </Text>
              <TextInput
                style={[styles.input, isRtl && styles.textRight, errors.name && styles.inputError]}
                value={form.name}
                onChangeText={(val) => setForm(f => ({ ...f, name: val }))}
                placeholder={libraryItem.label}
                placeholderTextColor={c.border}
              />
              {errors.name && <Text style={[styles.errorText, isRtl && styles.textRight]}>{errors.name}</Text>}
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={[styles.label, isRtl && styles.textRight]}>
                {t("stage_config_dialog.fields.description")}
                <Text style={styles.asterisk}> *</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, isRtl && styles.textRight, errors.description && styles.inputError]}
                value={form.description}
                onChangeText={(val) => setForm(f => ({ ...f, description: val }))}
                placeholder={t("stage_config_dialog.placeholders.description")}
                placeholderTextColor={c.border}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.description && <Text style={[styles.errorText, isRtl && styles.textRight]}>{errors.description}</Text>}
            </View>

            {/* Questions & Pass Score Row */}
            <View style={[styles.row, isRtl && styles.rowReverse]}>
              {needsQuestions && (
                <View style={styles.halfField}>
                  <Text style={[styles.label, isRtl && styles.textRight]}>
                    {t("stage_config_dialog.fields.num_questions")}
                    <Text style={styles.asterisk}> *</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, isRtl && styles.textRight, errors.num_questions && styles.inputError]}
                    value={form.num_questions}
                    onChangeText={(val) => setForm(f => ({ ...f, num_questions: val }))}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={c.border}
                  />
                  {errors.num_questions && <Text style={[styles.errorText, isRtl && styles.textRight]}>{errors.num_questions}</Text>}
                </View>
              )}
              
              <View style={needsQuestions ? styles.halfField : styles.field}>
                <Text style={[styles.label, isRtl && styles.textRight]}>
                  {t("stage_config_dialog.fields.pass_score")}
                </Text>
                <TextInput
                  style={[styles.input, isRtl && styles.textRight, errors.pass_score && styles.inputError]}
                  value={form.pass_score}
                  onChangeText={(val) => setForm(f => ({ ...f, pass_score: val }))}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor={c.border}
                />
                {errors.pass_score && <Text style={[styles.errorText, isRtl && styles.textRight]}>{errors.pass_score}</Text>}
              </View>
            </View>

            {/* Generation States */}
            {criteriaState === "generating" && (
              <View style={[styles.stateBox, styles.generatingBox, isRtl && styles.rowReverse]}>
                <ActivityIndicator size="small" color={c.primary} />
                <Text style={styles.generatingText}>{t("stage_config_dialog.generating_criteria")}</Text>
              </View>
            )}
            {criteriaState === "warning" && (
              <View style={[styles.stateBox, styles.warningBox, isRtl && styles.rowReverse]}>
                <Ionicons name="warning" size={16} color={c.amber[600]} />
                <Text style={styles.warningText}>{t("stage_config_dialog.criteria_warning")}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, isRtl && styles.rowReverse]}>
            <TouchableOpacity
              style={[styles.footerBtn, styles.cancelBtn]}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>{t("stage_config_dialog.buttons.cancel")}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.footerBtn, styles.confirmBtn, isSubmitting && styles.disabledBtn, isRtl && styles.rowReverse]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <ActivityIndicator size="small" color="#fff" style={{ marginRight: isRtl ? 0 : 8, marginLeft: isRtl ? 8 : 0 }} />}
              <Text style={styles.confirmBtnText}>
                {isSubmitting ? t("stage_config_dialog.buttons.adding") : t("stage_config_dialog.buttons.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    dialog: {
      backgroundColor: c.background,
      borderRadius: 16,
      overflow: "hidden",
      maxHeight: "90%",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.primary + "1A", // 10% opacity
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontWeight: '700',
      fontSize: 14,
      color: c.foreground,
    },
    subtitle: {
      fontWeight: '600',
      fontSize: 12,
      color: c["muted-foreground"],
      marginTop: 2,
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      padding: 16,
    },
    field: {
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    halfField: {
      flex: 1,
    },
    label: {
      fontWeight: '700',
      fontSize: 12,
      color: c["muted-foreground"],
      marginBottom: 6,
    },
    asterisk: {
      color: c.rose[500],
    },
    input: {
      fontWeight: '600',
      fontSize: 14,
      color: c.foreground,
      backgroundColor: c.secondary,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    textArea: {
      height: 80,
    },
    inputError: {
      borderColor: c.rose[400],
    },
    errorText: {
      fontWeight: '600',
      fontSize: 11,
      color: c.rose[500],
      marginTop: 4,
    },
    stateBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      borderRadius: 8,
      gap: 8,
      marginBottom: 16,
      borderWidth: 1,
    },
    generatingBox: {
      backgroundColor: c.primary + "0D",
      borderColor: c.primary + "33",
    },
    generatingText: {
      fontWeight: '600',
      fontSize: 12,
      color: c.primary,
      flex: 1,
    },
    warningBox: {
      backgroundColor: c.amber[50],
      borderColor: c.amber[200],
    },
    warningText: {
      fontWeight: '600',
      fontSize: 12,
      color: c.amber[700],
      flex: 1,
    },
    footer: {
      flexDirection: "row",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: 12,
    },
    footerBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtn: {
      backgroundColor: c.secondary,
      borderWidth: 1,
      borderColor: c.border,
    },
    cancelBtnText: {
      fontWeight: '700',
      fontSize: 14,
      color: c["muted-foreground"],
    },
    confirmBtn: {
      backgroundColor: c.primary,
      flexDirection: "row",
    },
    confirmBtnText: {
      fontWeight: '700',
      fontSize: 14,
      color: "#fff",
    },
    disabledBtn: {
      opacity: 0.6,
    },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
  });
}
