import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { Card } from "../../../shared/ui/Card";
import { updateJobPosting } from "../services/companies.service";
import { getPipeline } from "../../pipeline/services/pipeline.service";
import { useCompany } from "./CompanyLayout";

const TABS = ["All", "Open", "Closed"];

function PickerDropdown({ options, selected, onSelect, placeholder, theme, accessibilityLabel }) {
  const [visible, setVisible] = useState(false);
  const displayValue = selected
    ? options.find((o) => o.value === selected)?.label || placeholder
    : placeholder;

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectField, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityHint={`Select ${placeholder?.toLowerCase()}`}
      >
        <Text
          style={[
            styles.selectFieldText,
            { color: theme.foreground },
            !selected && { color: theme.muted },
          ]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <Ionicons name="chevron-down" size={14} color={theme.muted} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: theme.foreground }]}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    selected === item.value && { backgroundColor: theme.primaryLight },
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: theme.foreground },
                      selected === item.value && { color: theme.primary, fontWeight: "600" },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selected === item.value && (
                    <Ionicons name="checkmark" size={18} color={theme.primary} />
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

export default function JobPostings() {
  const insets = useSafeAreaInsets();
  const { theme: appTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const c = appTheme.colors;
  const theme = {
    isDark,
    background: c.background,
    surface: c.card,
    card: c.card,
    border: c.border,
    foreground: c.foreground,
    muted: c['muted-foreground'],
    mutedForeground: c['muted-foreground'],
    primary: c.primary,
    primaryLight: `${c.primary}26`,
    accent: c.accent,
    success: c.success,
    successBg: `${c.success}1a`,
    successText: c.success,
    danger: c.destructive,
    grayBg: c['surface-muted'],
    grayText: c['muted-foreground'],
    chipBg: c['surface-muted'],
    chipBorder: c.border,
    chipText: c.primary,
    overlay: `${c.foreground}66`,
  };
  const navigation = useNavigation();
  const { jobs } = useCompany();
  const [searchQuery, setSearchQuery] = useState("");
  const [localJobs, setLocalJobs] = useState(jobs);
  const [activeTab, setActiveTab] = useState("Open");
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showList, setShowList] = useState(true);

  const [pipelineStages, setPipelineStages] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);

  const seniorityOptions = useMemo(() => [
    { label: t("companies.seniority_intern"), value: "intern" },
    { label: t("companies.seniority_junior"), value: "junior" },
    { label: t("companies.seniority_mid"), value: "mid" },
    { label: t("companies.seniority_senior"), value: "senior" },
    { label: t("companies.seniority_lead"), value: "lead" },
  ], [t]);

  const jobTypeOptions = useMemo(() => [
    { label: t("companies.full_time"), value: "full_time" },
    { label: t("companies.part_time"), value: "part_time" },
  ], [t]);

  const workLocationOptions = useMemo(() => [
    { label: t("companies.on_site"), value: "on_site" },
    { label: t("companies.remote"), value: "remote" },
    { label: t("companies.hybrid"), value: "hybrid" },
  ], [t]);

  useEffect(() => {
    setLocalJobs(jobs);
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs]);

  const selectedJob = useMemo(
    () => localJobs.find((j) => j.id === selectedJobId) || localJobs[0],
    [localJobs, selectedJobId]
  );

  useEffect(() => {
    if (!selectedJobId) return;
    (async () => {
      setLoadingStages(true);
      try {
        const pipeline = await getPipeline(selectedJobId);
        setPipelineStages(pipeline?.recruitment_stages || []);
      } catch {
        setPipelineStages([]);
      } finally {
        setLoadingStages(false);
      }
    })();
  }, [selectedJobId]);

  const getJobStatus = (job) => {
    return Date.parse(job.closed_at) < Date.now() ? "Closed" : "Published";
  };

  const tabCounts = useMemo(() => {
    const open = localJobs.filter(j => getJobStatus(j) === "Published").length;
    const closed = localJobs.filter(j => getJobStatus(j) === "Closed").length;
    return { Open: open, All: localJobs.length, Closed: closed };
  }, [localJobs]);

  const filteredJobs = useMemo(() => {
    return localJobs.filter((job) => {
      const status = getJobStatus(job);
      const matchesTab =
        activeTab === "All" ||
        (status === "Published" && activeTab === "Open") ||
        (status === "Closed" && activeTab === "Closed");
      const matchesSearch = job.title
        .toLowerCase()
        .includes((searchQuery || "").toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [localJobs, activeTab, searchQuery]);

  const handleEditClick = () => {
    setEditForm({ ...selectedJob });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const updates = {
        title: editForm.title,
        description: editForm.description,
        job_type: editForm.job_type,
        work_location: editForm.work_location,
        salary_min: editForm.salary_min ? Number(editForm.salary_min) : null,
        salary_max: editForm.salary_max ? Number(editForm.salary_max) : null,
        seniority_level: editForm.seniority_level,
        responsibilities: editForm.responsibilities,
        requirements: editForm.requirements,
        skills: editForm.skills,
      };
      const updatedJob = await updateJobPosting(selectedJobId, updates);
      setLocalJobs((prev) =>
        prev.map((job) =>
          job.id === selectedJobId ? { ...job, ...updatedJob } : job
        )
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update job:", err);
      Alert.alert(t("companies.error_title"), t("companies.update_failed"));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("companies.recently");
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleArrayInputSubmit = (e, field) => {
    const text = e.nativeEvent.text;
    if (text.trim()) {
      setEditForm((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), text.trim()],
      }));
    }
  };

  const removeArrayItem = (index, field) => {
    setEditForm((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const renderJobListItem = ({ item: job }) => {
    const isSelected = job.id === selectedJobId;
    const status = getJobStatus(job);
    const applicantCount = job.applications?.[0]?.count || 0;
    const isPublished = status === "Published";

    return (
      <TouchableOpacity
        style={[
          styles.jobListItem,
          { backgroundColor: theme.card, borderColor: isSelected ? theme.primary : theme.border },
          isSelected && { backgroundColor: theme.primaryLight },
        ]}
        onPress={() => {
          setSelectedJobId(job.id);
          setIsEditing(false);
          setShowList(false);
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("companies.job_accessibility_label", { title: job.title, status: isPublished ? t("companies.active") : t("companies.closed"), count: applicantCount })}
        accessibilityHint={t("companies.opens_job_details")}
      >
        <View style={styles.jobListItemContent}>
          <View style={styles.jobListTopRow}>
            <Text
              style={[styles.jobListTitle, { color: theme.foreground }]}
              numberOfLines={1}
            >
              {job.title}
            </Text>
            <View
              style={[
                styles.jobStatusBadge,
                { backgroundColor: isPublished ? theme.successBg : theme.grayBg },
              ]}
            >
              <Text
                style={[
                  styles.jobStatusText,
                  { color: isPublished ? theme.successText : theme.grayText },
                ]}
              >
                {isPublished ? t("companies.active") : t("companies.closed")}
              </Text>
            </View>
          </View>
          <View style={styles.jobListMeta}>
            <Ionicons name="briefcase-outline" size={11} color={theme.muted} />
            <Text style={[styles.jobListMetaText, { color: theme.muted }]}>{job.seniority_level || t("companies.any")}</Text>
            <View style={[styles.jobMetaDivider, { backgroundColor: theme.muted }]} />
            <Ionicons name="location-outline" size={11} color={theme.muted} />
            <Text style={[styles.jobListMetaText, { color: theme.muted }]}>{job.work_location || t("companies.remote")}</Text>
            <View style={[styles.jobMetaDivider, { backgroundColor: theme.muted }]} />
            <Ionicons name="people-outline" size={11} color={theme.muted} />
            <Text style={[styles.jobListMetaText, { color: theme.muted }]}>{t("companies.applicant_count", { count: applicantCount })}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.muted} />
      </TouchableOpacity>
    );
  };

  if (!showList && selectedJob) {
    return (
      <View style={[styles.detailContainer, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <ScrollView contentContainerStyle={styles.detailContent}>
          <TouchableOpacity
            style={styles.backToList}
            onPress={() => setShowList(true)}
            accessibilityRole="button"
            accessibilityLabel={t("companies.back_to_jobs_accessible")}
          >
            <Ionicons name="chevron-back" size={20} color={theme.primary} />
            <Text style={[styles.backText, { color: theme.primary }]}>{t("companies.back_to_jobs")}</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderLeft}>
              {isEditing ? (
                <TextInput
                  style={[styles.editTitleInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.foreground }]}
                  value={editForm.title}
                  onChangeText={(t) => setEditForm({ ...editForm, title: t })}
                  accessibilityLabel={t("companies.job_title_input")}
                />
              ) : (
                <Text style={[styles.detailTitle, { color: theme.foreground }]}>{selectedJob.title}</Text>
              )}
              <Text style={[styles.detailSubtitle, { color: theme.muted }]}>
                {selectedJob.seniority_level || t("companies.any")} ·{" "}
                {selectedJob.work_location || t("companies.any")} ·{" "}
                {selectedJob.job_type?.replace(/_/g, "-") || t("companies.full_time")}
              </Text>
            </View>
            <View style={styles.detailHeaderActions}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtnOutline, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={handleCancelEdit}
                    accessibilityRole="button"
                    accessibilityLabel={t("companies.cancel_editing")}
                  >
                    <Text style={[styles.actionBtnOutlineText, { color: theme.foreground }]}>{t("companies.cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtnPrimary, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel={saving ? t("companies.saving_accessible") : t("companies.save_accessible")}
                  >
                    <Text style={styles.actionBtnPrimaryText}>
                      {saving ? t("companies.saving") : t("companies.save")}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.actionBtnOutline, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={handleEditClick}
                  accessibilityRole="button"
                  accessibilityLabel={t("companies.edit_job")}
                >
                  <Text style={[styles.actionBtnOutlineText, { color: theme.foreground }]}>{t("companies.edit")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Info Grid */}
          <Card style={[styles.infoGrid, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="layers-outline" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.muted }]}>{t("companies.seniority_level_label")}</Text>
              </View>
              {isEditing ? (
                <PickerDropdown
                  options={seniorityOptions}
                  selected={editForm.seniority_level}
                  onSelect={(val) => setEditForm({ ...editForm, seniority_level: val })}
                  placeholder={t("companies.select_level")}
                  theme={theme}
                  accessibilityLabel={t("companies.seniority_selector")}
                />
              ) : (
                <Text style={[styles.infoValue, { color: theme.foreground }]}>
                  {selectedJob.seniority_level || t("companies.na")}
                </Text>
              )}
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="location-outline" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.muted }]}>{t("companies.location_label")}</Text>
              </View>
              {isEditing ? (
                <PickerDropdown
                  options={workLocationOptions}
                  selected={editForm.work_location}
                  onSelect={(val) => setEditForm({ ...editForm, work_location: val })}
                  placeholder={t("companies.select_location")}
                  theme={theme}
                  accessibilityLabel={t("companies.location_selector")}
                />
              ) : (
                <Text style={[styles.infoValue, { color: theme.foreground }]}>
                  {selectedJob.work_location || t("companies.na")}
                </Text>
              )}
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="briefcase-outline" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.muted }]}>{t("companies.type_label")}</Text>
              </View>
              {isEditing ? (
                <PickerDropdown
                  options={jobTypeOptions}
                  selected={editForm.job_type}
                  onSelect={(val) => setEditForm({ ...editForm, job_type: val })}
                  placeholder={t("companies.select_type")}
                  theme={theme}
                  accessibilityLabel={t("companies.type_selector")}
                />
              ) : (
                <Text style={[styles.infoValue, { color: theme.foreground }]}>
                  {selectedJob.job_type?.replace(/_/g, "-") || t("companies.na")}
                </Text>
              )}
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="cash-outline" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.muted }]}>{t("companies.salary_label")}</Text>
              </View>
              {isEditing ? (
                <View style={styles.salaryEditRow}>
                  <TextInput
                    style={[styles.editInfoInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.foreground }]}
                    value={String(editForm.salary_min || "")}
                    onChangeText={(t) => setEditForm({ ...editForm, salary_min: t })}
                    placeholder={t("companies.min")}
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                    accessibilityLabel={t("companies.min_salary")}
                  />
                  <Text style={[styles.salaryDash, { color: theme.muted }]}>-</Text>
                  <TextInput
                    style={[styles.editInfoInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.foreground }]}
                    value={String(editForm.salary_max || "")}
                    onChangeText={(t) => setEditForm({ ...editForm, salary_max: t })}
                    placeholder={t("companies.max")}
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                    accessibilityLabel={t("companies.max_salary")}
                  />
                </View>
              ) : (
                <Text style={[styles.infoValue, { color: theme.foreground }]}>
                  {selectedJob.salary_min
                    ? `$${selectedJob.salary_min.toLocaleString()}`
                    : t("companies.na")}{" "}
                  -{" "}
                  {selectedJob.salary_max
                    ? `$${selectedJob.salary_max.toLocaleString()}`
                    : t("companies.na")}
                </Text>
              )}
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.muted }]}>{t("companies.published_label")}</Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.foreground }]}>
                {formatDate(selectedJob.created_at)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="flash-outline" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.muted }]}>{t("companies.ai_shortlist_label")}</Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.foreground }]}>
                {t("companies.strong_fits", { count: selectedJob.shortlist_entries?.[0]?.count || 0 })}
              </Text>
            </View>
          </Card>

          {/* Content Cards */}
          <Card style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.contentCardTitle, { color: theme.foreground }]}>{t("companies.job_summary")}</Text>
            {isEditing ? (
              <TextInput
                style={[styles.editTextArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.mutedForeground }]}
                value={editForm.description || ""}
                onChangeText={(t) => setEditForm({ ...editForm, description: t })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel={t("companies.description_input")}
              />
            ) : (
              <Text style={[styles.contentCardBody, { color: theme.mutedForeground }]}>
                {selectedJob.description || t("companies.no_description")}
              </Text>
            )}
          </Card>

          {/* Responsibilities */}
          <Card style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.contentCardTitle, { color: theme.foreground }]}>{t("companies.responsibilities")}</Text>
            {isEditing ? (
              <View style={styles.editList}>
                {(editForm.responsibilities || []).map((resp, i) => (
                  <View key={i} style={styles.editListItem}>
                    <TouchableOpacity
                      onPress={() => removeArrayItem(i, "responsibilities")}
                      accessibilityRole="button"
                      accessibilityLabel={t("companies.remove_responsibility", { text: resp })}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={theme.muted} />
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.editListItemInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.foreground }]}
                      value={resp}
                      onChangeText={(t) => {
                        const newArr = [...editForm.responsibilities];
                        newArr[i] = t;
                        setEditForm({ ...editForm, responsibilities: newArr });
                      }}
                    />
                  </View>
                ))}
                <TextInput
                  style={[styles.editListAdd, { backgroundColor: theme.card, borderColor: theme.border, color: theme.mutedForeground }]}
                  placeholder={t("companies.type_to_add")}
                  placeholderTextColor={theme.muted}
                  onSubmitEditing={(e) => handleArrayInputSubmit(e, "responsibilities")}
                  accessibilityLabel={t("companies.add_responsibility")}
                />
              </View>
            ) : (
              (selectedJob.responsibilities || []).length > 0 ? (
                selectedJob.responsibilities.map((resp, i) => (
                  <View key={i} style={styles.listItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                    <Text style={[styles.listItemText, { color: theme.mutedForeground }]}>{resp}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noContent, { color: theme.muted }]}>{t("companies.none_specified")}</Text>
              )
            )}
          </Card>

          {/* Requirements */}
          <Card style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.contentCardTitle, { color: theme.foreground }]}>{t("companies.requirements")}</Text>
            {isEditing ? (
              <View style={styles.editList}>
                {(editForm.requirements || []).map((req, i) => (
                  <View key={i} style={styles.editListItem}>
                    <TouchableOpacity
                      onPress={() => removeArrayItem(i, "requirements")}
                      accessibilityRole="button"
                      accessibilityLabel={t("companies.remove_requirement", { text: req })}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={theme.muted} />
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.editListItemInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.foreground }]}
                      value={req}
                      onChangeText={(t) => {
                        const newArr = [...editForm.requirements];
                        newArr[i] = t;
                        setEditForm({ ...editForm, requirements: newArr });
                      }}
                    />
                  </View>
                ))}
                <TextInput
                  style={[styles.editListAdd, { backgroundColor: theme.card, borderColor: theme.border, color: theme.mutedForeground }]}
                  placeholder={t("companies.type_to_add")}
                  placeholderTextColor={theme.muted}
                  onSubmitEditing={(e) => handleArrayInputSubmit(e, "requirements")}
                  accessibilityLabel={t("companies.add_requirement")}
                />
              </View>
            ) : (
              (selectedJob.requirements || []).length > 0 ? (
                selectedJob.requirements.map((req, i) => (
                  <View key={i} style={styles.listItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                    <Text style={[styles.listItemText, { color: theme.mutedForeground }]}>{req}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noContent, { color: theme.muted }]}>{t("companies.none_specified")}</Text>
              )
            )}
          </Card>

          {/* Skills */}
          <Card style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.contentCardTitle, { color: theme.foreground }]}>{t("companies.skills")}</Text>
            <View style={styles.skillsWrap}>
              {isEditing ? (
                <View style={styles.editSkillsWrap}>
                  {(editForm.skills || []).map((skill, i) => (
                    <View key={i} style={[styles.skillChip, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}>
                      <Text style={[styles.skillChipText, { color: theme.chipText }]}>{skill}</Text>
                      <TouchableOpacity
                        onPress={() => removeArrayItem(i, "skills")}
                        accessibilityRole="button"
                        accessibilityLabel={t("companies.remove_skill", { text: skill })}
                      >
                        <Ionicons name="close" size={14} color={theme.chipText} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput
                    style={[styles.addSkillInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.mutedForeground }]}
                    placeholder={t("companies.add_skill_placeholder")}
                    placeholderTextColor={theme.muted}
                    onSubmitEditing={(e) => handleArrayInputSubmit(e, "skills")}
                    accessibilityLabel={t("companies.add_skill")}
                  />
                </View>
              ) : (
                (selectedJob.skills || []).length > 0 ? (
                  selectedJob.skills.map((skill, i) => (
                    <View key={i} style={[styles.skillChip, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}>
                      <Text style={[styles.skillChipText, { color: theme.chipText }]}>{skill}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noContent, { color: theme.muted }]}>{t("companies.none_specified")}</Text>
                )
              )}
            </View>
          </Card>

          {/* Pipeline Preview */}
          <Card style={[styles.contentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.pipelineHeaderLabel, { color: theme.primary }]}>
              {t("companies.hiring_pipeline")}
            </Text>
            <Text style={[styles.pipelineTitle, { color: theme.foreground }]}>
              {t("companies.pipeline_title", { title: selectedJob.title })}
            </Text>
            <Text style={[styles.pipelineSubtitle, { color: theme.muted }]}>
              {loadingStages
                ? t("companies.loading_stages")
                : t("companies.stages_count", { count: pipelineStages.length })}
            </Text>

            {loadingStages ? (
              <View style={styles.pipelineLoading}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.pipelineLoadingText, { color: theme.muted }]}>{t("companies.loading_pipeline")}</Text>
              </View>
            ) : pipelineStages.length === 0 ? (
              <View style={[styles.emptyPipeline, { borderColor: theme.border }]}>
                <Ionicons name="git-network-outline" size={32} color={theme.muted} />
                <Text style={[styles.emptyPipelineText, { color: theme.muted }]}>{t("companies.no_stages")}</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                style={styles.pipelineScroll}
                showsHorizontalScrollIndicator={false}
              >
                {pipelineStages.map((stage, idx) => (
                  <View key={stage.id} style={[styles.stageCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.stageNumber, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.stageNumberText, { color: theme.primary }]}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stageMeta}>
                      <Text style={[styles.stageLabel, { color: theme.muted }]}>{t("companies.stage_number", { number: idx + 1 })}</Text>
                    </Text>
                    <Text style={[styles.stageName, { color: theme.foreground }]} numberOfLines={2}>
                      {stage.name}
                    </Text>
                    <View style={styles.stageBadges}>
                      <View style={[styles.weightBadge, { backgroundColor: theme.grayBg }]}>
                        <Text style={[styles.weightBadgeText, { color: theme.grayText }]}>
                          {Math.round((stage.weight || 0) * 100)}%
                        </Text>
                      </View>
                      <View style={[styles.aiBadge, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}>
                        <Text style={[styles.aiBadgeText, { color: theme.chipText }]}>AI</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.editPipelineBtn, { backgroundColor: theme.primaryLight, borderColor: theme.chipBorder }]}
              onPress={() => navigation.navigate("PipelineBuilder", { jobId: selectedJob.id })}
              accessibilityRole="button"
              accessibilityLabel={t("companies.edit_pipeline")}
            >
              <Ionicons name="build-outline" size={16} color={theme.primary} />
              <Text style={[styles.editPipelineBtnText, { color: theme.primary }]}>{t("companies.edit_pipeline_btn")}</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[styles.listContainer, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Search + Header */}
      <View style={[styles.listHeader, { borderBottomColor: theme.border }]}>
        <Text style={[styles.listHeaderLabel, { color: theme.muted }]}>{t("companies.open_roles")}</Text>
        <View style={styles.searchRow}>
          <View style={[styles.searchInputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={16} color={theme.muted} />
            <TextInput
              style={[styles.searchInput, { color: theme.foreground }]}
              placeholder={t("companies.search_jobs_placeholder")}
              placeholderTextColor={theme.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel={t("companies.search_jobs_accessible")}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                accessibilityRole="button"
                accessibilityLabel={t("companies.clear_search")}
              >
                <Ionicons name="close-circle" size={16} color={theme.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
        {TABS.map((tab, i) => {
          const count = tabCounts[tab];
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityLabel={t("companies.tab_accessible", { tab: t(`companies.tab_${tab.toLowerCase()}`), count })}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, { color: isActive ? theme.primary : theme.muted }, isActive && styles.tabTextActive]}>
                {t(`companies.tab_${tab.toLowerCase()}`)}
              </Text>
              <View style={[styles.tabCountBadge, { backgroundColor: isActive ? theme.primary : theme.grayBg }]}>
                <Text style={[styles.tabCountText, { color: isActive ? "#fff" : theme.grayText }]}>
                  {count}
                </Text>
              </View>
              {i < TABS.length - 1 && (
                <Text style={[styles.tabSeparator, { color: theme.muted }]}>·</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobListItem}
        contentContainerStyle={styles.jobList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color={theme.muted} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>{t("companies.no_jobs")}</Text>
            <Text style={[styles.emptyHint, { color: theme.muted }]}>
              {searchQuery ? t("companies.try_different_search") : t("companies.create_job_to_start")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  listHeaderLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextActive: {
    fontWeight: "600",
  },
  tabSeparator: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  tabCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "600",
  },
  jobList: {
    padding: 16,
    gap: 10,
  },
  jobListItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingRight: 12,
  },
  jobListItemContent: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 14,
    gap: 8,
  },
  jobListTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  jobListTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  jobStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  jobListMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobListMetaText: {
    fontSize: 12,
  },
  jobMetaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyHint: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // Detail styles
  detailContainer: {
    flex: 1,
  },
  detailContent: {
    padding: 16,
    paddingBottom: 40,
  },
  backToList: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 2,
  },
  detailHeader: {
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  editTitleInput: {
    fontSize: 20,
    fontWeight: "700",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textTransform: "capitalize",
  },
  detailHeaderActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 4,
  },
  actionBtnOutline: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: "500",
  },
  actionBtnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },

  // Info grid
  infoGrid: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 17,
    elevation: 0,
    shadowOpacity: 0,
  },
  infoItem: {
    width: "47%",
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  editInfoInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    flex: 1,
  },
  selectField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectFieldText: {
    fontSize: 13,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
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
  modalOptionText: {
    fontSize: 15,
  },
  salaryEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  salaryDash: {
    fontSize: 13,
  },

  // Content cards
  contentCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
  contentCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  contentCardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  editTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlignVertical: "top",
    minHeight: 80,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  noContent: {
    fontSize: 13,
  },

  // Edit list
  editList: {
    gap: 6,
  },
  editListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editListItemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
  },
  editListAdd: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    marginTop: 4,
  },

  // Skills
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  editSkillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  skillChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addSkillInput: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 13,
    minWidth: 100,
  },

  // Pipeline
  pipelineHeaderLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pipelineTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  pipelineSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  pipelineScroll: {
    marginTop: 8,
  },
  pipelineLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  pipelineLoadingText: {
    fontSize: 13,
  },
  emptyPipeline: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyPipelineText: {
    fontSize: 13,
    textAlign: "center",
  },
  stageCard: {
    width: 200,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
  },
  stageNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stageNumberText: {
    fontSize: 13,
    fontWeight: "700",
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  stageMeta: {
    marginBottom: 6,
  },
  stageName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  stageBadges: {
    flexDirection: "row",
    gap: 6,
  },
  weightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  aiBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  editPipelineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  editPipelineBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
