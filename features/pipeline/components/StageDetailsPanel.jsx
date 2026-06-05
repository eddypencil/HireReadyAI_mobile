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
import { colors } from "../../../src/theme";
import WeightSlider from "../../../shared/ui/Slider";

const DEBOUNCE_MS = 400;

function PickerDropdown({ options, selected, onSelect, placeholder, disabled }) {
  const [visible, setVisible] = useState(false);
  const displayValue = selected
    ? options.find((o) => o.value === selected)?.label || placeholder
    : placeholder;

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectField, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectFieldText,
            !selected && { color: colors.gray[400] },
            disabled && { color: colors.gray[500] },
          ]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.gray[400]} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>{placeholder}</Text>
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
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
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
          <Ionicons name="settings-outline" size={22} color={colors.gray[400]} />
        </View>
        <Text style={styles.emptyTitle}>Stage Settings</Text>
        <Text style={styles.emptyHint}>
          Select a stage from the canvas to configure it.
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
        <Text style={styles.headerLabel}>Stage Settings</Text>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {form.name || "Untitled Stage"}
          </Text>
          {stage.is_locked && (
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>Locked</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerType} numberOfLines={1}>
          {form.stage_type?.replace(/_/g, " ")}
        </Text>
      </View>

      <View style={styles.fields}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Stage Name</Text>
          <TextInput
            style={[styles.input, stage.is_locked && styles.fieldDisabled]}
            value={form.name}
            onChangeText={(t) => handleChange("name", t)}
            editable={!stage.is_locked}
            placeholder="Stage name"
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Stage Type</Text>
          <PickerDropdown
            options={[
              ...STAGE_TYPE_OPTIONS,
              ...(stage.is_locked && !STAGE_TYPE_OPTIONS.some(o => o.value === form.stage_type)
                ? [{ value: form.stage_type, label: form.stage_type.replace(/_/g, " ") }]
                : []),
            ]}
            selected={form.stage_type}
            onSelect={(val) => handleChange("stage_type", val)}
            placeholder="Select type..."
            disabled={stage.is_locked}
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.weightHeader}>
            <Text style={styles.fieldLabel}>Weight</Text>
            <Text style={styles.weightValue}>{weightPct}%</Text>
          </View>
          <WeightSlider
            value={form.weight ?? 0}
            maxValue={maxAllowedWeight}
            onChange={handleWeightChange}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.textArea, stage.is_locked && styles.fieldDisabled]}
            value={form.description}
            onChangeText={(t) => handleChange("description", t)}
            editable={!stage.is_locked}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Describe what happens in this stage..."
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Number of Questions</Text>
          <TextInput
            style={[styles.input, stage.is_locked && styles.fieldDisabled]}
            value={String(form.num_questions || 0)}
            onChangeText={(t) => handleChange("num_questions", parseInt(t) || 0)}
            editable={!stage.is_locked}
            keyboardType="numeric"
            placeholder="Enter number of questions..."
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        <View style={styles.advancedSection}>
          <Text style={styles.advancedLabel}>Advanced (Coming Soon)</Text>
          {["AI Evaluation", "Manual Review Required", "Auto Advance", "Auto Reject"].map(
            (label) => (
              <View key={label} style={styles.advancedRow}>
                <Text style={styles.advancedRowText}>{label}</Text>
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
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="save-outline" size={16} color={(!hasChanges || stage.is_locked) ? colors.gray[400] : colors.white} />
          <Text style={[styles.saveButtonText, (!hasChanges || stage.is_locked) && styles.saveButtonTextDisabled]}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[600],
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.darkAmethyst[600],
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
    fontWeight: "700",
    color: colors.gray[900],
    flex: 1,
  },
  lockedBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.gray[500],
  },
  headerType: {
    fontSize: 12,
    color: colors.gray[400],
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
    fontWeight: "600",
    color: colors.gray[600],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.gray[900],
  },
  fieldDisabled: {
    backgroundColor: colors.gray[50],
    color: colors.gray[500],
  },
  selectField: {
    borderWidth: 1,
    borderColor: colors.gray[200],
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
    color: colors.gray[900],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.gray[900],
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
    backgroundColor: colors.darkAmethyst[50],
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.gray[800],
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  weightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.darkAmethyst[600],
  },

  textArea: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.gray[900],
    minHeight: 72,
    textAlignVertical: "top",
  },
  advancedSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 16,
    gap: 12,
  },
  advancedLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
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
    color: colors.gray[500],
  },
  advancedToggle: {
    width: 32,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  saveFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.darkAmethyst[600],
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  saveButtonTextDisabled: {
    color: colors.gray[400],
  },
});
