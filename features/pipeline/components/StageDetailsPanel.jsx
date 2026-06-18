import { useState, useEffect } from "react";
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
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { STAGE_TYPE_OPTIONS } from "../constants/stageLibrary";
import { useTheme } from "../../../shared/context/ThemeContext";
import WeightSlider from "../../../shared/ui/Slider";
import { useTranslation } from "../../../shared/context/I18nContext";
import { generateEvaluationCriteria } from "../services/pipeline.service";

const AI_STAGE_TYPES = new Set([
  "hr_interview", "technical_interview",
  "assessment", "assessment_test", "coding_test",
]);

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
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.bottomSheetOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.bottomSheetContent} onPress={() => {}}>
            <View style={styles.bottomSheetHandleWrap}>
              <View style={styles.bottomSheetHandle} />
            </View>
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
                  <View style={[styles.modalOptionLabel, isRtl && styles.rowReverse]}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        selected === item.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.isPremium && (
                      <Ionicons name="crown" size={14} color="#FFD700" />
                    )}
                  </View>
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


export default function StageDetailsPanel({ stage, onUpdate }) {
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

  // Criteria state
  const [localCriteria, setLocalCriteria] = useState([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [criteriaHasChanges, setCriteriaHasChanges] = useState(false);
  const [newConceptInputs, setNewConceptInputs] = useState({});

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

      setLocalCriteria(Array.isArray(stage.evaluation_criteria) ? stage.evaluation_criteria : []);
      setCriteriaHasChanges(false);
      setNewConceptInputs({});
    }
  }, [stage?.id]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { order_index, ...updateData } = form;
      const payload = criteriaHasChanges
        ? { ...updateData, evaluation_criteria: localCriteria }
        : updateData;
      await onUpdate(stage.id, payload);
      setHasChanges(false);
      setCriteriaHasChanges(false);
    } catch (err) {
      console.error("Failed to save stage:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Criteria helpers ────────────────────────────────────────────────────────
  const weightTotal = localCriteria.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  const weightValid = weightTotal === 100;
  const hasZeroWeight = localCriteria.some(ci => Number(ci.weight) === 0);

  const updateCriterion = (idx, field, value) => {
    setLocalCriteria(prev => prev.map((cr, i) => i === idx ? { ...cr, [field]: value } : cr));
    setCriteriaHasChanges(true);
  };

  const deleteCriterion = (idx) => {
    setLocalCriteria(prev => prev.filter((_, i) => i !== idx));
    setCriteriaHasChanges(true);
  };

  const addCriterion = () => {
    setLocalCriteria(prev => [
      ...prev,
      { competency: "", weight: 0, required: true, min_questions: 1, concepts: [] },
    ]);
    setCriteriaHasChanges(true);
  };

  const addConcept = (idx) => {
    const val = (newConceptInputs[idx] || "").trim();
    if (!val) return;
    setLocalCriteria(prev => prev.map((cr, i) =>
      i === idx ? { ...cr, concepts: [...(cr.concepts || []), val] } : cr
    ));
    setNewConceptInputs(prev => ({ ...prev, [idx]: "" }));
    setCriteriaHasChanges(true);
  };

  const removeConcept = (cIdx, conceptIdx) => {
    setLocalCriteria(prev => prev.map((cr, i) =>
      i === cIdx ? { ...cr, concepts: cr.concepts.filter((_, ci) => ci !== conceptIdx) } : cr
    ));
    setCriteriaHasChanges(true);
  };

  const handleRegenerate = () => {
    Alert.alert(
      t("stage_details.evaluation_criteria.title"),
      t("stage_details.evaluation_criteria.regenerate_confirm"),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "destructive",
          onPress: async () => {
            setIsRegenerating(true);
            try {
              const newCriteria = await generateEvaluationCriteria(stage.id);
              setLocalCriteria(newCriteria || []);
              setCriteriaHasChanges(false);
            } catch (err) {
              console.error("Regenerate criteria failed:", err);
            } finally {
              setIsRegenerating(false);
            }
          }
        }
      ]
    );
  };

  const maxWeightForIndex = (idx) => {
    const othersTotal = localCriteria.reduce((s, cr, i) => i === idx ? s : s + (Number(cr.weight) || 0), 0);
    return Math.max(0, 100 - othersTotal);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
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
            <Text style={[styles.fieldLabel, isRtl && styles.textRight]}>{t("pipeline.stage_type")}</Text>
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
            <Text style={[styles.fieldLabel, isRtl && styles.textRight]}>{t("pipeline.description")}</Text>
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
            <Text style={[styles.fieldLabel, isRtl && styles.textRight]}>{t("pipeline.num_questions")}</Text>
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

          {/* Evaluation Criteria Section */}
          {AI_STAGE_TYPES.has(form.stage_type) && (
            <View style={styles.criteriaSection}>
              <View style={[styles.criteriaHeader, isRtl && styles.rowReverse]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.criteriaTitle, isRtl && styles.textRight]}>{t("stage_details.evaluation_criteria.title")}</Text>
                  <Text style={[styles.criteriaSubtitle, isRtl && styles.textRight]}>{t("stage_details.evaluation_criteria.subtitle")}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleRegenerate}
                  disabled={isRegenerating || stage.is_locked}
                  style={[styles.regenerateBtn, isRegenerating && styles.regenerateBtnDisabled]}
                >
                  {isRegenerating ? (
                    <ActivityIndicator size="small" color={c.primary} />
                  ) : (
                    <Ionicons name="refresh" size={14} color={c.primary} />
                  )}
                  <Text style={styles.regenerateBtnText}>
                    {isRegenerating
                      ? t("stage_details.evaluation_criteria.regenerating")
                      : t("stage_details.evaluation_criteria.regenerate")}
                  </Text>
                </TouchableOpacity>
              </View>

              {localCriteria.length > 0 && (
                <View style={[styles.weightTotalBox, weightValid ? styles.weightTotalBoxValid : styles.weightTotalBoxInvalid, isRtl && styles.rowReverse]}>
                  <Text style={[styles.weightTotalText, weightValid ? styles.weightTotalTextValid : styles.weightTotalTextInvalid]}>
                    {t("stage_details.evaluation_criteria.weight_total")}
                  </Text>
                  <Text style={[styles.weightTotalValue, weightValid ? styles.weightTotalTextValid : styles.weightTotalTextInvalid]}>
                    {weightTotal} / 100
                  </Text>
                </View>
              )}

              {localCriteria.length === 0 ? (
                <Text style={styles.criteriaEmpty}>{t("stage_details.evaluation_criteria.empty")}</Text>
              ) : (
                <View style={styles.criteriaList}>
                  {localCriteria.map((criterion, idx) => (
                    <View key={idx} style={styles.criterionCard}>
                      <View style={[styles.criterionHeader, isRtl && styles.rowReverse]}>
                        <TextInput
                          style={[styles.criterionInput, stage.is_locked && styles.fieldDisabled, isRtl && styles.textRight]}
                          value={criterion.competency}
                          editable={!stage.is_locked}
                          onChangeText={(val) => updateCriterion(idx, "competency", val)}
                          placeholder="Competency name"
                          placeholderTextColor={c['muted-foreground']}
                        />
                        {Number(criterion.weight) === 0 && (
                          <View style={[styles.zeroWeightBadge, isRtl && styles.rowReverse]}>
                            <Ionicons name="warning" size={12} color={c.amber[600]} />
                            <Text style={styles.zeroWeightText}>{t("stage_details.evaluation_criteria.weight_zero_warning")}</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          onPress={() => deleteCriterion(idx)}
                          disabled={stage.is_locked}
                          style={styles.deleteCriterionBtn}
                        >
                          <Ionicons name="close" size={16} color={c['muted-foreground']} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.criterionWeightContainer}>
                        <View style={[styles.criterionWeightRow, isRtl && styles.rowReverse]}>
                          <Text style={styles.criterionWeightLabel}>WEIGHT</Text>
                          <View style={styles.criterionWeightBadge}>
                            <Text style={styles.criterionWeightBadgeText}>{criterion.weight}%</Text>
                          </View>
                        </View>
                        <WeightSlider
                          value={Number(criterion.weight)}
                          maxValue={maxWeightForIndex(idx) + Number(criterion.weight)}
                          onChange={(val) => updateCriterion(idx, "weight", Math.round(val * 100) / 100)} // Ensure no floating point weirdness
                          disabled={stage.is_locked}
                        />
                      </View>

                      <View style={[styles.criterionOptionsRow, isRtl && styles.rowReverse]}>
                        <TouchableOpacity
                          style={[styles.checkboxRow, isRtl && styles.rowReverse]}
                          onPress={() => !stage.is_locked && updateCriterion(idx, "required", !criterion.required)}
                          disabled={stage.is_locked}
                        >
                          <Ionicons
                            name={criterion.required ? "checkbox" : "square-outline"}
                            size={18}
                            color={criterion.required ? c.primary : c['muted-foreground']}
                          />
                          <Text style={styles.checkboxLabel}>{t("stage_details.evaluation_criteria.required_label")}</Text>
                        </TouchableOpacity>

                        <View style={[styles.minQuestionsRow, isRtl && styles.rowReverse]}>
                          <Text style={styles.checkboxLabel}>{t("stage_details.evaluation_criteria.min_questions_label")}</Text>
                          <TextInput
                            style={[styles.minQuestionsInput, stage.is_locked && styles.fieldDisabled]}
                            value={String(criterion.min_questions)}
                            editable={!stage.is_locked}
                            keyboardType="numeric"
                            onChangeText={(val) => updateCriterion(idx, "min_questions", parseInt(val) || 1)}
                          />
                        </View>
                      </View>

                      <View style={styles.conceptsSection}>
                        <Text style={[styles.criterionWeightLabel, isRtl && styles.textRight]}>{t("stage_details.evaluation_criteria.concepts_label")}</Text>
                        <View style={[styles.conceptsWrap, isRtl && styles.rowReverse]}>
                          {(criterion.concepts || []).map((concept, ci) => (
                            <View key={ci} style={[styles.conceptBadge, isRtl && styles.rowReverse]}>
                              <Text style={styles.conceptBadgeText}>{concept}</Text>
                              {!stage.is_locked && (
                                <TouchableOpacity onPress={() => removeConcept(idx, ci)} style={styles.conceptDelete}>
                                  <Ionicons name="close" size={12} color={c.primary} />
                                </TouchableOpacity>
                              )}
                            </View>
                          ))}
                        </View>
                        {!stage.is_locked && (
                          <View style={[styles.addConceptRow, isRtl && styles.rowReverse]}>
                            <TextInput
                              style={[styles.addConceptInput, isRtl && styles.textRight]}
                              value={newConceptInputs[idx] || ""}
                              onChangeText={(val) => setNewConceptInputs(prev => ({ ...prev, [idx]: val }))}
                              placeholder={t("stage_details.evaluation_criteria.add_concept_placeholder")}
                              placeholderTextColor={c['muted-foreground']}
                              onSubmitEditing={() => addConcept(idx)}
                            />
                            <TouchableOpacity style={styles.addConceptBtn} onPress={() => addConcept(idx)}>
                              <Ionicons name="add" size={16} color={c.primary} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {!stage.is_locked && localCriteria.length < 4 && (
                <TouchableOpacity onPress={addCriterion} style={[styles.addCriterionBtn, isRtl && styles.rowReverse]}>
                  <Ionicons name="add" size={16} color={c.primary} />
                  <Text style={styles.addCriterionText}>{t("stage_details.evaluation_criteria.add_competency")}</Text>
                </TouchableOpacity>
              )}

              {criteriaHasChanges && !weightValid && (
                <Text style={[styles.criteriaError, isRtl && styles.textRight]}>{t("stage_details.evaluation_criteria.weight_error")}</Text>
              )}
            </View>
          )}

          
        </View>

      </ScrollView>

      <View style={styles.saveFooter}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={(!hasChanges && !criteriaHasChanges) || stage.is_locked || isSaving || (criteriaHasChanges && (!weightValid || hasZeroWeight))}
          style={[
            styles.saveButton,
            ((!hasChanges && !criteriaHasChanges) || stage.is_locked || (criteriaHasChanges && (!weightValid || hasZeroWeight))) && styles.saveButtonDisabled,
            isRtl && styles.rowReverse,
          ]}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={c.card} />
          ) : (
            <Ionicons name="save-outline" size={16} color={((!hasChanges && !criteriaHasChanges) || stage.is_locked || (criteriaHasChanges && (!weightValid || hasZeroWeight))) ? c['muted-foreground'] : c.card} />
          )}
          <Text style={[styles.saveButtonText, ((!hasChanges && !criteriaHasChanges) || stage.is_locked || (criteriaHasChanges && (!weightValid || hasZeroWeight))) && styles.saveButtonTextDisabled, isRtl && styles.textRight]}>
            {isSaving ? t("pipeline.saving") : t("pipeline.save_changes")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(c, isRtl) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingBottom: 20,
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
      fontWeight: '600',
      color: c['muted-foreground'],
      marginBottom: 4,
    },
    emptyHint: {
      fontSize: 12,

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
      fontWeight: '700',
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
      fontWeight: '700',
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
      fontWeight: '600',
      color: c['muted-foreground'],
    },
    headerType: {
      fontSize: 12,

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
      fontWeight: '600',
      color: c['muted-foreground'],
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,

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

      flex: 1,
      color: c.foreground,
    },
    bottomSheetOverlay: {
      flex: 1,
      backgroundColor: `${c.foreground}80`,
      justifyContent: "flex-end",
    },
    bottomSheetContent: {
      backgroundColor: c.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 32,
      maxHeight: "65%",
    },
    bottomSheetHandleWrap: {
      alignItems: "center",
      paddingVertical: 10,
    },
    bottomSheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
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
    modalOptionLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
    },
    modalOptionText: {
      fontSize: 15,

      color: c.foreground,
    },
    modalOptionTextSelected: {
      color: c.primary,
      fontWeight: '600',
    },
    weightHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    weightValue: {
      fontSize: 13,
      fontWeight: '700',
      color: c.primary,
    },
    textArea: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,

      color: c.foreground,
      minHeight: 72,
      textAlignVertical: "top",
    },
    
    // Criteria Editor Styles
    criteriaSection: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 16,
      gap: 12,
    },
    criteriaHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    criteriaTitle: {
      fontSize: 10,
      fontWeight: '700',
      color: c['muted-foreground'],
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    criteriaSubtitle: {
      fontSize: 11,

      color: c['muted-foreground'],
      opacity: 0.8,
      marginTop: 2,
    },
    regenerateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: c.primary + "1A",
      borderWidth: 1,
      borderColor: c.primary + "33",
      borderRadius: 8,
    },
    regenerateBtnDisabled: {
      opacity: 0.5,
    },
    regenerateBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.primary,
    },
    weightTotalBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    weightTotalBoxValid: {
      backgroundColor: c.emerald[50] || "#ecfdf5",
      borderColor: c.emerald[200] || "#a7f3d0",
    },
    weightTotalBoxInvalid: {
      backgroundColor: c.red[50] || "#fef2f2",
      borderColor: c.red[200] || "#fecaca",
    },
    weightTotalText: {
      fontSize: 12,
      fontWeight: '700',
    },
    weightTotalTextValid: {
      color: c.emerald[700] || "#047857",
    },
    weightTotalTextInvalid: {
      color: c.red[700] || "#b91c1c",
    },
    weightTotalValue: {
      fontSize: 12,
      fontWeight: '700',
    },
    criteriaEmpty: {
      fontSize: 12,

      color: c['muted-foreground'],
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: 16,
    },
    criteriaList: {
      gap: 16,
    },
    criterionCard: {
      padding: 12,
      backgroundColor: c.secondary,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      gap: 12,
    },
    criterionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    criterionInput: {
      flex: 1,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 12,
      fontWeight: '600',
      color: c.foreground,
    },
    zeroWeightBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 4,
      backgroundColor: c.amber[50] || "#fffbeb",
      borderWidth: 1,
      borderColor: c.amber[200] || "#fde68a",
      borderRadius: 6,
    },
    zeroWeightText: {
      fontSize: 10,
      fontWeight: '700',
      color: c.amber[700] || "#b45309",
    },
    deleteCriterionBtn: {
      padding: 4,
    },
    criterionWeightContainer: {
      gap: 8,
    },
    criterionWeightRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    criterionWeightLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: c['muted-foreground'],
      letterSpacing: 1,
    },
    criterionWeightBadge: {
      backgroundColor: c.primary + "1A",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    criterionWeightBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: c.primary,
    },
    criterionOptionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    checkboxLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: c['muted-foreground'],
    },
    minQuestionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    minQuestionsInput: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      width: 40,
      textAlign: "center",
      fontSize: 12,
      fontWeight: '700',
      color: c.foreground,
    },
    conceptsSection: {
      gap: 8,
    },
    conceptsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    conceptBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: c.primary + "1A",
      borderWidth: 1,
      borderColor: c.primary + "33",
      borderRadius: 12,
    },
    conceptBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.primary,
    },
    conceptDelete: {
      padding: 2,
    },
    addConceptRow: {
      flexDirection: "row",
      gap: 6,
    },
    addConceptInput: {
      flex: 1,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 12,
      fontWeight: '500',
      color: c.foreground,
    },
    addConceptBtn: {
      paddingHorizontal: 10,
      justifyContent: "center",
      backgroundColor: c.primary + "1A",
      borderWidth: 1,
      borderColor: c.primary + "33",
      borderRadius: 8,
    },
    addCriterionBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      backgroundColor: c.primary + "0D",
      borderWidth: 1,
      borderColor: c.primary + "33",
      borderStyle: "dashed",
      borderRadius: 12,
    },
    addCriterionText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.primary,
    },
    criteriaError: {
      fontSize: 12,
      fontWeight: '600',
      color: c.red[500],
    },

    advancedSection: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 16,
      gap: 12,
    },
    advancedLabel: {
      fontSize: 10,
      fontWeight: '700',
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
      fontWeight: '600',
      color: c.card,
    },
    saveButtonTextDisabled: {

      color: c['muted-foreground'],
    },
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
  });
}
