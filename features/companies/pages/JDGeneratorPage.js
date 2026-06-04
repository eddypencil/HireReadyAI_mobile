import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import { SENIORITY_LEVEL } from "../../../shared/constants/enums";
import { supabase } from "../../../shared/services/supabase";
import { useJobs } from "../../jobs/hooks/useJobs";
import { useCompany } from "./CompanyLayout";
import { useUser } from "../../auth/context/user.context";

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
  const { company } = useCompany();
  const { profile } = useUser();
  const { createJob } = useJobs();

  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [keyNotes, setKeyNotes] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [previewMeta, setPreviewMeta] = useState({
    title: "",
    seniority: "",
    workLocation: "",
    jobType: "",
    experienceYears: "",
  });
  const [errors, setErrors] = useState({});

  const [generated, setGenerated] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [published, setPublished] = useState(false);

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

  async function handleGenerate() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGenerating(true);
    setPreviewMeta({ title, seniority, workLocation, jobType, experienceYears });
    setGenerateError(null);
    setGenerated(false);
    setAiResult(null);

    try {
      const { data: result, error: invokeError } = await supabase.functions.invoke("jd-generate", {
        body: {
          title,
          seniority,
          workLocation,
          location: company?.location || "",
          keyNotes,
          requiredSkills,
          experienceYears,
          companyName: company?.name || "",
          companyIndustry: company?.industry || "",
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
        },
      });
      if (invokeError) throw new Error(invokeError.message);
      setAiResult(result);
      setGenerated(true);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublish() {
    if (!aiResult || !company?.id) return;
    setPublishing(true);
    setPublishError(null);

    try {
      await createJob({
        company_id: company.id,
        created_by_profile_id: profile?.id || null,
        title,
        seniority_level: seniority || null,
        job_type: jobType || null,
        work_location: workLocation || null,
        experience_years: experienceYears || null,
        description: aiResult.description,
        responsibilities: aiResult.responsibilities,
        requirements: aiResult.requirements,
        skills: aiResult.skills,
        salary_min: aiResult.salary_min || null,
        salary_max: aiResult.salary_max || null,
      });
      setPublished(true);
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  const resetAll = () => {
    setPublished(false);
    setGenerated(false);
    setAiResult(null);
    setTitle("");
    setSeniority("");
    setWorkLocation("");
    setJobType("");
    setSalaryMin("");
    setSalaryMax("");
    setKeyNotes("");
    setExperienceYears("");
    setRequiredSkills("");
    setErrors({});
    setPreviewMeta({
      title: "",
      seniority: "",
      workLocation: "",
      jobType: "",
      experienceYears: "",
    });
  };

  if (published) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Job Published!</Text>
        <Text style={styles.successSubtitle}>
          {title} has been published and is now visible to applicants.
        </Text>
        <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
          <Text style={styles.resetBtnText}>Generate another JD</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const inputClass = { ...styles.inputField };
  const labelClass = styles.label;

  return (
    <ScrollView style={styles.pageContainer} contentContainerStyle={styles.pageContent}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Job Description Generator</Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={styles.publishBtn}
            onPress={handlePublish}
            disabled={!generated || publishing}
          >
            <Text style={styles.publishBtnText}>
              {publishing ? "Publishing..." : "Publish JD"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.columns}>
        {/* Form Column */}
        <View style={styles.formColumn}>
          <Text style={styles.sectionTitle}>Role brief</Text>
          <Text style={styles.sectionSubtitle}>
            Fill in the basics - AI handles the rest.
          </Text>

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

            {generateError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{generateError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
              onPress={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.generateBtnText}>Generate JD</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview Column */}
        <View style={styles.previewColumn}>
          {!generated ? (
            <View style={styles.previewEmpty}>
              <Text style={styles.previewEmptyIcon}>★</Text>
              <Text style={styles.previewEmptyTitle}>
                Fill in the role brief
              </Text>
              <Text style={styles.previewEmptySubtitle}>
                and click Generate JD to see the preview
              </Text>
            </View>
          ) : (
            <View style={styles.previewContent}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>★ AI Generated</Text>
              </View>

              <Text style={styles.previewTitle}>{previewMeta.title}</Text>

              <View style={styles.previewMeta}>
                {company?.name && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaText}>{company.name}</Text>
                  </View>
                )}
                {previewMeta.workLocation && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaText}>
                      {previewMeta.workLocation.replace(/_/g, " ")}
                    </Text>
                  </View>
                )}
                {previewMeta.jobType && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaText}>
                      {previewMeta.jobType.replace(/_/g, " ")}
                    </Text>
                  </View>
                )}
                {previewMeta.seniority && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaText}>
                      {previewMeta.seniority}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.salaryDisplay}>
                <Text style={styles.salaryDisplayText}>
                  {aiResult?.salary_min && aiResult?.salary_max
                    ? `${aiResult.salary_min.toLocaleString()} – ${aiResult.salary_max.toLocaleString()} EGP`
                    : "Salary: Confidential"}
                </Text>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>About the role</Text>
                <Text style={styles.previewSectionBody}>
                  {aiResult?.description}
                </Text>
              </View>

              {aiResult?.responsibilities?.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>
                    What you'll do
                  </Text>
                  {aiResult.responsibilities.map((item, i) => (
                    <View key={i} style={styles.listRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.listItem}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {aiResult?.requirements?.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>
                    What we're looking for
                  </Text>
                  {aiResult.requirements.map((item, i) => (
                    <View key={i} style={styles.listRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.listItem}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {aiResult?.skills?.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>
                    Skills & Tools
                  </Text>
                  <View style={styles.skillsGrid}>
                    {aiResult.skills.map((skill, i) => (
                      <View key={i} style={styles.skillRow}>
                        <View style={styles.skillBullet} />
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {publishError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{publishError}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
  },
  headerBtns: {
    flexDirection: "row",
    gap: 10,
  },
  publishBtn: {
    backgroundColor: colors.darkAmethyst[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  publishBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  columns: {
    gap: 20,
  },
  formColumn: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.darkAmethyst[400],
    marginBottom: 20,
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
  errorBanner: {
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
    borderRadius: 8,
    padding: 12,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.red[600],
  },
  generateBtn: {
    backgroundColor: colors.darkAmethyst[600],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  generateBtnDisabled: {
    backgroundColor: colors.darkAmethyst[400],
  },
  generateBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  previewColumn: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 24,
    minHeight: 300,
  },
  previewEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  previewEmptyIcon: {
    fontSize: 36,
    color: colors.darkAmethyst[300],
    marginBottom: 12,
  },
  previewEmptyTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkAmethyst[700],
  },
  previewEmptySubtitle: {
    fontSize: 12,
    color: colors.darkAmethyst[400],
    marginTop: 4,
  },
  previewContent: {
    gap: 20,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    color: colors.darkAmethyst[500],
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
  },
  previewMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaTag: {
    backgroundColor: colors.darkAmethyst[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.darkAmethyst[600],
    textTransform: "capitalize",
  },
  salaryDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  salaryDisplayText: {
    fontSize: 13,
    color: colors.darkAmethyst[600],
  },
  previewSection: {
    gap: 8,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 2,
  },
  previewSectionBody: {
    fontSize: 13,
    color: colors.darkAmethyst[900],
    lineHeight: 20,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.darkAmethyst[400],
    marginTop: 6,
  },
  listItem: {
    fontSize: 13,
    color: colors.darkAmethyst[900],
    flex: 1,
    lineHeight: 20,
  },
  skillsGrid: {
    gap: 8,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skillBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.darkAmethyst[500],
  },
  skillText: {
    fontSize: 13,
    color: colors.darkAmethyst[900],
  },
  // success views
  successContainer: {
    flex: 1,
    backgroundColor: colors.darkAmethyst[50],
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.darkAmethyst[100],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[200],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successCheck: {
    fontSize: 28,
    color: colors.darkAmethyst[600],
    fontWeight: "700",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 13,
    color: colors.darkAmethyst[700],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  resetBtn: {
    backgroundColor: colors.darkAmethyst[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
});
