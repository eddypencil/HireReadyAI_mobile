import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { SENIORITY_LEVEL } from "../../../shared/constants/enums";
import { useNavigation } from "@react-navigation/native";
import { useCompany } from "./CompanyLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function PickerDropdown({ options, selected, onSelect, placeholder, error, c }) {
  const [visible, setVisible] = useState(false);
  const styles = createStyles(c);
  const displayValue = selected
    ? options.find((o) => o.value === selected)?.label || placeholder
    : placeholder;

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectField, error && { borderColor: c.destructive }]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={[
            styles.selectFieldText,
            !selected && styles.selectFieldPlaceholder,
          ]}
        >
          {displayValue}
        </Text>
        <Text style={styles.selectArrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
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
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function JDGeneratorPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { company } = useCompany();
  const styles = createStyles(c);

  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [keyNotes, setKeyNotes] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [errors, setErrors] = useState({});

  const seniorityOptions = Object.values(SENIORITY_LEVEL).map((v) => ({
    label: v.charAt(0).toUpperCase() + v.slice(1),
    value: v,
  }));
  const jobTypeOptions = [
    { label: "Full Time", value: "full_time" },
    { label: "Part Time", value: "part_time" },
  ];
  const workLocationOptions = [
    { label: "On-site", value: "on_site" },
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
  ];

  function validate() {
    const newErrors = {};
    if (!title) newErrors.title = t("companies.title_required");
    if (!seniority) newErrors.seniority = t("companies.seniority_required");
    if (!jobType) newErrors.jobType = t("companies.job_type_required");
    if (!workLocation) newErrors.workLocation = t("companies.work_type_required");
    if (!experienceYears)
      newErrors.experienceYears = t("companies.experience_required_error");
    return newErrors;
  }

  function handleGenerate() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    navigation.navigate("JDGeneratorResult", {
      title,
      seniority,
      workLocation,
      jobType,
      salaryMin,
      salaryMax,
      keyNotes,
      experienceYears,
      requiredSkills,
    });
  }

  const inputClass = { ...styles.inputField };
  const labelClass = styles.label;

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView style={styles.pageContainer} contentContainerStyle={styles.pageContent}>
      <Text style={styles.pageTitle}>{t("companies.jd_generator_title")}</Text>

      <View style={styles.formCard}>
        <View style={styles.formFields}>
          <View style={styles.fieldGroup}>
            <Text style={labelClass}>{t("companies.role_title")}</Text>
            <TextInput
              style={[inputClass, errors.title && styles.inputError]}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setErrors((p) => ({ ...p, title: "" }));
              }}
              placeholder="e.g. Senior Software Engineer"
              placeholderTextColor={c['muted-foreground']}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.halfField}>
              <Text style={labelClass}>{t("companies.seniority")}</Text>
              <PickerDropdown
                c={c}
                options={seniorityOptions}
                selected={seniority}
                onSelect={(v) => {
                  setSeniority(v);
                  setErrors((p) => ({ ...p, seniority: "" }));
                }}
                placeholder="Select seniority"
                error={errors.seniority}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={labelClass}>{t("companies.job_type")}</Text>
              <PickerDropdown
                c={c}
                options={jobTypeOptions}
                selected={jobType}
                onSelect={(v) => {
                  setJobType(v);
                  setErrors((p) => ({ ...p, jobType: "" }));
                }}
                placeholder="Select type"
                error={errors.jobType}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>{t("companies.work_type")}</Text>
            <PickerDropdown
              c={c}
              options={workLocationOptions}
              selected={workLocation}
              onSelect={(v) => {
                setWorkLocation(v);
                setErrors((p) => ({ ...p, workLocation: "" }));
              }}
              placeholder="Select work type"
              error={errors.workLocation}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>{t("companies.experience_required")}</Text>
            <TextInput
              style={[inputClass, errors.experienceYears && styles.inputError]}
              value={experienceYears}
              onChangeText={(t) => {
                setExperienceYears(t);
                setErrors((p) => ({ ...p, experienceYears: "" }));
              }}
              placeholder="e.g. 3+ years"
              placeholderTextColor={c['muted-foreground']}
            />
            {errors.experienceYears && (
              <Text style={styles.errorText}>{errors.experienceYears}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>
              {t("companies.required_skills")}{" "}
              <Text style={styles.optionalTag}>{t("companies.optional")}</Text>
            </Text>
            <TextInput
              style={inputClass}
              value={requiredSkills}
              onChangeText={setRequiredSkills}
              placeholder="Required Skills & Tools"
              placeholderTextColor={c['muted-foreground']}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>
              {t("companies.salary_range")}{" "}
              <Text style={styles.optionalTag}>{t("companies.optional")}</Text>
            </Text>
            <View style={styles.salaryRow}>
              <TextInput
                style={[inputClass, styles.salaryInput]}
                value={salaryMin}
                onChangeText={setSalaryMin}
                placeholder="Min"
                placeholderTextColor={c['muted-foreground']}
                keyboardType="numeric"
              />
              <Text style={styles.salarySep}>to</Text>
              <TextInput
                style={[inputClass, styles.salaryInput]}
                value={salaryMax}
                onChangeText={setSalaryMax}
                placeholder="Max"
                placeholderTextColor={c['muted-foreground']}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>
              {t("companies.key_notes")}{" "}
              <Text style={styles.optionalTag}>{t("companies.optional")}</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              value={keyNotes}
              onChangeText={setKeyNotes}
              placeholder="Any additional notes about the role..."
              placeholderTextColor={c['muted-foreground']}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerate}
          >
            <Text style={styles.generateBtnText}>{t("companies.generate_jd")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: c['surface-muted'],
    },
    pageContent: {
      padding: 20,
      paddingBottom: 40,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: c.foreground,
      marginBottom: 20,
    },
    formCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 24,
    },
    formFields: {
      gap: 18,
    },
    fieldGroup: {
      gap: 4,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: c.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    optionalTag: {
      color: c['muted-foreground'],
      textTransform: "none",
      letterSpacing: 0,
    },
    inputField: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 13,
      color: c.foreground,
      backgroundColor: c.card,
    },
    inputError: {
      borderColor: c.destructive,
    },
    selectField: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: c.card,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectFieldError: {
      borderColor: c.destructive,
    },
    selectFieldText: {
      fontSize: 13,
      color: c.foreground,
    },
    selectFieldPlaceholder: {
      color: c['muted-foreground'],
    },
    selectArrow: {
      fontSize: 10,
      color: c['muted-foreground'],
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: `${c.foreground}66`,
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
      fontWeight: '700',
      color: c.foreground,
      marginBottom: 12,
    },
    modalOption: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    modalOptionSelected: {
      backgroundColor: c['surface-muted'],
    },
    modalOptionText: {
      fontSize: 15,
      color: c.foreground,
    },
    modalOptionTextSelected: {
      color: c.primary,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 11,
      color: c.destructive,
      marginTop: 2,
    },
    fieldRow: {
      flexDirection: "row",
      gap: 12,
    },
    halfField: {
      flex: 1,
    },
    salaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    salaryInput: {
      flex: 1,
    },
    salarySep: {
      fontSize: 13,
      color: c['muted-foreground'],
    },
    textArea: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 13,
      color: c.foreground,
      backgroundColor: c.card,
      minHeight: 100,
    },
    generateBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    generateBtnText: {
      color: c['destructive-foreground'],
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
