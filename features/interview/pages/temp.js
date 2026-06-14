import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, AppState, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import {
  fetchActiveInterviewStage,
  fetchStageQuestions,
  generateNextQuestion,
} from "../services/interview.service";
import TextQuestion from "../components/TextQuestion";
import MultipleChoiceQuestion from "../components/MultipleChoiceQuestion";
import CodeQuestion from "../components/CodeQuestion";
import VideoQuestion from "../components/VideoQuestion";

const PHASE = {
  INIT: "init",
  LOADING: "loading",
  ANSWERING: "answering",
  EVALUATING: "evaluating",
  FINISHED: "finished",
  ERROR: "error",
};

// ── How long the app can be backgrounded/inactive before we treat it as
// "the user left the test" and auto-forfeit the current question.
// Kept generous enough to avoid false positives from camera/mic permission
// dialogs (which can briefly flip AppState to "inactive"/"background").
const BACKGROUND_FORFEIT_MS = 8000;

const stageTypeLabel = {
  hr_interview: "HR Interview",
  technical_interview: "Technical Interview",
  assessment: "Assessment",
  interview: "Interview",
};

function createStyles(c) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c['surface-muted'] },
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.background,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
    backBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.card,
    },
    logoBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.sidebar,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: { color: c['destructive-foreground'], fontSize: 18, fontWeight: "800" },
    headerTitleText: { fontSize: 11, color: c['muted-foreground'], fontWeight: "500" },
    headerSubtitleText: { fontSize: 13, color: c.foreground, fontWeight: "600", marginTop: 2 },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 },
    statsContainer: { alignItems: "flex-end", gap: 4 },
    timerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    timerText: { fontSize: 12, fontFamily: "monospace", fontWeight: "600" },
    timerDivider: { fontSize: 12, color: c['muted-foreground'], opacity: 0.5 },
    timerMax: { fontSize: 12, color: c['muted-foreground'], fontFamily: "monospace" },
    stageBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: `${c.primary}33`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: `${c.primary}1a`,
    },
    stageBadgeText: { fontSize: 11, fontWeight: "600", color: c.primary },
    scrollContent: { flexGrow: 1, padding: 16, gap: 16 },
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 24,
    },
    questionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    questionNumberBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      backgroundColor: `${c.primary}1a`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: `${c.primary}33`,
    },
    questionNumberText: { fontSize: 12, fontWeight: "600", color: c.primary },
    questionTypeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    questionTypeText: { fontSize: 11, fontWeight: "500", color: c['muted-foreground'] },
    questionText: { fontSize: 18, fontWeight: "700", color: c.foreground, lineHeight: 28 },
    timerFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
    timerFooterLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
    timerFooterText: { fontSize: 13, fontFamily: "monospace", color: c['muted-foreground'] },
    timerFooterMax: { fontSize: 13, color: c['muted-foreground'], fontFamily: "monospace" },
    barWrapper: { flex: 1, marginHorizontal: 16, maxWidth: 140 },
    barTrack: { height: 6, backgroundColor: c.border, borderRadius: 3, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 3 },
    timeUpText: { fontSize: 10, fontWeight: "600", color: c.destructive, marginTop: 4, textAlign: "right" },
    remainingText: { fontSize: 12, color: c['muted-foreground'], fontWeight: "500" },
    stateContainer: { alignItems: "center", gap: 24, paddingVertical: 20 },
    stateIconWrapper: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    stateTextWrapper: { alignItems: "center", gap: 8 },
    stateTitle: { fontSize: 22, fontWeight: "700", color: c.foreground, textAlign: "center" },
    stateDescription: { fontSize: 14, color: c['muted-foreground'], textAlign: "center", lineHeight: 22, paddingHorizontal: 16 },
    primaryBtn: {
      width: "100%",
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    primaryBtnText: { fontSize: 15, fontWeight: "600", color: c['destructive-foreground'] },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 32,
      paddingVertical: 14,
    },
    secondaryBtnText: { fontSize: 14, fontWeight: "600", color: c.foreground },
    spinnerContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 16 },
    spinnerText: { fontSize: 14, color: c['muted-foreground'], fontWeight: "500" },
    evalDotsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 },
    evalDots: { flexDirection: "row", gap: 6 },
    evalDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary },
    evalText: { fontSize: 12, color: c['muted-foreground'], fontWeight: "500" },
  });
}

function QuestionComponent({ question, applicationStageId, onAnswer }) {
  const props = { question, onAnswer };
  switch (question?.type) {
    case "video":
      return <VideoQuestion {...props} applicationStageId={applicationStageId} />;
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;
    case "code":
      return <CodeQuestion {...props} />;
    case "text":
    default:
      return <TextQuestion {...props} />;
  }
}

function ProgressBar({ current, max, c }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <View style={{ height: 6, width: 80, backgroundColor: c.border, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: c.primary, borderRadius: 3 }} />
    </View>
  );
}

function Spinner({ label, iconName }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const s = createStyles(c);
  return (
    <View style={s.spinnerContainer}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={s.spinnerText}>{label}</Text>
    </View>
  );
}

export default function InterviewPage({ route, navigation }) {
  const { applicationId } = route.params || {};
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const s = createStyles(c);
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState(PHASE.INIT);
  const [applicationStage, setApplicationStage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(8);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [maxTime, setMaxTime] = useState(null);
  const [timeExceeded, setTimeExceeded] = useState(false);
  const generatingRef = useRef(false);

  // ── Wall-clock timestamp of when the current question started.
  // Used to compute `elapsed` from real time rather than a tick counter,
  // so the timer stays correct even if the app was backgrounded.
  const questionStartRef = useRef(Date.now());

  // ── Refs mirroring the latest state, so the AppState / navigation
  // listeners (registered once) always read fresh values without
  // needing to re-subscribe on every render.
  const phaseRef = useRef(phase);
  const currentQuestionRef = useRef(currentQuestion);
  const applicationStageRef = useRef(applicationStage);
  const elapsedRef = useRef(elapsed);
  const questionNumberRef = useRef(questionNumber);
  const backgroundTimerRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { applicationStageRef.current = applicationStage; }, [applicationStage]);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { questionNumberRef.current = questionNumber; }, [questionNumber]);

  const requestNextQuestion = async (stageId, previousAnswer, currentAnsweredCount) => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setPhase(previousAnswer ? PHASE.EVALUATING : PHASE.LOADING);
    setElapsed(0);
    setTimeExceeded(false);
    setMaxTime(null);

    try {
      const result = await generateNextQuestion(stageId, previousAnswer);

      if (result.isFinal) {
        setSessionSummary(result.stageSummary);
        setPhase(PHASE.FINISHED);
        return;
      }

      setCurrentQuestion(result.question);
      setMaxTime(result.question?.maxTime ?? null);
      setQuestionNumber(result.question?.orderIndex ?? currentAnsweredCount + 1);
      questionStartRef.current = Date.now();
      setPhase(PHASE.ANSWERING);
    } catch (err) {
      console.error("generate-question error:", err);
      setErrorMsg(err.message ?? "Failed to generate interview question.");
      setPhase(PHASE.ERROR);
    } finally {
      generatingRef.current = false;
    }
  };

  // ── Force-submit an empty answer for the current question and move on.
  // Used when the user leaves the test (backgrounds the app or navigates
  // away) — this is what fixes "resume shows the same question untouched"
  // and acts as the cheating-prevention penalty.
  const forfeitCurrentQuestion = async (reason) => {
    const q = currentQuestionRef.current;
    const stage = applicationStageRef.current;
    if (!q || !stage) return;
    if (phaseRef.current !== PHASE.ANSWERING) return;
    if (generatingRef.current) return;

    if (reason === "app_backgrounded") {
      // Alert is queued and will display once the app becomes active again.
      Alert.alert(
        "Question Submitted",
        "You left the app while answering — that question was automatically submitted as empty."
      );
    }

    await requestNextQuestion(
      stage.id,
      { questionId: q.id, answerText: "", timeTaken: elapsedRef.current },
      questionNumberRef.current,
    );
  };

  useEffect(() => {
    if (!applicationId) return;
    (async () => {
      try {
        const stage = await fetchActiveInterviewStage(applicationId);
        if (!stage) {
          setErrorMsg(t("interview_page.errors.no_active_stage"));
          setPhase(PHASE.ERROR);
          return;
        }

        setApplicationStage(stage);
        const mq = stage.recruitment_stages.evaluation_criteria?.max_questions ?? 8;
        setMaxQuestions(mq);

        const existingQuestions = await fetchStageQuestions(stage.id);

        const hasAnswer = (q) => {
          const ans = q.application_answers;
          if (!ans) return false;
          if (Array.isArray(ans)) return ans.length > 0 && ans[0]?.answer_text != null;
          return ans.answer_text != null;
        };

        const getAnswerText = (q) => {
          const ans = q.application_answers;
          if (!ans) return null;
          if (Array.isArray(ans)) return ans[0]?.answer_text ?? null;
          return ans.answer_text ?? null;
        };

        const answered = existingQuestions.filter(hasAnswer);
        const unanswered = existingQuestions.find((q) => !hasAnswer(q));

        if (existingQuestions.length === 0) {
          await requestNextQuestion(stage.id, null, 0);
        } else if (unanswered) {
          setCurrentQuestion({
            id: unanswered.id,
            text: unanswered.question_text,
            type: unanswered.question_type,
            options: unanswered.generation_context?.options ?? null,
            language: unanswered.generation_context?.language ?? null,
            maxTime: unanswered.generation_context?.max_time ?? null,
            orderIndex: unanswered.order_index,
          });
          setMaxTime(unanswered.generation_context?.max_time ?? null);
          setQuestionNumber(unanswered.order_index ?? answered.length + 1);
          setElapsed(0);
          setTimeExceeded(false);
          questionStartRef.current = Date.now();
          setPhase(PHASE.ANSWERING);
        } else {
          const lastAnswered = answered[answered.length - 1];
          const lastAnswerText = getAnswerText(lastAnswered);
          await requestNextQuestion(
            stage.id,
            { questionId: lastAnswered.id, answerText: lastAnswerText ?? "" },
            answered.length,
          );
        }
      } catch (err) {
        console.error("Interview init error:", err);
        setErrorMsg(err.message ?? t("interview_page.errors.load_failed"));
        setPhase(PHASE.ERROR);
      }
    })();
  }, [applicationId, t]);

  // ── Timer: recompute from wall-clock time every tick instead of
  // incrementing a counter. This stays correct even if JS timers were
  // throttled/paused (e.g. app briefly backgrounded for a permission prompt).
  useEffect(() => {
    if (phase !== PHASE.ANSWERING) return;

    const tick = () => {
      setElapsed(Math.floor((Date.now() - questionStartRef.current) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, currentQuestion]);

  useEffect(() => {
    if (phase !== PHASE.ANSWERING || !maxTime || elapsed < maxTime) return;
    if (!timeExceeded) {
      setTimeExceeded(true);
      handleAnswer("");
    }
  }, [elapsed, maxTime, phase, timeExceeded]);

  // ── Anti-cheat: if the app goes to background/inactive for longer than
  // BACKGROUND_FORFEIT_MS while answering a question, auto-forfeit it.
  // The grace period avoids false positives from camera/mic permission
  // dialogs used by VideoQuestion, which can briefly flip AppState.
  useEffect(() => {
    const handleAppStateChange = (nextState) => {
      if (nextState === "active") {
        if (backgroundTimerRef.current) {
          clearTimeout(backgroundTimerRef.current);
          backgroundTimerRef.current = null;
        }
        return;
      }

      if (!backgroundTimerRef.current) {
        backgroundTimerRef.current = setTimeout(() => {
          backgroundTimerRef.current = null;
          forfeitCurrentQuestion("app_backgrounded");
        }, BACKGROUND_FORFEIT_MS);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }
    };
  }, []);

  // ── In-app navigation away during an active question: confirm with the
  // user, since leaving forfeits the current answer.
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (phaseRef.current !== PHASE.ANSWERING) return; // allow leaving freely on finished/error/loading

      e.preventDefault();
      Alert.alert(
        "Leave Test?",
        "Leaving now will submit your current answer as empty and move on. Are you sure you want to leave?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave Anyway",
            style: "destructive",
            onPress: async () => {
              await forfeitCurrentQuestion("navigated_away");
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation]);

  const handleAnswer = async (answerText) => {
    if (!currentQuestion || !applicationStage) return;
    await requestNextQuestion(
      applicationStage.id,
      { questionId: currentQuestion.id, answerText, timeTaken: elapsed },
      questionNumber,
    );
  };

  const stage = applicationStage?.recruitment_stages;
  const stageLabel = stageTypeLabel[stage?.stage_type] ?? stage?.name ?? "Interview";

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <KeyboardAvoidingView 
        style={s.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>H</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={s.headerTitleText}>Interview Session</Text>
              <Text style={s.headerSubtitleText} numberOfLines={1}>{stage?.name ?? ""}</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            {phase === PHASE.ANSWERING && (
              <View style={s.statsContainer}>
                <ProgressBar current={questionNumber} max={maxQuestions} c={c} />
              </View>
            )}
            <View style={s.stageBadge}>
              <Text style={s.stageBadgeText}>{stageLabel}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          {(phase === PHASE.INIT || phase === PHASE.LOADING) && (
            <View style={s.card}>
              <Spinner label="Preparing your interview…" />
            </View>
          )}

          {phase === PHASE.EVALUATING && (
            <View style={s.card}>
              <Spinner label="Evaluating your answer…" />
              <View style={s.evalDotsRow}>
                <View style={s.evalDots}>
                  {[0, 150, 300].map((delay) => (
                    <View key={delay} style={s.evalDot} />
                  ))}
                </View>
                <Text style={s.evalText}>Generating next question</Text>
              </View>
            </View>
          )}

          {phase === PHASE.ANSWERING && currentQuestion && (
            <>
              <View style={s.card}>
                <View style={s.questionHeader}>
                  <View style={s.questionNumberBadge}>
                    <Ionicons name="help-circle" size={14} color={c.primary} />
                    <Text style={s.questionNumberText}>
                      Q{questionNumber} / {maxQuestions}
                    </Text>
                  </View>
                  <View style={s.questionTypeBadge}>
                    <Ionicons
                      name={
                        currentQuestion.type === "code" ? "code-slash" :
                        currentQuestion.type === "video" ? "videocam" :
                        currentQuestion.type === "multiple_choice" ? "list" : "document-text"
                      }
                      size={14}
                      color={c['muted-foreground']}
                    />
                    <Text style={s.questionTypeText}>
                      {currentQuestion.type.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <Text style={s.questionText}>
                  {currentQuestion.text}
                </Text>
              </View>

              <View style={[s.card, { padding: 16 }]}>
                <QuestionComponent
                  question={currentQuestion}
                  applicationStageId={applicationStage?.id}
                  onAnswer={handleAnswer}
                />
              </View>

              <View style={s.timerFooter}>
                <View style={s.timerFooterLeft}>
                  <Ionicons name="time-outline" size={16} color={c['muted-foreground']} />
                  <Text style={[
                    s.timerFooterText,
                    { color: elapsed >= maxTime ? c.destructive : elapsed >= (maxTime || 0) * 0.8 ? c.warning : c.foreground }
                  ]}>
                    {maxTime ? formatTime(Math.max(0, maxTime - elapsed)) : formatTime(elapsed)}
                  </Text>
                </View>
                {maxTime && (
                  <View style={s.barWrapper}>
                    <View style={s.barTrack}>
                      <View style={[
                        s.barFill,
                        {
                          width: `${Math.min((elapsed / maxTime) * 100, 100)}%`,
                          backgroundColor: elapsed >= maxTime ? c.destructive : elapsed >= maxTime * 0.8 ? c.warning : c.primary,
                        }
                      ]} />
                    </View>
                    {elapsed >= maxTime && (
                      <Text style={s.timeUpText}>Time's up</Text>
                    )}
                  </View>
                )}
                <Text style={s.remainingText}>
                  {maxQuestions - questionNumber > 0
                    ? `${maxQuestions - questionNumber} remaining`
                    : "Final question"}
                </Text>
              </View>
            </>
          )}

          {phase === PHASE.FINISHED && (
            <View style={[s.card, s.stateContainer]}>
              <View style={[
                s.stateIconWrapper,
                { backgroundColor: `${c.success}1a`, borderColor: `${c.success}33` }
              ]}>
                <Ionicons name="checkmark-circle" size={36} color={c.success} />
              </View>
              <View style={s.stateTextWrapper}>
                <Text style={s.stateTitle}>
                  {t("interview_page.finished.title")}
                </Text>
                <Text style={s.stateDescription}>
                  Your responses have been submitted and evaluated. The hiring team will review the results.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}
                style={s.primaryBtn}
              >
                <Text style={s.primaryBtnText}>
                  {t("interview_page.finished.back_to_application")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === PHASE.ERROR && (
            <View style={[s.card, s.stateContainer]}>
              <View style={[
                s.stateIconWrapper,
                { backgroundColor: `${c.destructive}1a`, borderColor: `${c.destructive}33` }
              ]}>
                <Ionicons name="alert-circle" size={36} color={c.destructive} />
              </View>
              <View style={s.stateTextWrapper}>
                <Text style={s.stateTitle}>
                  {t("interview_page.errors.title")}
                </Text>
                <Text style={s.stateDescription}>{errorMsg}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
                style={s.secondaryBtn}
              >
                <Text style={s.secondaryBtnText}>
                  {t("interview_page.errors.go_back")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}