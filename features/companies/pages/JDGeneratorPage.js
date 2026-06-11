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
import { colors } from "../../../src/theme";
import { SENIORITY_LEVEL } from "../../../shared/constants/enums";
import { useNavigation } from "@react-navigation/native";
import { useCompany } from "./CompanyLayout";

function PickerDropdown({ options, selected, onSelect, placeholder, error }) {
  const [visible, setVisible] = useState(false);
  const displayValue = selected
    ? options.find((o) => o.value === selected)?.label || placeholder
    : placeholder;

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectField, error && styles.selectFieldError]}
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
  const navigation = useNavigation();
  const { company } = useCompany();

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
    if (!title) newErrors.title = "Job title is required";
    if (!seniority) newErrors.seniority = "Please select a seniority level";
    if (!jobType) newErrors.jobType = "Please select a job type";
    if (!workLocation) newErrors.workLocation = "Please select a work type";
    if (!experienceYears)
      newErrors.experienceYears = "Please select experience required";
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
      <Text style={styles.pageTitle}>Job Description Generator</Text>

      <View style={styles.formCard}>
        <View style={styles.formFields}>
          <View style={styles.fieldGroup}>
            <Text style={labelClass}>Role title</Text>
            <TextInput
              style={[inputClass, errors.title && styles.inputError]}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setErrors((p) => ({ ...p, title: "" }));
              }}
              placeholder="Job title"
              placeholderTextColor={colors.darkAmethyst[300]}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.halfField}>
              <Text style={labelClass}>Seniority</Text>
              <PickerDropdown
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
              <Text style={labelClass}>Job type</Text>
              <PickerDropdown
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
            <Text style={labelClass}>Work type</Text>
            <PickerDropdown
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
            <Text style={labelClass}>Experience required</Text>
            <TextInput
              style={[inputClass, errors.experienceYears && styles.inputError]}
              value={experienceYears}
              onChangeText={(t) => {
                setExperienceYears(t);
                setErrors((p) => ({ ...p, experienceYears: "" }));
              }}
              placeholder="e.g. 1-3 years"
              placeholderTextColor={colors.darkAmethyst[300]}
            />
            {errors.experienceYears && (
              <Text style={styles.errorText}>{errors.experienceYears}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>
              Required skills{" "}
              <Text style={styles.optionalTag}>(optional)</Text>
            </Text>
            <TextInput
              style={inputClass}
              value={requiredSkills}
              onChangeText={setRequiredSkills}
              placeholder="Required skills"
              placeholderTextColor={colors.darkAmethyst[300]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>
              Salary range (EGP){" "}
              <Text style={styles.optionalTag}>(optional)</Text>
            </Text>
            <View style={styles.salaryRow}>
              <TextInput
                style={[inputClass, styles.salaryInput]}
                value={salaryMin}
                onChangeText={setSalaryMin}
                placeholder="Min"
                placeholderTextColor={colors.darkAmethyst[300]}
                keyboardType="numeric"
              />
              <Text style={styles.salarySep}>to</Text>
              <TextInput
                style={[inputClass, styles.salaryInput]}
                value={salaryMax}
                onChangeText={setSalaryMax}
                placeholder="Max"
                placeholderTextColor={colors.darkAmethyst[300]}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={labelClass}>
              Key notes{" "}
              <Text style={styles.optionalTag}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              value={keyNotes}
              onChangeText={setKeyNotes}
              placeholder="Additional hiring notes..."
              placeholderTextColor={colors.darkAmethyst[300]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerate}
          >
            <Text style={styles.generateBtnText}>Generate JD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: colors.darkAmethyst[50],
  },
  pageContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
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
    fontWeight: "600",
    color: colors.darkAmethyst[600],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  optionalTag: {
    fontWeight: "400",
    color: colors.darkAmethyst[400],
    textTransform: "none",
    letterSpacing: 0,
  },
  inputField: {
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: colors.darkAmethyst[700],
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.red[400],
  },
  selectField: {
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectFieldError: {
    borderColor: colors.red[400],
  },
  selectFieldText: {
    fontSize: 13,
    color: colors.darkAmethyst[700],
  },
  selectFieldPlaceholder: {
    color: colors.darkAmethyst[300],
  },
  selectArrow: {
    fontSize: 10,
    color: colors.darkAmethyst[300],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
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
    color: colors.darkAmethyst[950],
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: colors.darkAmethyst[50],
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.darkAmethyst[900],
  },
  modalOptionTextSelected: {
    color: colors.darkAmethyst[600],
    fontWeight: "600",
  },
  errorText: {
    fontSize: 11,
    color: colors.red[500],
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
    color: colors.darkAmethyst[300],
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: colors.darkAmethyst[900],
    backgroundColor: colors.white,
    minHeight: 100,
  },
  generateBtn: {
    backgroundColor: colors.darkAmethyst[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  generateBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
