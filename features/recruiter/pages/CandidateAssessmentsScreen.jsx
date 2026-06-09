import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCandidateProfile, getCandidateStageQuestions } from '../services/candidateProfile.service';
import { colors } from '../../../src/theme';

function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    isDark,
    background: isDark ? '#0b1120' : colors.surface,
    surface: isDark ? '#152032' : colors.white,
    border: isDark ? '#1e3048' : colors.border,
    foreground: isDark ? '#e2e8f0' : colors.foreground,
    muted: isDark ? '#8899b4' : colors.mutedForeground,
    primary: colors.primary,
    accent: colors.accent,
    success: colors.emerald[500],
    danger: colors.red[500],
    warning: colors.amber[500],
  };
}

const QUESTION_TYPE_CONFIG = {
  video: { icon: 'videocam', color: '#ef4444', label: 'Video Response' },
  text: { icon: 'document-text', color: '#0ea5e9', label: 'Written Answer' },
  code: { icon: 'code-slash', color: '#6366f1', label: 'Code Challenge' },
  multiple_choice: { icon: 'checkbox', color: '#f59e0b', label: 'Multiple Choice' },
};

const STAGE_ICONS = {
  hr_interview: 'chatbubbles',
  technical_interview: 'desktop',
  assessment_test: 'brain',
  coding_test: 'code-slash',
  video_interview: 'videocam',
  manager_interview: 'people',
  ai_screening: 'sparkles',
};

function ExpandableQuestion({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const answer = question.application_answers;
  const answerData = Array.isArray(answer) ? answer[0] : answer;
  const context = question.generation_context || {};
  const options = context.options || [];
  const language = context.language || null;
  const qConfig = QUESTION_TYPE_CONFIG[question.question_type] || { icon: 'document-text', color: colors.gray[500], label: question.question_type };

  return (
    <View style={qStyles.card}>
      <TouchableOpacity style={qStyles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
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
              backgroundColor: answerData.score >= 80 ? colors.emerald[50] : answerData.score >= 60 ? colors.primary + '15' : colors.red[50],
            }]}>
              <Text style={[qStyles.scorePillText, {
                color: answerData.score >= 80 ? colors.emerald[600] : answerData.score >= 60 ? colors.primary : colors.red[600],
              }]}>{Math.round(answerData.score)}</Text>
            </View>
          )}
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.gray[400]} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={qStyles.body}>
          {/* Answer Content */}
          <Text style={qStyles.sectionLabel}>Answer</Text>

          {question.question_type === 'video' && (
            <View>
              {answerData?.recording_url ? (
                <Text style={qStyles.videoPlaceholder}>
                  <Ionicons name="videocam" size={14} /> Recording available
                </Text>
              ) : (
                <Text style={qStyles.emptyText}>No video recording available</Text>
              )}
              {answerData?.transcript && (
                <View style={qStyles.transcriptBox}>
                  <Text style={qStyles.transcriptLabel}>Transcript</Text>
                  <Text style={qStyles.transcriptText}>{answerData.transcript}</Text>
                </View>
              )}
            </View>
          )}

          {question.question_type === 'text' && (
            <View style={qStyles.answerBox}>
              <Text style={qStyles.answerText}>{answerData?.answer_text || 'No answer provided.'}</Text>
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
                <Text style={qStyles.emptyText}>No code submitted.</Text>
              )}
            </View>
          )}

          {question.question_type === 'multiple_choice' && (
            <View>
              {options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answerData?.answer_text === opt;
                return (
                  <View key={idx} style={[qStyles.optionRow, isSelected && qStyles.optionSelected]}>
                    <View style={[qStyles.optionLetter, isSelected && { backgroundColor: colors.primary }]}>
                      <Text style={[qStyles.optionLetterText, isSelected && { color: colors.white }]}>{letter}</Text>
                    </View>
                    <Text style={[qStyles.optionText, isSelected && { color: colors.primary, fontWeight: '600' }]}>{opt}</Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </View>
                );
              })}
              {(!answerData?.answer_text || answerData.answer_text === '') && (
                <Text style={qStyles.emptyText}>No answer selected.</Text>
              )}
            </View>
          )}

          {/* AI Feedback */}
          {(answerData?.feedback || answerData?.strengths?.length > 0 || answerData?.weaknesses?.length > 0) && (
            <View style={qStyles.feedbackBox}>
              <View style={qStyles.feedbackHeader}>
                <Ionicons name="sparkles" size={14} color={colors.accent} />
                <Text style={qStyles.feedbackTitle}>AI Feedback</Text>
              </View>
              {answerData.feedback && <Text style={qStyles.feedbackText}>{answerData.feedback}</Text>}
              {answerData.strengths?.map((s, i) => (
                <View key={`s-${i}`} style={qStyles.feedbackItem}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.emerald[500]} />
                  <Text style={qStyles.feedbackItemText}>{s}</Text>
                </View>
              ))}
              {answerData.weaknesses?.map((w, i) => (
                <View key={`w-${i}`} style={qStyles.feedbackItem}>
                  <Ionicons name="close-circle" size={14} color={colors.red[500]} />
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

const qStyles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  typeIcon: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1 },
  headerTags: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2, flexWrap: 'wrap' },
  typeLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  langTag: { fontSize: 9, fontWeight: '700', color: colors.primary, backgroundColor: colors.primary + '12', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, textTransform: 'uppercase' },
  timeTag: { fontSize: 9, color: colors.gray[500] },
  questionText: { fontSize: 13, fontWeight: '500', color: colors.foreground, lineHeight: 18, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scorePill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  scorePillText: { fontSize: 12, fontWeight: '700' },
  body: { borderTopWidth: 1, borderTopColor: colors.border, padding: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  videoPlaceholder: { fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: 8 },
  transcriptBox: { backgroundColor: colors.gray[50], borderRadius: 8, padding: 10, borderWidth: 1, borderColor: colors.border },
  transcriptLabel: { fontSize: 10, fontWeight: '700', color: colors.gray[500], marginBottom: 4, textTransform: 'uppercase' },
  transcriptText: { fontSize: 13, color: colors.foreground, lineHeight: 18 },
  answerBox: { backgroundColor: colors.gray[50], borderRadius: 8, padding: 12, borderWidth: 1, borderColor: colors.border },
  answerText: { fontSize: 13, color: colors.foreground, lineHeight: 19 },
  langBadge: { fontSize: 11, fontWeight: '700', color: colors.primary, backgroundColor: colors.primary + '12', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6, textTransform: 'uppercase' },
  codeBox: { backgroundColor: '#0f172a', borderRadius: 10, padding: 14 },
  codeText: { fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0', lineHeight: 18 },
  emptyText: { fontSize: 12, color: colors.gray[400], fontStyle: 'italic' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4, borderWidth: 1, borderColor: colors.border },
  optionSelected: { backgroundColor: colors.primary + '08', borderColor: colors.primary + '30' },
  optionLetter: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray[100] },
  optionLetterText: { fontSize: 10, fontWeight: '700', color: colors.gray[600] },
  optionText: { flex: 1, fontSize: 13, color: colors.foreground },
  feedbackBox: { backgroundColor: colors.accent + '08', borderRadius: 10, borderWidth: 1, borderColor: colors.accent + '25', padding: 12, marginTop: 10 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  feedbackTitle: { fontSize: 10, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  feedbackText: { fontSize: 13, color: colors.gray[700], lineHeight: 18, marginBottom: 8 },
  feedbackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 4 },
  feedbackItemText: { fontSize: 12, color: colors.gray[600], flex: 1 },
});

export default function CandidateAssessmentsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { applicationId } = route.params || {};

  const [profile, setProfile] = useState(null);
  const [stagesWithQuestions, setStagesWithQuestions] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <View style={[assStyles.container, assStyles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[assStyles.container, assStyles.centered, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
        <Text style={{ color: theme.danger, marginTop: 8 }}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.accent, marginTop: 8 }}>Back to profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmpty = stagesWithQuestions.length === 0 || stagesWithQuestions.every(s => s.questions.length === 0);
  const totalQuestions = stagesWithQuestions.reduce((a, s) => a + s.questions.length, 0);

  return (
    <View style={[assStyles.container, { backgroundColor: theme.background }]}>
      {/* Header Banner */}
      <View style={[assStyles.banner, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={assStyles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <View style={assStyles.bannerText}>
          <Text style={assStyles.bannerTitle}>Assessments & Interviews</Text>
          <Text style={assStyles.bannerSubtitle}>{profile?.profiles?.full_name || 'Candidate'}</Text>
        </View>
        {!isEmpty && (
          <View style={assStyles.questionCount}>
            <Text style={assStyles.questionCountText}>{totalQuestions} questions</Text>
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
                <Ionicons name={Icon} size={14} color={isActive ? colors.primary : colors.gray[500]} />
                <Text style={[assStyles.tabText, isActive && assStyles.tabTextActive]}>
                  {stage.recruitment_stages?.name || 'Unknown'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Content */}
      {isEmpty ? (
        <View style={[assStyles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="brain-outline" size={48} color={theme.border} />
          <Text style={[assStyles.emptyTitle, { color: theme.foreground }]}>No Assessment Data</Text>
          <Text style={[assStyles.emptySubtitle, { color: theme.muted }]}>
            This candidate has not completed any interviews or assessments yet.
          </Text>
        </View>
      ) : activeStage && (
        <ScrollView style={assStyles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Stage Header */}
          <View style={[assStyles.stageHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={assStyles.stageHeaderLeft}>
              <View style={[assStyles.stageIconWrap, { backgroundColor: colors.primary }]}>
                <Ionicons
                  name={STAGE_ICONS[activeStage.recruitment_stages?.stage_type] || 'sparkles'}
                  size={18}
                  color={colors.white}
                />
              </View>
              <View>
                <Text style={[assStyles.stageName, { color: theme.foreground }]}>
                  {activeStage.recruitment_stages?.name}
                </Text>
                <Text style={[assStyles.stageType, { color: theme.muted }]}>
                  {(activeStage.recruitment_stages?.stage_type || '').replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <View style={assStyles.stageHeaderRight}>
              {activeStage.score != null && (
                <View style={[assStyles.stageScore, {
                  backgroundColor: activeStage.score >= 80 ? colors.emerald[50] : activeStage.score >= 60 ? colors.primary + '12' : colors.amber[50],
                }]}>
                  <Text style={[assStyles.stageScoreText, {
                    color: activeStage.score >= 80 ? colors.emerald[600] : activeStage.score >= 60 ? colors.primary : colors.amber[600],
                  }]}>{Math.round(activeStage.score)}/100</Text>
                </View>
              )}
              <View style={[assStyles.stageStatus, {
                backgroundColor: activeStage.status === 'passed' ? colors.emerald[50] : activeStage.status === 'failed' ? colors.red[50] : colors.gray[100],
              }]}>
                <Text style={[assStyles.stageStatusText, {
                  color: activeStage.status === 'passed' ? colors.emerald[600] : activeStage.status === 'failed' ? colors.red[600] : colors.gray[600],
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
              <View style={[assStyles.evalRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={assStyles.evalItem}>
                  <Text style={assStyles.evalLabel}>Recommendation</Text>
                  <Text style={[assStyles.evalValue, {
                    color: evalData.recommendation === 'proceed' ? colors.emerald[600]
                      : evalData.recommendation === 'review' ? colors.amber[600]
                      : colors.red[600],
                  }]}>
                    {evalData.recommendation?.charAt(0).toUpperCase() + evalData.recommendation?.slice(1) || 'N/A'}
                  </Text>
                </View>
                <View style={assStyles.evalItem}>
                  <Text style={assStyles.evalLabel}>Confidence</Text>
                  <Text style={[assStyles.evalValue, { color: theme.foreground }]}>
                    {evalData.confidence != null ? `${Math.round(Number(evalData.confidence) * 100)}%` : 'N/A'}
                  </Text>
                </View>
                <View style={assStyles.evalItem}>
                  <Text style={assStyles.evalLabel}>Questions</Text>
                  <Text style={[assStyles.evalValue, { color: theme.foreground }]}>{activeStage.questions?.length || 0}</Text>
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

const assStyles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: { padding: 4 },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  questionCount: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  questionCountText: { fontSize: 11, fontWeight: '600', color: colors.white },
  tabBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '500', color: colors.gray[500] },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
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
  stageIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
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
  evalLabel: { fontSize: 10, fontWeight: '700', color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  evalValue: { fontSize: 14, fontWeight: '700' },
});
