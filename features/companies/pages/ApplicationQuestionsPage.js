// ============================================================================
// ApplicationQuestionsPage.js
// Full-screen page for adding screening questions before publishing a job.
// Navigated to from JDGeneratorResultPage after user taps "Yes, Add Questions".
// On "Publish with Questions" → publishes and pops back to success state.
//
// Register in AppNavigator inside the recruiter stack:
//   <RootStack.Screen name="ApplicationQuestions" component={ApplicationQuestionsPage}
//     options={{ headerShown: true, headerTitle: 'Screening Questions',
//                headerStyle: { backgroundColor: colors.primary },
//                headerTintColor: colors.white }} />
// ============================================================================

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import { supabase } from "../../../shared/services/supabase";
import { useJobs } from "../../jobs/hooks/useJobs";
import { useCompany } from "./CompanyLayout";
import { useUser } from "../../auth/context/user.context";
import { seedAnchorStages } from "../../recruiter/services/candidatesPipline.service";

const QUESTION_TYPES = [
  { label: "Short answer", value: "text", icon: "text-outline" },
  { label: "Long answer", value: "textarea", icon: "document-text-outline" },
  { label: "Yes / No", value: "yes_no", icon: "checkmark-circle-outline" },
];

// ── Small inline type picker modal
function TypePickerModal({ visible, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.typeOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.typeModal}>
          <Text style={styles.typeModalTitle}>Answer Type</Text>
          {QUESTION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeOption,
                selected === t.value && styles.typeOptionSelected,
              ]}
              onPress={() => {
                onSelect(t.value);
                onClose();
              }}
            >
              <Ionicons
                name={t.icon}
                size={18}
                color={selected === t.value ? colors.darkAmethyst[600] : colors.darkAmethyst[400]}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  selected === t.value && styles.typeOptionTextSelected,
                ]}
              >
                {t.label}
              </Text>
              {selected === t.value && (
                <Ionicons name="checkmark" size={16} color={colors.darkAmethyst[600]} style={{ marginLeft: "auto" }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Single question card
function QuestionCard({ question, index, total, onChange, onRemove }) {
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const typeLabel = QUESTION_TYPES.find((t) => t.value === question.type)?.label || "Short answer";

  return (
    <View style={styles.questionCard}>
      {/* Card header: number + remove */}
      <View style={styles.questionCardHeader}>
        <View style={styles.questionNumberBadge}>
          <Text style={styles.questionNumberText}>{index + 1}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.red[400]} />
        </TouchableOpacity>
      </View>

      {/* Question text input */}
      <TextInput
        style={styles.questionInput}
        value={question.question}
        onChangeText={(t) => onChange("question", t)}
        placeholder="Write your question here..."
        placeholderTextColor={colors.darkAmethyst[300]}
        multiline
        textAlignVertical="top"
      />

      {/* Type selector */}
      <TouchableOpacity
        style={styles.typeSelector}
        onPress={() => setTypePickerVisible(true)}
        activeOpacity={0.75}
      >
        <Ionicons
          name={QUESTION_TYPES.find((t) => t.value === question.type)?.icon || "text-outline"}
          size={15}
          color={colors.darkAmethyst[500]}
        />
        <Text style={styles.typeSelectorText}>{typeLabel}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.darkAmethyst[400]} />
      </TouchableOpacity>

      <TypePickerModal
        visible={typePickerVisible}
        selected={question.type}
        onSelect={(v) => onChange("type", v)}
        onClose={() => setTypePickerVisible(false)}
      />
    </View>
  );
}

// ── Main page
export default function ApplicationQuestionsPage({ route, navigation }) {
  const { jobParams, aiResult, companyId, profileId } = route.params;
  const { createJob } = useJobs();
  const { reload: reloadCompany } = useCompany();

  const [questions, setQuestions] = useState([
    { question: "", type: "text", order_index: 0 },
  ]);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { question: "", type: "text", order_index: prev.length },
    ]);
  }

  function removeQuestion(index) {
    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order_index: i }))
    );
  }

  function updateQuestion(index, field, value) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const newJob = await createJob({
        company_id: companyId,
        created_by_profile_id: profileId,
        title: jobParams.title,
        seniority_level: jobParams.seniority || null,
        job_type: jobParams.jobType || null,
        work_location: jobParams.workLocation || null,
        experience_years: jobParams.experienceYears || null,
        description: aiResult.description,
        responsibilities: aiResult.responsibilities,
        requirements: aiResult.requirements,
        skills: aiResult.skills,
        salary_min: jobParams.salaryMin ? Number(jobParams.salaryMin) : null,
        salary_max: jobParams.salaryMax ? Number(jobParams.salaryMax) : null,
      });

      if (newJob?.id) {
        await seedAnchorStages(newJob.id);

        const questionRows = questions
          .filter((q) => q.question.trim())
          .map((q, i) => ({
            job_id: newJob.id,
            question: q.question.trim(),
            type: q.type,
            order_index: i,
          }));

        if (questionRows.length > 0) {
          const { error: qError } = await supabase
            .from("questions")
            .insert(questionRows);
          if (qError) throw new Error(`Failed to save questions: ${qError.message}`);
        }
      }

      reloadCompany();
      // Navigate to success — replace so back button doesn't bring them here
      navigation.replace("JDPublishSuccess", { title: jobParams.title });
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  const filledCount = questions.filter((q) => q.question.trim()).length;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Page header info */}
        <View style={styles.headerCard}>
          <Ionicons name="help-circle-outline" size={28} color={colors.darkAmethyst[500]} />
          <View style={styles.headerCardText}>
            <Text style={styles.headerCardTitle}>Application Questions</Text>
            <Text style={styles.headerCardSubtitle}>
              Add questions applicants will answer when applying for{" "}
              <Text style={styles.headerCardJob}>{jobParams.title}</Text>
            </Text>
          </View>
        </View>

        {/* ── Questions list */}
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-ellipses-outline" size={40} color={colors.darkAmethyst[200]} />
            <Text style={styles.emptyTitle}>No questions yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Add Question" below to get started
            </Text>
          </View>
        ) : (
          <View style={styles.questionsList}>
            {questions.map((q, i) => (
              <QuestionCard
                key={i}
                question={q}
                index={i}
                total={questions.length}
                onChange={(field, value) => updateQuestion(i, field, value)}
                onRemove={() => removeQuestion(i)}
              />
            ))}
          </View>
        )}

        {/* ── Add question button */}
        <TouchableOpacity
          style={styles.addQuestionBtn}
          onPress={addQuestion}
          activeOpacity={0.75}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.darkAmethyst[600]} />
          <Text style={styles.addQuestionBtnText}>Add Question</Text>
        </TouchableOpacity>

        {/* ── Error banner */}
        {publishError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.red[500]} />
            <Text style={styles.errorBannerText}>{publishError}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Sticky bottom publish bar */}
      <View style={styles.bottomBar}>
        {filledCount > 0 && (
          <Text style={styles.questionCount}>
            {filledCount} question{filledCount !== 1 ? "s" : ""} ready
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.publishBtn,
            (publishing || filledCount === 0) && styles.publishBtnDisabled,
          ]}
          onPress={handlePublish}
          disabled={publishing || filledCount === 0}
          activeOpacity={0.85}
        >
          {publishing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="arrow-up-circle-outline" size={18} color={colors.white} />
              <Text style={styles.publishBtnText}>Publish with Questions</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.darkAmethyst[50],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 16,
    gap: 16,
  },

  // ── Header info card
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  headerCardText: {
    flex: 1,
    gap: 4,
  },
  headerCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
  },
  headerCardSubtitle: {
    fontSize: 13,
    color: colors.darkAmethyst[500],
    lineHeight: 19,
  },
  headerCardJob: {
    fontWeight: "600",
    color: colors.darkAmethyst[700],
  },

  // ── Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkAmethyst[400],
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.darkAmethyst[300],
    textAlign: "center",
  },

  // ── Questions list
  questionsList: {
    gap: 12,
  },

  // ── Question card
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 16,
    gap: 12,
  },
  questionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.darkAmethyst[600],
    alignItems: "center",
    justifyContent: "center",
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  removeBtn: {
    padding: 4,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.darkAmethyst[900],
    backgroundColor: colors.darkAmethyst[50],
    minHeight: 72,
    lineHeight: 20,
  },

  // ── Type selector pill
  typeSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeSelectorText: {
    fontSize: 12,
    color: colors.darkAmethyst[600],
    fontWeight: "500",
  },

  // ── Type picker modal
  typeOverlay: {
    flex: 1,
    backgroundColor: "rgba(1,26,74,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  typeModal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    gap: 4,
  },
  typeModalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 8,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  typeOptionSelected: {
    backgroundColor: colors.darkAmethyst[50],
  },
  typeOptionText: {
    fontSize: 14,
    color: colors.darkAmethyst[700],
  },
  typeOptionTextSelected: {
    color: colors.darkAmethyst[600],
    fontWeight: "600",
  },

  // ── Add question button
  addQuestionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.darkAmethyst[200],
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  addQuestionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.darkAmethyst[600],
  },

  // ── Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
    borderRadius: 10,
    padding: 12,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.red[600],
    flex: 1,
  },

  // ── Sticky bottom bar
  bottomBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.darkAmethyst[100],
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  questionCount: {
    fontSize: 12,
    color: colors.darkAmethyst[400],
    textAlign: "center",
  },
  publishBtn: {
    backgroundColor: colors.darkAmethyst[600],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  publishBtnDisabled: {
    backgroundColor: colors.darkAmethyst[300],
  },
  publishBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});