import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from "react-native";
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

const stageTypeLabel = {
  hr_interview: "HR Interview",
  technical_interview: "Technical Interview",
  assessment: "Assessment",
  interview: "Interview",
};

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
    <View style={{ height: 6, backgroundColor: c.border, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: c.primary, borderRadius: 3 }} />
    </View>
  );
}

function Spinner({ label, iconName }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 16 }}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={{ fontSize: 13, color: c['muted-foreground'] }}>{label}</Text>
    </View>
  );
}

export default function InterviewPage({ route, navigation }) {
  const { applicationId } = route.params || {};
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
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
      setPhase(PHASE.ANSWERING);
    } catch (err) {
      console.error("generate-question error:", err);
      setErrorMsg(err.message ?? "Failed to generate interview question.");
      setPhase(PHASE.ERROR);
    } finally {
      generatingRef.current = false;
    }
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

  useEffect(() => {
    if (phase !== PHASE.ANSWERING) return;
    const interval = setInterval(() => { setElapsed((p) => p + 1); }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASE.ANSWERING || !maxTime || elapsed < maxTime) return;
    if (!timeExceeded) {
      setTimeExceeded(true);
      handleAnswer("");
    }
  }, [elapsed, maxTime, phase, timeExceeded]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: c['surface-muted'] }} edges={["top"]}>
      <View style={{ flex: 1 }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: c.background,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={16} color={c['muted-foreground']} />
            </TouchableOpacity>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.sidebar, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: c['destructive-foreground'], fontSize: 16, fontWeight: "800" }}>H</Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: c['muted-foreground'] }}>Interview Session</Text>
              <Text style={{ fontSize: 11, color: c.foreground, opacity: 0.8 }}>{stage?.name ?? ""}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {phase === PHASE.ANSWERING && (
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <ProgressBar current={questionNumber} max={maxQuestions} c={c} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="time-outline" size={12} color={c['muted-foreground']} />
                  <Text style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: elapsed >= maxTime ? c.destructive : elapsed >= (maxTime || 0) * 0.8 ? c.warning : c['muted-foreground'],
                  }}>
                    {formatTime(elapsed)}
                  </Text>
                  {maxTime && (
                    <>
                      <Text style={{ fontSize: 11, color: c['muted-foreground'], opacity: 0.4 }}>/</Text>
                      <Text style={{ fontSize: 11, color: c['muted-foreground'], fontFamily: "monospace" }}>{formatTime(maxTime)}</Text>
                    </>
                  )}
                </View>
              </View>
            )}
            <View style={{
              borderRadius: 999,
              borderWidth: 1,
              borderColor: `${c.primary}33`,
              paddingHorizontal: 10,
              paddingVertical: 3,
              backgroundColor: `${c.primary}1a`,
            }}>
              <Text style={{ fontSize: 10, fontWeight: "600", color: c.primary }}>{stageLabel}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 16 }}>
          {(phase === PHASE.INIT || phase === PHASE.LOADING) && (
            <View style={{
              backgroundColor: c.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.border,
              padding: 32,
            }}>
              <Spinner label="Preparing your interview…" />
            </View>
          )}

          {phase === PHASE.EVALUATING && (
            <View style={{
              backgroundColor: c.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.border,
              padding: 32,
            }}>
              <Spinner label="Evaluating your answer…" />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 8 }}>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {[0, 150, 300].map((delay) => (
                    <View key={delay} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary }} />
                  ))}
                </View>
                <Text style={{ fontSize: 10, color: c['muted-foreground'] }}>Generating next question</Text>
              </View>
            </View>
          )}

          {phase === PHASE.ANSWERING && currentQuestion && (
            <>
              <View style={{
                backgroundColor: c.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: c.border,
                padding: 20,
                gap: 12,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 999,
                    backgroundColor: `${c.primary}14`,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: `${c.primary}26`,
                  }}>
                    <Ionicons name="help-circle" size={12} color={c.primary} />
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.primary }}>
                      Q{questionNumber} / {maxQuestions}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: c.border,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}>
                    <Ionicons
                      name={
                        currentQuestion.type === "code" ? "code-slash" :
                        currentQuestion.type === "video" ? "videocam" :
                        currentQuestion.type === "multiple_choice" ? "list" : "document-text"
                      }
                      size={12}
                      color={c['muted-foreground']}
                    />
                    <Text style={{ fontSize: 10, color: c['muted-foreground'] }}>
                      {currentQuestion.type.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <Text style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: c.foreground,
                  lineHeight: 24,
                }}>
                  {currentQuestion.text}
                </Text>
              </View>

              <View style={{
                backgroundColor: c.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: c.border,
                padding: 20,
              }}>
                <QuestionComponent
                  question={currentQuestion}
                  applicationStageId={applicationStage?.id}
                  onAnswer={handleAnswer}
                />
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="time-outline" size={14} color={c['muted-foreground']} />
                  <Text style={{ fontSize: 12, fontFamily: "monospace", color: c['muted-foreground'] }}>
                    {formatTime(elapsed)}
                  </Text>
                  {maxTime && (
                    <>
                      <Text style={{ fontSize: 12, color: c['muted-foreground'], opacity: 0.4 }}>/</Text>
                      <Text style={{ fontSize: 12, fontFamily: "monospace", color: c['muted-foreground'] }}>{formatTime(maxTime)}</Text>
                    </>
                  )}
                </View>
                {maxTime && (
                  <View style={{ flex: 1, marginHorizontal: 12, maxWidth: 120 }}>
                    <View style={{ height: 6, backgroundColor: c.border, borderRadius: 3, overflow: "hidden" }}>
                      <View style={{
                        width: `${Math.min((elapsed / maxTime) * 100, 100)}%`,
                        height: "100%",
                        borderRadius: 3,
                        backgroundColor: elapsed >= maxTime ? c.destructive : elapsed >= maxTime * 0.8 ? c.warning : c.primary,
                      }} />
                    </View>
                    {elapsed >= maxTime && (
                      <Text style={{ fontSize: 9, fontWeight: "600", color: c.destructive, marginTop: 2 }}>Time's up</Text>
                    )}
                  </View>
                )}
                <Text style={{ fontSize: 11, color: c['muted-foreground'] }}>
                  {maxQuestions - questionNumber > 0
                    ? `${maxQuestions - questionNumber} remaining`
                    : "Final question"}
                </Text>
              </View>
            </>
          )}

          {phase === PHASE.FINISHED && (
            <View style={{
              backgroundColor: c.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.border,
              padding: 32,
              alignItems: "center",
              gap: 24,
            }}>
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: `${c.success}1a`,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: `${c.success}33`,
              }}>
                <Ionicons name="checkmark-circle" size={32} color={c.success} />
              </View>
              <View style={{ alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: c.foreground }}>
                  {t("interview_page.finished.title")}
                </Text>
                <Text style={{ fontSize: 13, color: c['muted-foreground'], textAlign: "center", lineHeight: 20 }}>
                  Your responses have been submitted and evaluated. The hiring team will review the results.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}
                style={{
                  width: "100%",
                  backgroundColor: c.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: c['destructive-foreground'] }}>
                  {t("interview_page.finished.back_to_application")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === PHASE.ERROR && (
            <View style={{
              backgroundColor: c.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.border,
              padding: 32,
              alignItems: "center",
              gap: 20,
            }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: `${c.destructive}1a`,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: `${c.destructive}33`,
              }}>
                <Ionicons name="alert-circle" size={28} color={c.destructive} />
              </View>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 17, fontWeight: "600", color: c.foreground }}>
                  {t("interview_page.errors.title")}
                </Text>
                <Text style={{ fontSize: 13, color: c['muted-foreground'], textAlign: "center" }}>{errorMsg}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 10,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "500", color: c.foreground }}>
                  {t("interview_page.errors.go_back")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
