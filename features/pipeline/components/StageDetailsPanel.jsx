import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { STAGE_TYPE_OPTIONS } from "../constants/stageLibrary";
import { useTheme } from "../../../shared/context/ThemeContext";
import WeightSlider from "../../../shared/ui/Slider";
import { useTranslation } from "../../../shared/context/I18nContext";
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from "../../../src/fonts";

const DEBOUNCE_MS = 400;

function PickerDropdown({ options, selected, onSelect, placeholder, disabled, c, styles, isRtl }) {
  const [visible, setVisible] = useState(false);
  const displayValue = selected
    ? options.find((o) => o.value === selected)?.label || placeholder
    : placeholder;

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectField, disabled && styles.fieldDisabled, isRtl && styles.rowReverse]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectFieldText,
            !selected && { color: c['muted-foreground'] },
            disabled && { color: c['muted-foreground'] },
            isRtl && styles.textRight,
          ]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <Ionicons name="chevron-down" size={14} color={c['muted-foreground']} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
            <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={[styles.modalTitle, isRtl && styles.textRight]}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    selected === item.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selected === item.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selected === item.value && (
                    <Ionicons name="checkmark" size={18} color={c.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}


export default function StageDetailsPanel({ stage, stages, onUpdate }) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const c = theme.colors;
  const styles = createStyles(c, isRtl);

  const [form, setForm] = useState({
    name: "",
    stage_type: "",
    weight: 0.1,
    description: "",
    num_questions: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name || "",
        stage_type: stage.stage_type || "",
        weight: stage.weight ?? 0.1,
        description: stage.description || "",
        num_questions: stage.num_questions || 0,
      });
      setHasChanges(false);
    }
  }, [stage?.id]);

  const totalOtherWeights = useMemo(() => {
    return (stages || [])
      .filter((s) => s.id !== stage?.id)
      .reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);
  }, [stages, stage?.id]);

  const maxAllowedWeight = useMemo(() => {
    return Math.max(0, Math.round((1 - totalOtherWeights) * 100) / 100);
  }, [totalOtherWeights]);

  const weightPct = Math.round((form.weight ?? 0) * 100);

  if (!stage) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="settings-outline" size={22} color={c['muted-foreground']} />
        </View>
        <Text style={styles.emptyTitle}>{t("pipeline.stage_settings")}</Text>
        <Text style={styles.emptyHint}>
          {t("pipeline.select_stage_hint")}
        </Text>
      </View>
    );
  }

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setHasChanges(true);
  };

  const handleWeightChange = useCallback((value) => {
    setForm((prev) => ({ ...prev, weight: parseFloat(value) }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { order_index, ...updateData } = form;
      await onUpdate(stage.id, updateData);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to save stage:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
        <Text style={styles.headerLabel}>{t("pipeline.stage_settings")}</Text>
        <View style={[styles.headerTitleRow, isRtl && styles.rowReverse]}>
          <Text style={[styles.headerTitle, isRtl && styles.textRight]} numberOfLines={1}>
            {form.name || t("pipeline.untitled_stage")}
          </Text>
          {stage.is_locked && (
            <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>{t("pipeline.locked")}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.headerType, isRtl && styles.textRight]} numberOfLines={1}>
          {form.stage_type?.replace(/_/g, " ")}
        </Text>
      </View>

      <View style={styles.fields}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, isRtl && styles.textRight]}>{t("pipeline.stage_name")}</Text>
          <TextInput
            style={[styles.input, stage.is_locked && styles.fieldDisabled, isRtl && styles.textRight]}
            value={form.name}
            onChangeText={(t) => handleChange("name", t)}
            editable={!stage.is_locked}
            placeholder={t("pipeline.stage_name_placeholder")}
            placeholderTextColor={c['muted-foreground']}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("pipeline.stage_type")}</Text>
          <PickerDropdown
            options={[
              ...STAGE_TYPE_OPTIONS,
              ...(stage.is_locked && !STAGE_TYPE_OPTIONS.some(o => o.value === form.stage_type)
                ? [{ value: form.stage_type, label: form.stage_type.replace(/_/g, " ") }]
                : []),
            ]}
            selected={form.stage_type}
            onSelect={(val) => handleChange("stage_type", val)}
            placeholder={t("pipeline.select_type_placeholder")}
            disabled={stage.is_locked}
            c={c}
            styles={styles}
            isRtl={isRtl}
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={[styles.weightHeader, isRtl && styles.rowReverse]}>
            <Text style={[styles.fieldLabel, isRtl && styles.textRight]}>{t("pipeline.weight")}</Text>
            <Text style={styles.weightValue}>{weightPct}%</Text>
          </View>
          <WeightSlider
            value={form.weight ?? 0}
            maxValue={maxAllowedWeight}
            onChange={handleWeightChange}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("pipeline.description")}</Text>
          <TextInput
            style={[styles.textArea, stage.is_locked && styles.fieldDisabled, isRtl && styles.textRight]}
            value={form.description}
            onChangeText={(t) => handleChange("description", t)}
            editable={!stage.is_locked}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder={t("pipeline.description_placeholder")}
            placeholderTextColor={c['muted-foreground']}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t("pipeline.num_questions")}</Text>
          <TextInput
            style={[styles.input, stage.is_locked && styles.fieldDisabled, isRtl && styles.textRight]}
            value={String(form.num_questions || 0)}
            onChangeText={(t) => handleChange("num_questions", parseInt(t) || 0)}
            editable={!stage.is_locked}
            keyboardType="numeric"
            placeholder={t("pipeline.num_questions_placeholder")}
            placeholderTextColor={c['muted-foreground']}
          />
        </View>

        <View style={styles.advancedSection}>
          <Text style={styles.advancedLabel}>{t("pipeline.advanced_coming_soon")}</Text>
          {["pipeline.ai_evaluation", "pipeline.manual_review", "pipeline.auto_advance", "pipeline.auto_reject" ].map(
            (key) => (
              <View key={key} style={[styles.advancedRow, isRtl && styles.rowReverse]}>
                <Text style={[styles.advancedRowText, isRtl && styles.textRight]}>{t(key)}</Text>
                <View style={styles.advancedToggle} />
              </View>
            )
          )}
        </View>
      </View>

      <View style={styles.saveFooter}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || stage.is_locked || isSaving}
          style={[
            styles.saveButton,
            (!hasChanges || stage.is_locked) && styles.saveButtonDisabled,
            isRtl && styles.rowReverse,
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="save-outline" size={16} color={(!hasChanges || stage.is_locked) ? c['muted-foreground'] : c.card} />
          <Text style={[styles.saveButtonText, (!hasChanges || stage.is_locked) && styles.saveButtonTextDisabled, isRtl && styles.textRight]}>
            {isSaving ? t("pipeline.saving") : t("pipeline.save_changes")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createStyles(c, isRtl) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingBottom: 40,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    emptyIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: c.border,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c['muted-foreground'],
      marginBottom: 4,
    },
    emptyHint: {
      fontSize: 12,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
      textAlign: "center",
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerLabel: {
      fontSize: 10,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.primary,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    headerTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    headerTitle: {
      fontSize: 15,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
      flex: 1,
    },
    lockedBadge: {
      backgroundColor: c.border,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    lockedText: {
      fontSize: 10,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c['muted-foreground'],
    },
    headerType: {
      fontSize: 12,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
      textTransform: "capitalize",
      marginTop: 2,
    },
    fields: {
      padding: 20,
      gap: 20,
    },
    fieldGroup: {
      gap: 6,
    },
    fieldLabel: {
      fontSize: 12,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c['muted-foreground'],
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: FONT_FAMILY,
      color: c.foreground,
    },
    fieldDisabled: {
      backgroundColor: c['surface-muted'],
      color: c['muted-foreground'],
    },
    selectField: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectFieldText: {
      fontSize: 14,
      fontFamily: FONT_FAMILY,
      flex: 1,
      color: c.foreground,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: `${c.foreground}80`,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "80%",
      maxHeight: "60%",
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
      marginBottom: 12,
    },
    modalOption: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalOptionSelected: {
      backgroundColor: c['surface-muted'],
    },
    modalOptionText: {
      fontSize: 15,
      fontFamily: FONT_FAMILY,
      color: c.foreground,
    },
    modalOptionTextSelected: {
      color: c.primary,
      fontFamily: FONT_FAMILY_SEMIBOLD,
    },
    weightHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    weightValue: {
      fontSize: 13,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.primary,
    },

    textArea: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: FONT_FAMILY,
      color: c.foreground,
      minHeight: 72,
      textAlignVertical: "top",
    },
    advancedSection: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 16,
      gap: 12,
    },
    advancedLabel: {
      fontSize: 10,
      fontFamily: FONT_FAMILY_BOLD,
      color: c['muted-foreground'],
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    advancedRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      opacity: 0.4,
    },
    advancedRowText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
    },
    advancedToggle: {
      width: 32,
      height: 16,
      borderRadius: 8,
      backgroundColor: c.border,
    },
    saveFooter: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.card,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.primary,
      paddingVertical: 12,
      borderRadius: 10,
    },
    saveButtonDisabled: {
      backgroundColor: c.border,
    },
    saveButtonText: {
      fontSize: 14,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.card,
    },
    saveButtonTextDisabled: {
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
    },
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
  });
}
