import { useState, useEffect, useRef, useMemo } from "react";
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
import { STAGE_TYPE_OPTIONS } from "../constants/stageLibrary";
import { colors } from "../../../src/theme";

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

import { Ionicons } from "@expo/vector-icons";

export default function StageDetailsPanel({ stage, stages, onUpdate }) {
  const [form, setForm] = useState({
    name: "",
    stage_type: "",
    weight: 1,
    description: "",
  });
  const weightDebounceRef = useRef(null);

  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name || "",
        stage_type: stage.stage_type || "",
        weight: stage.weight ?? 1,
        description: stage.description || "",
      });
    }
  }, [stage?.id]);

  useEffect(() => {
    return () => {
      if (weightDebounceRef.current) clearTimeout(weightDebounceRef.current);
    };
  }, []);

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

  const handleImmediateChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onUpdate(stage.id, updated);
  };

  const handleWeightChange = (value) => {
    const numVal = parseFloat(value);
    setForm((prev) => ({ ...prev, weight: numVal }));

    if (weightDebounceRef.current) clearTimeout(weightDebounceRef.current);
    weightDebounceRef.current = setTimeout(() => {
      onUpdate(stage.id, { ...form, weight: numVal });
    }, DEBOUNCE_MS);
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
            onChangeText={(t) => handleImmediateChange("name", t)}
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
            onSelect={(val) => handleImmediateChange("stage_type", val)}
            placeholder="Select type..."
            disabled={stage.is_locked}
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.weightHeader}>
            <Text style={styles.fieldLabel}>Weight</Text>
            <Text style={styles.weightValue}>{weightPct}%</Text>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${(form.weight / Math.max(maxAllowedWeight, 0.01)) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.sliderLabels}>
              {[0, 25, 50, 75, 100].map((pct) => {
                const val = (pct / 100) * maxAllowedWeight;
                return (
                  <TouchableOpacity
                    key={pct}
                    onPress={() => handleWeightChange(val.toFixed(2))}
                    style={[
                      styles.sliderDot,
                      Math.round(form.weight * 100) === Math.round(val * 100) && styles.sliderDotActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sliderDotLabel,
                        Math.round(form.weight * 100) === Math.round(val * 100) && styles.sliderDotLabelActive,
                      ]}
                    >
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.textArea, stage.is_locked && styles.fieldDisabled]}
            value={form.description}
            onChangeText={(t) => handleImmediateChange("description", t)}
            editable={!stage.is_locked}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Describe what happens in this stage..."
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
  sliderContainer: {
    gap: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: colors.darkAmethyst[600],
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderDot: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 4,
  },
  sliderDotActive: {
    backgroundColor: colors.darkAmethyst[50],
  },
  sliderDotLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: "500",
  },
  sliderDotLabelActive: {
    color: colors.darkAmethyst[600],
    fontWeight: "700",
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
});
