import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCandidateProfile, getCandidateStageQuestions } from '../services/candidateProfile.service';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { Video, ResizeMode } from 'expo-av';

const STAGE_ICONS = {
  hr_interview: 'chatbubbles',
  technical_interview: 'desktop',
  assessment_test: 'brain',
  coding_test: 'code-slash',
  video_interview: 'videocam',
  manager_interview: 'people',
  ai_screening: 'sparkles',
};

function createQStyles(c) {
  return StyleSheet.create({
    card: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
    typeIcon: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1 },
    headerTags: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2, flexWrap: 'wrap' },
    typeLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    langTag: { fontSize: 9, fontWeight: '700', color: c.primary, backgroundColor: c.primary + '12', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, textTransform: 'uppercase' },
    timeTag: { fontSize: 9, color: c['muted-foreground'] },
    questionText: { fontSize: 13, fontWeight: '500', color: c.foreground, lineHeight: 18, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    scorePill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    scorePillText: { fontSize: 12, fontWeight: '700' },
    body: { borderTopWidth: 1, borderTopColor: c.border, padding: 14 },

    videoPlayer: { width: '100%', height: 220, borderRadius: 10, backgroundColor: '#000', marginBottom: 12 },
    showMoreBtn: { marginTop: 6, alignSelf: 'flex-start' },
    showMoreText: { fontSize: 12, fontWeight: '700', color: c.primary },
    sectionLabel: { fontSize: 10, fontWeight: '700', color: c['muted-foreground'], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    videoPlaceholder: { fontSize: 13, color: c.primary, fontWeight: '600', marginBottom: 8 },
    transcriptBox: { backgroundColor: c['surface-muted'], borderRadius: 8, padding: 10, borderWidth: 1, borderColor: c.border },
    transcriptLabel: { fontSize: 10, fontWeight: '700', color: c['muted-foreground'], marginBottom: 4, textTransform: 'uppercase' },
    transcriptText: { fontSize: 13, color: c.foreground, lineHeight: 18 },

    answerBox: { backgroundColor: c['surface-muted'], borderRadius: 8, padding: 12, borderWidth: 1, borderColor: c.border },
    answerText: { fontSize: 13, color: c.foreground, lineHeight: 19 },
    langBadge: { fontSize: 11, fontWeight: '700', color: c.primary, backgroundColor: c.primary + '12', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6, textTransform: 'uppercase' },
    codeBox: { backgroundColor: '#0f172a', borderRadius: 10, padding: 14 },
    codeText: { fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0', lineHeight: 18 },
    emptyText: { fontSize: 12, color: c['muted-foreground'], fontStyle: 'italic' },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4, borderWidth: 1, borderColor: c.border },
    rowReverse: { flexDirection: 'row-reverse' },
    optionSelected: { backgroundColor: c.primary + '08', borderColor: c.primary + '30' },
    optionLetter: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: c.border },
    optionLetterText: { fontSize: 10, fontWeight: '700', color: c['muted-foreground'] },
    optionText: { flex: 1, fontSize: 13, color: c.foreground },
    feedbackBox: { backgroundColor: c.accent + '08', borderRadius: 10, borderWidth: 1, borderColor: c.accent + '25', padding: 12, marginTop: 10 },
    feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    feedbackTitle: { fontSize: 10, fontWeight: '700', color: c.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
    feedbackText: { fontSize: 13, color: c.foreground, lineHeight: 18, marginBottom: 8 },
    feedbackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 4 },
    feedbackItemText: { fontSize: 12, color: c['muted-foreground'], flex: 1 },
  });
}

function createAssStyles(c) {
  return StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    banner: {
      backgroundColor: c.primary,
      paddingHorizontal: 16,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowReverse: { flexDirection: 'row-reverse' },
    backButton: { padding: 4 },
    bannerText: { flex: 1 },
    bannerTitle: { fontSize: 18, fontWeight: '700', color: c['destructive-foreground'] },
    bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    questionCount: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    questionCountText: { fontSize: 11, fontWeight: '600', color: c['destructive-foreground'] },
    tabBar: {
      backgroundColor: c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      maxHeight: 44,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: c.primary },
    tabText: { fontSize: 13, fontWeight: '500', color: c['muted-foreground'] },
    tabTextActive: { color: c.primary, fontWeight: '600' },
    emptyState: {
      margin: 16,
      borderRadius: 14,
      borderWidth: 1,
      padding: 40,
      alignItems: 'center',
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
    emptySubtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    stageHeader: {
      borderRadius: 14,
      borderWidth: 1,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stageHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    stageIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: c.primary },
    stageName: { fontSize: 15, fontWeight: '700' },
    stageType: { fontSize: 11, marginTop: 1, textTransform: 'capitalize' },
    stageHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    stageScore: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    stageScoreText: { fontSize: 12, fontWeight: '700' },
    stageStatus: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    stageStatusText: { fontSize: 11, fontWeight: '600' },
    evalRow: {
      borderRadius: 14,
      borderWidth: 1,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    evalItem: { alignItems: 'center' },
    evalLabel: { fontSize: 10, fontWeight: '700', color: c['muted-foreground'], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    evalValue: { fontSize: 14, fontWeight: '700' },
  });
}

export default function CandidateAssessmentsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const route = useRoute();
  const { applicationId } = route.params || {};
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';

  const QUESTION_TYPE_CONFIG = {
    video: { icon: 'videocam', color: '#ef4444', label: t("recruiter.video_response") },
    text: { icon: 'document-text', color: '#0ea5e9', label: t("recruiter.written_answer") },
    code: { icon: 'code-slash', color: '#6366f1', label: t("recruiter.code_challenge") },
    multiple_choice: { icon: 'checkbox', color: '#f59e0b', label: t("recruiter.multiple_choice") },
  };

  const [profile, setProfile] = useState(null);
  const [stagesWithQuestions, setStagesWithQuestions] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const qStyles = createQStyles(c);
  const assStyles = createAssStyles(c);

  function ExpandableQuestion({ question, index }) {
    const [expanded, setExpanded] = useState(false);
    const [showFullTranscript, setShowFullTranscript] = useState(false);
    const answer = question.application_answers;
    const answerData = Array.isArray(answer) ? answer[0] : answer;
    const context = question.generation_context || {};
    const options = context.options || [];
    const language = context.language || null;
    const qConfig = QUESTION_TYPE_CONFIG[question.question_type] || { icon: 'document-text', color: c['muted-foreground'], label: question.question_type };

    return (
      <View style={qStyles.card}>
        <TouchableOpacity style={[qStyles.header, isRtl && qStyles.rowReverse]} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <View style={[qStyles.typeIcon, { backgroundColor: qConfig.color + '15' }]}>
            <Ionicons name={qConfig.icon} size={16} color={qConfig.color} />
          </View>
          <View style={qStyles.headerInfo}>
            <View style={qStyles.headerTags}>
              <Text style={[qStyles.typeLabel, { color: qConfig.color }]}>{qConfig.label}</Text>
              {language && <Text style={qStyles.langTag}>{language}</Text>}
              {context.max_time && (
                <Text style={qStyles.timeTag}>
                  <Ionicons name="time-outline" size={10} /> {context.max_time < 60 ? `${context.max_time}s` : `${Math.round(context.max_time / 60)}m`}
                </Text>
              )}
            </View>
            <Text style={[qStyles.questionText]} numberOfLines={expanded ? undefined : 2}>
              {question.question_text}
            </Text>
          </View>
          <View style={qStyles.headerRight}>
            {answerData?.score != null && (
              <View style={[qStyles.scorePill, {
                backgroundColor: answerData.score >= 80 ? `${c.success}18` : answerData.score >= 60 ? `${c.primary}15` : `${c.destructive}18`,
              }]}>
                <Text style={[qStyles.scorePillText, {
                  color: answerData.score >= 80 ? c.success : answerData.score >= 60 ? c.primary : c.destructive,
                }]}>{Math.round(answerData.score)}</Text>
              </View>
            )}
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={c['muted-foreground']} />
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={qStyles.body}>
            <Text style={qStyles.sectionLabel}>{t("recruiter.answer")}</Text>

            {question.question_type === 'video' && (
              <View>
                {(context?.video_url || context?.recording_url) ? (
                  <Video
                    source={{ uri: context.video_url || context.recording_url }}
                    style={qStyles.videoPlayer}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                ) : (
                  <Text style={qStyles.emptyText}>{t("recruiter.no_video_recording")}</Text>
                )}
                {answerData?.answer_text && (
                  <View style={qStyles.transcriptBox}>
                    <Text style={qStyles.transcriptLabel}>{t("recruiter.transcript")}</Text>
                    <Text 
                      style={qStyles.transcriptText}
                      numberOfLines={showFullTranscript ? undefined : 3}
                    >
                      {answerData.answer_text}
                    </Text>
                    <TouchableOpacity 
                      style={qStyles.showMoreBtn}
                      onPress={() => setShowFullTranscript(!showFullTranscript)}
                      activeOpacity={0.7}
                    >
                      <Text style={qStyles.showMoreText}>
                        {showFullTranscript ? t("recruiter.show_less", "Show less") : t("recruiter.show_more", "Show more")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {question.question_type === 'text' && (
              <View style={qStyles.answerBox}>
                <Text style={qStyles.answerText}>{answerData?.answer_text || t("recruiter.no_answer")}</Text>
              </View>
            )}

            {question.question_type === 'code' && (
              <View>
                {language && <Text style={qStyles.langBadge}>{language}</Text>}
                {answerData?.answer_text ? (
                  <View style={qStyles.codeBox}>
                    <Text style={qStyles.codeText}>{answerData.answer_text}</Text>
                  </View>
                ) : (
                  <Text style={qStyles.emptyText}>{t("recruiter.no_code")}</Text>
                )}
              </View>
            )}

            {question.question_type === 'multiple_choice' && (
              <View>
                {options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = answerData?.answer_text === opt;
                  return (
                    <View key={idx} style={[qStyles.optionRow, isSelected && qStyles.optionSelected, isRtl && qStyles.rowReverse]}>
                      <View style={[qStyles.optionLetter, isSelected && { backgroundColor: c.primary }]}>
                        <Text style={[qStyles.optionLetterText, isSelected && { color: c['destructive-foreground'] }]}>{letter}</Text>
                      </View>
                      <Text style={[qStyles.optionText, isSelected && { color: c.primary, fontWeight: '600' }]}>{opt}</Text>
                      {isSelected && <Ionicons name="checkmark" size={16} color={c.primary} />}
                    </View>
                  );
                })}
                {(!answerData?.answer_text || answerData.answer_text === '') && (
                  <Text style={qStyles.emptyText}>{t("recruiter.no_answer_selected")}</Text>
                )}
              </View>
            )}

            {(answerData?.feedback || answerData?.strengths?.length > 0 || answerData?.weaknesses?.length > 0) && (
              <View style={qStyles.feedbackBox}>
                <View style={qStyles.feedbackHeader}>
                  <Ionicons name="sparkles" size={14} color={c.accent} />
                  <Text style={qStyles.feedbackTitle}>{t("recruiter.ai_feedback")}</Text>
                </View>
                {answerData.feedback && <Text style={qStyles.feedbackText}>{answerData.feedback}</Text>}
                {answerData.strengths?.map((s, i) => (
                  <View key={`s-${i}`} style={qStyles.feedbackItem}>
                    <Ionicons name="checkmark-circle" size={14} color={c.success} />
                    <Text style={qStyles.feedbackItemText}>{s}</Text>
                  </View>
                ))}
                {answerData.weaknesses?.map((w, i) => (
                  <View key={`w-${i}`} style={qStyles.feedbackItem}>
                    <Ionicons name="close-circle" size={14} color={c.destructive} />
                    <Text style={qStyles.feedbackItemText}>{w}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  useEffect(() => {
    if (!applicationId) return;
    loadAssessments();
  }, [applicationId]);

  async function loadAssessments() {
    setLoading(true);
    try {
      const { data, error: err } = await getCandidateProfile(applicationId);
      if (err) { setError(err.message); return; }
      setProfile(data);

      const allStages = (data.application_stages || []).sort(
        (a, b) => (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0),
      );
      const interviewStages = allStages.filter(s =>
        ['assessment_test', 'coding_test', 'video_interview', 'technical_interview', 'hr_interview', 'manager_interview', 'ai_screening', 'assessment'].includes(s.recruitment_stages?.stage_type),
      );

      if (interviewStages.length === 0) {
        setStagesWithQuestions([]);
        setLoading(false);
        return;
      }

      const stageQuestions = await Promise.all(
        interviewStages.map(async (stage) => {
          const { data: questions } = await getCandidateStageQuestions(stage.id);
          return { ...stage, questions: questions || [] };
        }),
      );

      setStagesWithQuestions(stageQuestions);
      setActiveStage(stageQuestions[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[assStyles.container, assStyles.centered, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[assStyles.container, assStyles.centered, { backgroundColor: c.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={c.destructive} />
        <Text style={{ color: c.destructive, marginTop: 8 }}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: c.accent, marginTop: 8 }}>{t("recruiter.back_to_profile")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmpty = stagesWithQuestions.length === 0 || stagesWithQuestions.every(s => s.questions.length === 0);
  const totalQuestions = stagesWithQuestions.reduce((a, s) => a + s.questions.length, 0);

  return (
    <View style={[assStyles.container, { backgroundColor: c.background }]}>
      {/* Header Banner */}
      <View style={[assStyles.banner, isRtl && assStyles.rowReverse, { paddingTop: insets.top + 16 }]}> 
        <TouchableOpacity style={assStyles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name={isRtl ? 'arrow-forward' : 'arrow-back'} size={20} color={c['destructive-foreground']} />
        </TouchableOpacity>
        <View style={assStyles.bannerText}>
          <Text style={assStyles.bannerTitle}>{t("recruiter.assessments")}</Text>
          <Text style={assStyles.bannerSubtitle}>{profile?.profiles?.full_name || t("recruiter.candidate")}</Text>
        </View>
        {!isEmpty && (
          <View style={assStyles.questionCount}>
            <Text style={assStyles.questionCountText}>{t("recruiter.questions_count", { count: totalQuestions })}</Text>
          </View>
        )}
      </View>

      {/* Stage Tabs */}
      {stagesWithQuestions.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={assStyles.tabBar}>
          {stagesWithQuestions.map(stage => {
            const Icon = STAGE_ICONS[stage.recruitment_stages?.stage_type] || 'sparkles';
            const isActive = activeStage?.id === stage.id;
            return (
              <TouchableOpacity
                key={stage.id}
                style={[assStyles.tab, isActive && assStyles.tabActive]}
                onPress={() => setActiveStage(stage)}
              >
                <Ionicons name={Icon} size={14} color={isActive ? c.primary : c['muted-foreground']} />
                <Text style={[assStyles.tabText, isActive && assStyles.tabTextActive]}>
                  {stage.recruitment_stages?.name || t("recruiter.unknown")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Content */}
      {isEmpty ? (
        <View style={[assStyles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="brain-outline" size={48} color={c.border} />
          <Text style={[assStyles.emptyTitle, { color: c.foreground }]}>{t("recruiter.no_assessments")}</Text>
          <Text style={[assStyles.emptySubtitle, { color: c['muted-foreground'] }]}>
            {t("recruiter.no_assessments_desc")}
          </Text>
        </View>
      ) : activeStage && (
        <ScrollView style={assStyles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Stage Header */}
          <View style={[assStyles.stageHeader, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={assStyles.stageHeaderLeft}>
              <View style={assStyles.stageIconWrap}>
                <Ionicons
                  name={STAGE_ICONS[activeStage.recruitment_stages?.stage_type] || 'sparkles'}
                  size={18}
                  color={c['destructive-foreground']}
                />
              </View>
              <View>
                <Text style={[assStyles.stageName, { color: c.foreground }]}>
                  {activeStage.recruitment_stages?.name}
                </Text>
                <Text style={[assStyles.stageType, { color: c['muted-foreground'] }]}>
                  {(activeStage.recruitment_stages?.stage_type || '').replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <View style={assStyles.stageHeaderRight}>
              {activeStage.score != null && (
                <View style={[assStyles.stageScore, {
                  backgroundColor: activeStage.score >= 80 ? `${c.success}18` : activeStage.score >= 60 ? `${c.primary}12` : `${c.warning}18`,
                }]}>
                  <Text style={[assStyles.stageScoreText, {
                    color: activeStage.score >= 80 ? c.success : activeStage.score >= 60 ? c.primary : c.warning,
                  }]}>{Math.round(activeStage.score)}/100</Text>
                </View>
              )}
              <View style={[assStyles.stageStatus, {
                backgroundColor: activeStage.status === 'passed' ? `${c.success}18` : activeStage.status === 'failed' ? `${c.destructive}18` : c.border,
              }]}>
                <Text style={[assStyles.stageStatusText, {
                  color: activeStage.status === 'passed' ? c.success : activeStage.status === 'failed' ? c.destructive : c['muted-foreground'],
                }]}>
                  {activeStage.status?.charAt(0).toUpperCase() + activeStage.status?.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Evaluation Summary */}
          {(() => {
            const evals = activeStage.application_stage_evaluations;
            const evalData = Array.isArray(evals) ? evals[0] : evals;
            if (!evalData) return null;
            return (
              <View style={[assStyles.evalRow, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={assStyles.evalItem}>
                  <Text style={assStyles.evalLabel}>{t("recruiter.recommendation")}</Text>
                  <Text style={[assStyles.evalValue, {
                    color: evalData.recommendation === 'proceed' ? c.success
                      : evalData.recommendation === 'review' ? c.warning
                      : c.destructive,
                  }]}>
                    {evalData.recommendation?.charAt(0).toUpperCase() + evalData.recommendation?.slice(1) || t("recruiter.na")}
                  </Text>
                </View>
                <View style={assStyles.evalItem}>
                  <Text style={assStyles.evalLabel}>{t("recruiter.confidence")}</Text>
                  <Text style={[assStyles.evalValue, { color: c.foreground }]}>
                    {evalData.confidence != null ? `${Math.round(Number(evalData.confidence) * 100)}%` : t("recruiter.na")}
                  </Text>
                </View>
                <View style={assStyles.evalItem}>
                  <Text style={assStyles.evalLabel}>{t("recruiter.questions")}</Text>
                  <Text style={[assStyles.evalValue, { color: c.foreground }]}>{activeStage.questions?.length || 0}</Text>
                </View>
              </View>
            );
          })()}

          {/* Questions */}
          {activeStage.questions.map((q, i) => (
            <ExpandableQuestion key={q.id} question={q} index={i} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
