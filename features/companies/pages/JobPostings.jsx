import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import { updateJobPosting } from "../services/companies.service";
import { getPipeline } from "../../pipeline/services/pipeline.service";
import { useCompany } from "./CompanyLayout";

const TABS = ["Open", "All", "Closed"];

export default function JobPostings() {
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
        salary_min: editForm.salary_min,
        salary_max: editForm.salary_max,
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
    } catch {
      Alert.alert("Error", "Failed to update job details.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleArrayInputKeyDown = (e, field) => {
    if (e.nativeEvent.key === "Enter" && e.nativeEvent.text.trim()) {
      const value = e.nativeEvent.text.trim();
      setEditForm((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value],
      }));
      e.target.value = "";
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
    const accentColor = isPublished ? colors.emerald[500] : colors.gray[400];

    return (
      <TouchableOpacity
        style={[styles.jobListItem, isSelected && styles.jobListItemSelected]}
        onPress={() => {
          setSelectedJobId(job.id);
          setIsEditing(false);
          setShowList(false);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.jobListItemContent}>
          <View style={styles.jobListTopRow}>
            <Text
              style={[
                styles.jobListTitle,
                isSelected && styles.jobListTitleSelected,
              ]}
              numberOfLines={1}
            >
              {job.title}
            </Text>
            <View style={[styles.jobStatusBadge, { backgroundColor: isPublished ? colors.emerald[50] : colors.gray[100] }]}>
              <Text style={[styles.jobStatusText, { color: isPublished ? colors.emerald[700] : colors.gray[500] }]}>
                {isPublished ? "Active" : "Closed"}
              </Text>
            </View>
          </View>
          <View style={styles.jobListMeta}>
            <Ionicons name="briefcase-outline" size={11} color={colors.gray[400]} />
            <Text style={styles.jobListMetaText}>{job.seniority_level || "Any"}</Text>
            <View style={styles.jobMetaDivider} />
            <Ionicons name="location-outline" size={11} color={colors.gray[400]} />
            <Text style={styles.jobListMetaText}>{job.work_location || "Remote"}</Text>
            <View style={styles.jobMetaDivider} />
            <Ionicons name="people-outline" size={11} color={colors.gray[400]} />
            <Text style={styles.jobListMetaText}>{applicantCount} applicant{applicantCount !== 1 ? "s" : ""}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />
      </TouchableOpacity>
    );
  };

  if (!showList && selectedJob) {
    return (
      <ScrollView style={styles.detailContainer} contentContainerStyle={styles.detailContent}>
        <TouchableOpacity
          style={styles.backToList}
          onPress={() => setShowList(true)}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back to jobs</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderLeft}>
            {isEditing ? (
              <TextInput
                style={styles.editTitleInput}
                value={editForm.title}
                onChangeText={(t) =>
                  setEditForm({ ...editForm, title: t })
                }
              />
            ) : (
              <Text style={styles.detailTitle}>{selectedJob.title}</Text>
            )}
            <Text style={styles.detailSubtitle}>
              {selectedJob.seniority_level || "Any"} ·{" "}
              {selectedJob.work_location || "Any"} ·{" "}
              {selectedJob.job_type?.replace(/_/g, "-") || "Full-time"}
            </Text>
          </View>
          <View style={styles.detailHeaderActions}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.actionBtnOutlineText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.actionBtnPrimaryText}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.actionBtnOutline}
                onPress={handleEditClick}
              >
                <Text style={styles.actionBtnOutlineText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="layers-outline" size={14} color={colors.primary} />
              <Text style={styles.infoLabel}>SENIORITY LEVEL</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.editInfoInput}
                value={editForm.seniority_level || ""}
                onChangeText={(t) =>
                  setEditForm({ ...editForm, seniority_level: t })
                }
              />
            ) : (
              <Text style={styles.infoValue}>
                {selectedJob.seniority_level || "N/A"}
              </Text>
            )}
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text style={styles.infoLabel}>LOCATION</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.editInfoInput}
                value={editForm.work_location || ""}
                onChangeText={(t) =>
                  setEditForm({ ...editForm, work_location: t })
                }
              />
            ) : (
              <Text style={styles.infoValue}>
                {selectedJob.work_location || "N/A"}
              </Text>
            )}
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="briefcase-outline" size={14} color={colors.primary} />
              <Text style={styles.infoLabel}>TYPE</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.editInfoInput}
                value={editForm.job_type || ""}
                onChangeText={(t) =>
                  setEditForm({ ...editForm, job_type: t })
                }
              />
            ) : (
              <Text style={styles.infoValue}>
                {selectedJob.job_type?.replace(/_/g, "-") || "N/A"}
              </Text>
            )}
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="cash-outline" size={14} color={colors.primary} />
              <Text style={styles.infoLabel}>SALARY</Text>
            </View>
            {isEditing ? (
              <View style={styles.salaryEditRow}>
                <TextInput
                  style={styles.editInfoInput}
                  value={String(editForm.salary_min || "")}
                  onChangeText={(t) =>
                    setEditForm({ ...editForm, salary_min: t })
                  }
                  placeholder="Min"
                  keyboardType="numeric"
                />
                <Text style={styles.salaryDash}>-</Text>
                <TextInput
                  style={styles.editInfoInput}
                  value={String(editForm.salary_max || "")}
                  onChangeText={(t) =>
                    setEditForm({ ...editForm, salary_max: t })
                  }
                  placeholder="Max"
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <Text style={styles.infoValue}>
                {selectedJob.salary_min
                  ? `$${selectedJob.salary_min.toLocaleString()}`
                  : "N/A"}{" "}
                -{" "}
                {selectedJob.salary_max
                  ? `$${selectedJob.salary_max.toLocaleString()}`
                  : "N/A"}
              </Text>
            )}
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={styles.infoLabel}>PUBLISHED</Text>
            </View>
            <Text style={styles.infoValue}>
              {formatDate(selectedJob.created_at)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="flash-outline" size={14} color={colors.primary} />
              <Text style={styles.infoLabel}>AI SHORTLIST</Text>
            </View>
            <Text style={styles.infoValue}>
              {selectedJob.shortlist_entries?.[0]?.count || 0} strong fits
            </Text>
          </View>
        </View>

        {/* Content Cards */}
        <View style={styles.contentCard}>
          <Text style={styles.contentCardTitle}>Job summary</Text>
          {isEditing ? (
            <TextInput
              style={styles.editTextArea}
              value={editForm.description || ""}
              onChangeText={(t) =>
                setEditForm({ ...editForm, description: t })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.contentCardBody}>
              {selectedJob.description || "No description provided."}
            </Text>
          )}
        </View>

        {/* Responsibilities */}
          <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>Responsibilities</Text>
            {isEditing ? (
              <View style={styles.editList}>
                {(editForm.responsibilities || []).map((resp, i) => (
                  <View key={i} style={styles.editListItem}>
                    <TouchableOpacity
                      onPress={() =>
                        removeArrayItem(i, "responsibilities")
                      }
                    >
                      <Text style={styles.removeItem}>✕</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.editListItemInput}
                      value={resp}
                      onChangeText={(t) => {
                        const newArr = [...editForm.responsibilities];
                        newArr[i] = t;
                        setEditForm({
                          ...editForm,
                          responsibilities: newArr,
                        });
                      }}
                    />
                  </View>
                ))}
                <TextInput
                  style={styles.editListAdd}
                  placeholder="Type and press Enter to add..."
                  placeholderTextColor={colors.gray[400]}
                  onSubmitEditing={(e) =>
                    handleArrayInputKeyDown(e, "responsibilities")
                  }
                />
              </View>
            ) : (
              (selectedJob.responsibilities || []).length > 0 ? (
                selectedJob.responsibilities.map((resp, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.listItemText}>{resp}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noContent}>None specified.</Text>
              )
            )}
          </View>

          {/* Requirements */}
          <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>Requirements</Text>
            {isEditing ? (
              <View style={styles.editList}>
                {(editForm.requirements || []).map((req, i) => (
                  <View key={i} style={styles.editListItem}>
                    <TouchableOpacity
                      onPress={() => removeArrayItem(i, "requirements")}
                    >
                      <Text style={styles.removeItem}>✕</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.editListItemInput}
                      value={req}
                      onChangeText={(t) => {
                        const newArr = [...editForm.requirements];
                        newArr[i] = t;
                        setEditForm({
                          ...editForm,
                          requirements: newArr,
                        });
                      }}
                    />
                  </View>
                ))}
                <TextInput
                  style={styles.editListAdd}
                  placeholder="Type and press Enter to add..."
                  placeholderTextColor={colors.gray[400]}
                  onSubmitEditing={(e) =>
                    handleArrayInputKeyDown(e, "requirements")
                  }
                />
              </View>
            ) : (
              (selectedJob.requirements || []).length > 0 ? (
                selectedJob.requirements.map((req, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.listItemText}>{req}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noContent}>None specified.</Text>
              )
            )}
          </View>

        {/* Skills */}
        <View style={styles.contentCard}>
          <Text style={styles.contentCardTitle}>Skills</Text>
          <View style={styles.skillsWrap}>
            {isEditing ? (
              <View style={styles.editSkillsWrap}>
                {(editForm.skills || []).map((skill, i) => (
                  <View key={i} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill}</Text>
                    <TouchableOpacity
                      onPress={() => removeArrayItem(i, "skills")}
                    >
                      <Text style={styles.removeChip}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TextInput
                  style={styles.addSkillInput}
                  placeholder="Add skill..."
                  placeholderTextColor={colors.gray[400]}
                  onSubmitEditing={(e) =>
                    handleArrayInputKeyDown(e, "skills")
                  }
                />
              </View>
            ) : (
              (selectedJob.skills || []).length > 0 ? (
                selectedJob.skills.map((skill, i) => (
                  <View key={i} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noContent}>None specified.</Text>
              )
            )}
          </View>
        </View>

        {/* Pipeline Preview */}
        <View style={styles.contentCard}>
          <Text style={styles.pipelineHeaderLabel}>
            HIRING PIPELINE FOR THIS JOB
          </Text>
          <Text style={styles.pipelineTitle}>
            {selectedJob.title} Pipeline
          </Text>
          <Text style={styles.pipelineSubtitle}>
            {loadingStages
              ? "Loading stages..."
              : `${pipelineStages.length} stages`}
          </Text>

          {loadingStages ? (
            <ActivityIndicator
              size="small"
              color={colors.darkAmethyst[600]}
              style={{ marginTop: 16 }}
            />
          ) : pipelineStages.length === 0 ? (
            <View style={styles.emptyPipeline}>
              <Text style={styles.emptyPipelineText}>
                No stages defined for this pipeline.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              style={styles.pipelineScroll}
              showsHorizontalScrollIndicator={false}
            >
              {pipelineStages.map((stage, idx) => (
                <View key={stage.id} style={styles.stageCard}>
                  <Text style={styles.stageLabel}>Stage {idx + 1}</Text>
                  <Text style={styles.stageName} numberOfLines={1}>
                    {stage.name}
                  </Text>
                  <View style={styles.stageBadges}>
                    <View style={styles.weightBadge}>
                      <Text style={styles.weightBadgeText}>
                        {Math.round((stage.weight || 0) * 100)}%
                      </Text>
                    </View>
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>AI</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.listHeaderLabel}>OPEN ROLES</Text>
          <Text style={styles.listHeaderHint}>Click to view details</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobListItem}
        contentContainerStyle={styles.jobList}
        ListEmptyComponent={
          <Text style={styles.emptyList}>No jobs found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  listHeaderLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.gray[400],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  listHeaderHint: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.gray[50],
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.darkAmethyst[50],
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[500],
  },
  tabTextActive: {
    color: colors.darkAmethyst[700],
    fontWeight: "600",
  },
  jobList: {
    padding: 16,
    gap: 10,
  },
  jobListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    paddingRight: 12,
  },
  jobListItemSelected: {
    borderColor: colors.darkAmethyst[200],
    backgroundColor: colors.darkAmethyst[50],
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
    color: colors.gray[800],
    flex: 1,
    marginRight: 8,
  },
  jobListTitleSelected: {
    color: colors.primary,
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
    color: colors.gray[500],
  },
  jobMetaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.gray[300],
  },
  emptyList: {
    textAlign: "center",
    padding: 24,
    fontSize: 13,
    color: colors.gray[500],
  },
  // Detail styles
  detailContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
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
    color: colors.primary,
    marginLeft: 2,
  },
  detailHeader: {
    marginBottom: 14,
  },
  detailHeaderLeft: {
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
  },
  editTitleInput: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailSubtitle: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 4,
    textTransform: "capitalize",
  },
  detailHeaderActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray[700],
  },
  actionBtnPrimary: {
    backgroundColor: colors.darkAmethyst[600],
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.white,
  },
  // Info grid
  infoGrid: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 17,
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
    color: colors.gray[500],
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[900],
    textTransform: "capitalize",
  },
  editInfoInput: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    color: colors.gray[900],
  },
  salaryEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  salaryDash: {
    fontSize: 13,
    color: colors.gray[400],
  },
  // content cards
  contentCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  contentCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 10,
  },
  contentCardBody: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  editTextArea: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.gray[600],
    textAlignVertical: "top",
    minHeight: 80,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  checkIcon: {
    fontSize: 13,
    color: colors.darkAmethyst[500],
    marginTop: 1,
  },
  listItemText: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
    lineHeight: 20,
  },
  noContent: {
    fontSize: 13,
    color: colors.gray[400],
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
  removeItem: {
    fontSize: 14,
    color: colors.gray[400],
  },
  editListItemInput: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    color: colors.gray[900],
  },
  editListAdd: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.gray[500],
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
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  skillChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.darkAmethyst[700],
  },
  removeChip: {
    fontSize: 12,
    color: colors.darkAmethyst[400],
  },
  addSkillInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.gray[500],
    minWidth: 100,
  },
  // Pipeline
  pipelineHeaderLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.darkAmethyst[600],
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pipelineTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.gray[900],
  },
  pipelineSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 16,
  },
  pipelineScroll: {
    marginTop: 8,
  },
  emptyPipeline: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyPipelineText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  stageCard: {
    width: 220,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.white,
    marginRight: 12,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  stageName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 10,
  },
  stageBadges: {
    flexDirection: "row",
    gap: 6,
  },
  weightBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gray[600],
  },
  aiBadge: {
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.darkAmethyst[600],
  },
});
