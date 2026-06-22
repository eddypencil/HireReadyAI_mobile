// ============================================================================
// ApplicationQuestionsPage.js
// Full-screen page for adding screening questions before publishing a job.
// Navigated to from JDGeneratorResultPage after user taps "Yes, Add Questions".
// On "Publish with Questions" → publishes and pops back to success state.
//
// Register in AppNavigator inside the recruiter stack:
//   <RootStack.Screen name="ApplicationQuestions" component={ApplicationQuestionsPage}
//     options={{ headerShown: true, headerTitle: 'Screening Questions',
//                headerStyle: { backgroundColor: c.primary },
//                headerTintColor: c.white }} />
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { supabase } from "../../../shared/services/supabase";
import { useJobs } from "../../jobs/hooks/useJobs";
import { useCompany } from "./CompanyLayout";
import { useUser } from "../../auth/context/user.context";
import { seedAnchorStages } from "../../recruiter/services/candidatesPipline.service";

const QUESTION_TYPES = (t) => [
  { label: t("companies.short_answer"), value: "text", icon: "text-outline" },
  { label: t("companies.long_answer"), value: "textarea", icon: "document-text-outline" },
  { label: t("companies.yes_no"), value: "yes_no", icon: "checkmark-circle-outline" },
];

// ── Small inline type picker modal
function TypePickerModal({ visible, selected, onSelect, onClose }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const types = QUESTION_TYPES(t);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.typeOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.typeModal}>
          <Text style={styles.typeModalTitle}>{t("companies.answer_type")}</Text>
          {types.map((typ) => (
            <TouchableOpacity
              key={typ.value}
              style={[
                styles.typeOption,
                selected === typ.value && styles.typeOptionSelected,
              ]}
              onPress={() => {
                onSelect(typ.value);
                onClose();
              }}
            >
              <Ionicons
                name={typ.icon}
                size={18}
                color={selected === typ.value ? c.primary : c.accent}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  selected === typ.value && styles.typeOptionTextSelected,
                ]}
              >
                {typ.label}
              </Text>
              {selected === typ.value && (
                <Ionicons name="checkmark" size={16} color={c.primary} style={{ marginLeft: "auto" }} />
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
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const types = QUESTION_TYPES(t);
  const typeLabel = types.find((x) => x.value === question.type)?.label || t("companies.short_answer");

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
          <Ionicons name="trash-outline" size={16} color={c.red[400]} />
        </TouchableOpacity>
      </View>

      {/* Question text input */}
      <TextInput
        style={styles.questionInput}
        value={question.question}
        onChangeText={(t) => onChange("question", t)}
        placeholder="Write your question here..."
        placeholderTextColor={c['muted-foreground']}
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
          name={types.find((x) => x.value === question.type)?.icon || "text-outline"}
          size={15}
          color={c['muted-foreground']}
        />
        <Text style={styles.typeSelectorText}>{typeLabel}</Text>
        <Ionicons name="chevron-down" size={14} color={c.accent} />
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
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ── Page header info */}
        <View style={styles.headerCard}>
          <Ionicons name="help-circle-outline" size={28} color={c['muted-foreground']} />
          <View style={styles.headerCardText}>
            <Text style={styles.headerCardTitle}>{t("companies.application_questions")}</Text>
            <Text style={styles.headerCardSubtitle}>
              {t("companies.application_questions_subtitle", { title: jobParams.title })}
            </Text>
          </View>
        </View>

        {/* ── Questions list */}
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-ellipses-outline" size={40} color={c['muted-foreground']} />
            <Text style={styles.emptyTitle}>{t("companies.no_questions_yet")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("companies.tap_add_question")}
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
          <Ionicons name="add-circle-outline" size={20} color={c.primary} />
          <Text style={styles.addQuestionBtnText}>{t("companies.add_question")}</Text>
        </TouchableOpacity>

        {/* ── Error banner */}
        {publishError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color={c.red[500]} />
            <Text style={styles.errorBannerText}>{publishError}</Text>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Sticky bottom publish bar */}
      <View style={styles.bottomBar}>
        {filledCount > 0 && (
          <Text style={styles.questionCount}>
            {filledCount === 1 ? t("companies.question_ready", { count: filledCount }) : t("companies.questions_ready", { count: filledCount })}
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
            <ActivityIndicator size="small" color={c.white} />
          ) : (
            <>
              <Ionicons name="arrow-up-circle-outline" size={18} color={c.white} />
              <Text style={styles.publishBtnText}>{t("companies.publish_with_questions")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c['surface-muted'],
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
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
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
      fontWeight: '700',
      color: c.foreground,
    },
    headerCardSubtitle: {
      fontSize: 13,
      color: c['muted-foreground'],
      lineHeight: 19,
    },
    headerCardJob: {
      fontWeight: '600',
      color: c.foreground,
    },

    // ── Empty state
    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.accent,
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: 13,
      color: c['muted-foreground'],
      textAlign: "center",
    },

    // ── Questions list
    questionsList: {
      gap: 12,
    },

    // ── Question card
    questionCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
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
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    questionNumberText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.white,
    },
    removeBtn: {
      padding: 4,
    },
    questionInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: c.foreground,
      backgroundColor: c['surface-muted'],
      minHeight: 72,
      lineHeight: 20,
    },

    // ── Type selector pill
    typeSelector: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      backgroundColor: c['surface-muted'],
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    typeSelectorText: {
      fontSize: 12,
      color: c.primary,
      fontWeight: '500',
    },

    // ── Type picker modal
    typeOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    typeModal: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      width: "100%",
      gap: 4,
    },
    typeModalTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.foreground,
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
      backgroundColor: c['surface-muted'],
    },
    typeOptionText: {
      fontSize: 14,
      color: c.foreground,
    },
    typeOptionTextSelected: {
      color: c.primary,
      fontWeight: '600',
    },

    // ── Add question button
    addQuestionBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1.5,
      borderColor: c['muted-foreground'],
      borderStyle: "dashed",
      borderRadius: 14,
      paddingVertical: 14,
      backgroundColor: c.card,
    },
    addQuestionBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
    },

    // ── Error banner
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.red[50],
      borderWidth: 1,
      borderColor: c.red[200],
      borderRadius: 10,
      padding: 12,
    },
    errorBannerText: {
      fontSize: 12,
      color: c.red[600],
      flex: 1,
    },

    // ── Sticky bottom bar
    bottomBar: {
      backgroundColor: c.card,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 8,
    },
    questionCount: {
      fontSize: 12,
      color: c.accent,
      textAlign: "center",
    },
    publishBtn: {
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    publishBtnDisabled: {
      backgroundColor: c['muted-foreground'],
    },
    publishBtnText: {
      color: c.white,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}