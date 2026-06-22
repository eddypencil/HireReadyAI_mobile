import { useState, useEffect } from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useUser } from "../../auth/context/user.context";
import { getQuestionWithAnswer, getStageWithEvaluation } from "../services/admin.service";

const severityScores = { low: 1, medium: 3, high: 5, critical: 10 };

const sevOptions = [
  { value: "", label: "Keep original" },
  { value: "low", label: "Low (+1pt)" },
  { value: "medium", label: "Medium (+3pts)" },
  { value: "high", label: "High (+5pts)" },
  { value: "critical", label: "Critical (+10pts)" },
];

const actionOptions = [
  { value: "", label: "None" },
  { value: "warning", label: "Warning" },
  { value: "freeze", label: "Freeze" },
  { value: "ban", label: "Ban" },
];

const scoreOptions = [
  { value: "", label: "No score (platform issue)" },
  { value: "user", label: "Score to User" },
  { value: "company", label: "Score to Company" },
];

const questionTypeConfig = {
  text: { label: "Written", color: "#0ea5e9" },
  code: { label: "Code", color: "#6366f1" },
  multiple_choice: { label: "Multiple Choice", color: "#f59e0b" },
  video: { label: "Video", color: "#ef4444" },
};

export default function ReportResolveDialog({ visible, onClose, onSubmit, report, onNavigate }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const c = theme.colors;

  const [step, setStep] = useState("detail");
  const [severityOverride, setSeverityOverride] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [scoredEntityType, setScoredEntityType] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [entityData, setEntityData] = useState(null);
  const [entityLoading, setEntityLoading] = useState(false);

  useEffect(() => {
    if (!report || !visible) { setEntityData(null); return; }
    const rt = report.report_type;
    if (rt === "question") {
      setEntityLoading(true);
      getQuestionWithAnswer(report.target_id)
        .then(setEntityData)
        .catch(() => setEntityData(null))
        .finally(() => setEntityLoading(false));
    } else if (rt === "interview") {
      setEntityLoading(true);
      getStageWithEvaluation(report.target_id)
        .then(setEntityData)
        .catch(() => setEntityData(null))
        .finally(() => setEntityLoading(false));
    } else {
      setEntityData(null);
    }
  }, [report?.id, report?.report_type, report?.target_id, visible]);

  const isPending = report?.status === "pending" || report?.status === "investigating";

  async function handleDismiss() {
    setSubmitting(true);
    try {
      await onSubmit({
        reportId: report?.id,
        status: "dismissed",
        reviewedBy: profile?.id,
        resolutionNotes: "Dismissed without action",
      });
      onClose();
    } catch (err) {
      console.warn("Dismiss failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolve() {
    setSubmitting(true);
    try {
      await onSubmit({
        reportId: report?.id,
        status: "resolved",
        reviewedBy: profile?.id,
        resolutionNotes,
        actionTaken: actionTaken || null,
        scoredEntityType: scoredEntityType || null,
        scoredEntityId: scoredEntityType ? report?.target_id : null,
        severityOverride: severityOverride || null,
      });
      onClose();
    } catch (err) {
      console.warn("Resolve failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const sevColor = {
    low: c["muted-foreground"],
    medium: c.warning,
    high: c.warning,
    critical: c.destructive,
  }[report?.severity] || c["muted-foreground"];

  function renderEntityInfo() {
    const rt = report?.report_type;
    const td = report?.target_details || {};

    if (rt === "user") {
      return (
        <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
            <View style={{ backgroundColor: `${c.primary}15`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: "700", color: c.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>User</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>{td.full_name || "User"}</Text>
          <TouchableOpacity
            onPress={() => onNavigate?.("user", report.target_id)}
            style={{ height: 32, borderRadius: 8, backgroundColor: `${c.primary}15`, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: c.primary }}>View User Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (rt === "company") {
      return (
        <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
            <View style={{ backgroundColor: `${c.primary}15`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: "700", color: c.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>Company</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 6 }}>{td.name || "Company"}</Text>
          <TouchableOpacity
            onPress={() => onNavigate?.("company", report.target_id)}
            style={{ height: 32, borderRadius: 8, backgroundColor: `${c.primary}15`, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: c.primary }}>View Company Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (rt === "question") {
      if (entityLoading) {
        return (
          <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 16, marginBottom: 16, alignItems: "center" }}>
            <ActivityIndicator size="small" color={c.primary} />
          </View>
        );
      }
      if (!entityData) {
        return (
          <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <Text style={{ fontSize: 10, color: c["muted-foreground"] }}>Question data unavailable</Text>
          </View>
        );
      }
      const q = entityData;
      const ans = Array.isArray(q.application_answers) ? q.application_answers[0] : q.application_answers;
      const qConfig = questionTypeConfig[q.question_type] || { label: q.question_type, color: c["muted-foreground"] };
      const options = q.generation_context?.options || [];

      return (
        <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
            <View style={{ backgroundColor: `${qConfig.color}18`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: "700", color: qConfig.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{qConfig.label}</Text>
            </View>
            {ans?.score != null && (
              <View style={{ borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: ans.score >= 80 ? `${c.success}18` : ans.score >= 60 ? `${c.primary}15` : `${c.destructive}18` }}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: ans.score >= 80 ? c.success : ans.score >= 60 ? c.primary : c.destructive }}>{Math.round(ans.score)}/100</Text>
              </View>
            )}
          </View>

          <Text style={{ fontSize: 12, fontWeight: "500", color: c.foreground, lineHeight: 17, marginBottom: 8 }}>{q.question_text}</Text>

          {q.question_type === "text" && ans?.answer_text && (
            <View style={{ backgroundColor: c.card, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: c.border, marginBottom: 8 }}>
              <Text style={{ fontSize: 11, color: c["muted-foreground"], marginBottom: 2, fontWeight: "600" }}>Answer</Text>
              <Text style={{ fontSize: 12, color: c.foreground, lineHeight: 17 }}>{ans.answer_text}</Text>
            </View>
          )}

          {q.question_type === "code" && ans?.answer_text && (
            <View style={{ backgroundColor: "#0f172a", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 10, color: "#94a3b8", fontWeight: "600", marginBottom: 4 }}>Code</Text>
              <Text style={{ fontFamily: "monospace", fontSize: 11, color: "#e2e8f0", lineHeight: 16 }}>{ans.answer_text}</Text>
            </View>
          )}

          {q.question_type === "multiple_choice" && (
            <View style={{ marginBottom: 8 }}>
              {options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const selected = ans?.answer_text === opt;
                return (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, marginBottom: 3, borderWidth: 1, borderColor: selected ? c.primary : c.border, backgroundColor: selected ? `${c.primary}08` : "transparent" }}>
                    <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: selected ? c.primary : c.border, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ fontSize: 9, fontWeight: "700", color: selected ? "#fff" : c["muted-foreground"] }}>{letter}</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 11, color: c.foreground }}>{opt}</Text>
                    {selected && <Text style={{ fontSize: 10, color: c.primary, fontWeight: "600" }}>Selected</Text>}
                  </View>
                );
              })}
              {(!ans?.answer_text || ans.answer_text === "") && (
                <Text style={{ fontSize: 10, color: c["muted-foreground"], fontStyle: "italic" }}>No answer selected</Text>
              )}
            </View>
          )}

          {q.question_type === "video" && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 10, color: c["muted-foreground"], fontStyle: "italic" }}>Video recording available</Text>
              {ans?.transcript && (
                <View style={{ backgroundColor: c.card, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: c.border, marginTop: 4 }}>
                  <Text style={{ fontSize: 10, color: c["muted-foreground"], fontWeight: "600", marginBottom: 2 }}>Transcript</Text>
                  <Text style={{ fontSize: 11, color: c.foreground, lineHeight: 16 }}>{ans.transcript}</Text>
                </View>
              )}
            </View>
          )}

          {(ans?.feedback || ans?.strengths?.length > 0 || ans?.weaknesses?.length > 0) && (
            <View style={{ backgroundColor: `${c.accent || c.primary}08`, borderRadius: 8, borderWidth: 1, borderColor: `${c.accent || c.primary}25`, padding: 10 }}>
              <Text style={{ fontSize: 9, fontWeight: "700", color: c.accent || c.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>AI Feedback</Text>
              {ans.feedback && <Text style={{ fontSize: 11, color: c.foreground, lineHeight: 16, marginBottom: 6 }}>{ans.feedback}</Text>}
              {ans.strengths?.map((s, i) => (
                <View key={`s-${i}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 2 }}>
                  <Text style={{ fontSize: 10, color: c.success }}>+</Text>
                  <Text style={{ fontSize: 10, color: c["muted-foreground"], flex: 1 }}>{s}</Text>
                </View>
              ))}
              {ans.weaknesses?.map((w, i) => (
                <View key={`w-${i}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 2 }}>
                  <Text style={{ fontSize: 10, color: c.destructive }}>-</Text>
                  <Text style={{ fontSize: 10, color: c["muted-foreground"], flex: 1 }}>{w}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    if (rt === "interview") {
      if (entityLoading) {
        return (
          <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 16, marginBottom: 16, alignItems: "center" }}>
            <ActivityIndicator size="small" color={c.primary} />
          </View>
        );
      }
      if (!entityData) {
        return (
          <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <Text style={{ fontSize: 10, color: c["muted-foreground"] }}>Interview data unavailable</Text>
          </View>
        );
      }
      const s = entityData;
      const evalData = Array.isArray(s.application_stage_evaluations) ? s.application_stage_evaluations[0] : s.application_stage_evaluations;
      const rs = s.recruitment_stages;

      return (
        <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
            <View style={{ backgroundColor: `${c.primary}15`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: "700", color: c.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>Interview</Text>
            </View>
            {s.score != null && (
              <View style={{ borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: s.score >= 80 ? `${c.success}18` : s.score >= 60 ? `${c.primary}12` : `${c.warning}18` }}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: s.score >= 80 ? c.success : s.score >= 60 ? c.primary : c.warning }}>{Math.round(s.score)}/100</Text>
              </View>
            )}
            <View style={{ borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: s.status === "passed" ? `${c.success}18` : s.status === "failed" ? `${c.destructive}18` : c.border }}>
              <Text style={{ fontSize: 9, fontWeight: "600", color: s.status === "passed" ? c.success : s.status === "failed" ? c.destructive : c["muted-foreground"] }}>
                {s.status?.charAt(0).toUpperCase() + s.status?.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, fontWeight: "600", color: c.foreground, marginBottom: 2 }}>{rs?.name || "Stage"}</Text>
          <Text style={{ fontSize: 10, color: c["muted-foreground"], textTransform: "capitalize", marginBottom: 8 }}>{rs?.stage_type?.replace(/_/g, " ") || ""}</Text>

          {evalData && (
            <View style={{ backgroundColor: `${c.accent || c.primary}08`, borderRadius: 8, borderWidth: 1, borderColor: `${c.accent || c.primary}25`, padding: 10 }}>
              <Text style={{ fontSize: 9, fontWeight: "700", color: c.accent || c.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Evaluation</Text>
              {evalData.recommendation && (
                <Text style={{ fontSize: 10, color: c["muted-foreground"], marginBottom: 4 }}>
                  Recommendation: <Text style={{ fontWeight: "600", color: evalData.recommendation === "proceed" ? c.success : evalData.recommendation === "review" ? c.warning : c.destructive }}>
                    {evalData.recommendation?.charAt(0).toUpperCase() + evalData.recommendation?.slice(1)}
                  </Text>
                </Text>
              )}
              {evalData.reasoning && (
                <Text style={{ fontSize: 11, color: c.foreground, lineHeight: 16, marginBottom: 6 }}>{evalData.reasoning}</Text>
              )}
              {evalData.strengths?.map((s, i) => (
                <View key={`s-${i}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 2 }}>
                  <Text style={{ fontSize: 10, color: c.success }}>+</Text>
                  <Text style={{ fontSize: 10, color: c["muted-foreground"], flex: 1 }}>{s}</Text>
                </View>
              ))}
              {evalData.weaknesses?.map((w, i) => (
                <View key={`w-${i}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 2 }}>
                  <Text style={{ fontSize: 10, color: c.destructive }}>-</Text>
                  <Text style={{ fontSize: 10, color: c["muted-foreground"], flex: 1 }}>{w}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: c.background, borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <Text style={{ fontSize: 10, color: c["muted-foreground"], marginBottom: 2 }}>Target ID</Text>
        <Text style={{ fontSize: 9, fontWeight: "600", color: c.foreground, fontFamily: "monospace" }}>{report?.target_id || "--"}</Text>
        {td.full_name && <Text style={{ fontSize: 10, color: c.foreground, marginTop: 2 }}>{td.full_name}</Text>}
        {td.name && <Text style={{ fontSize: 10, color: c.foreground, marginTop: 2 }}>{td.name}</Text>}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ backgroundColor: c.card, borderRadius: 16, maxHeight: "90%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: c.foreground }}>
              {step === "form" ? "Resolution" : "Report Details"}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: c["muted-foreground"], lineHeight: 13 }}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            {step === "detail" ? (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  <View style={{ backgroundColor: `${c.primary}12`, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 9, fontWeight: "600", color: c.primary, textTransform: "uppercase" }}>{report?.report_type}</Text>
                  </View>
                  <View style={{ backgroundColor: `${sevColor}18`, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: sevColor }} />
                    <Text style={{ fontSize: 9, fontWeight: "600", color: sevColor, textTransform: "capitalize" }}>{report?.severity}</Text>
                  </View>
                  <View style={{ backgroundColor: `${c["muted-foreground"]}18`, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 9, fontWeight: "600", color: c["muted-foreground"], textTransform: "capitalize" }}>{report?.status}</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 13, fontWeight: "700", color: c.foreground, marginBottom: 4 }}>{report?.subject}</Text>
                {report?.description && (
                  <Text style={{ fontSize: 11, color: c["muted-foreground"], marginBottom: 12, lineHeight: 16 }}>{report.description}</Text>
                )}

                {renderEntityInfo()}

                {report?.resolution_notes && (
                  <View style={{ backgroundColor: c.muted, borderRadius: 10, padding: 12, marginBottom: 16 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c["muted-foreground"], marginBottom: 4 }}>Resolution Notes</Text>
                    <Text style={{ fontSize: 11, color: c.foreground }}>{report.resolution_notes}</Text>
                    {report.action_taken && (
                      <Text style={{ fontSize: 10, color: c["muted-foreground"], marginTop: 4 }}>Action: {report.action_taken}</Text>
                    )}
                  </View>
                )}

                {isPending && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={handleDismiss}
                      disabled={submitting}
                      style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.muted, justifyContent: "center", alignItems: "center", opacity: submitting ? 0.6 : 1 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: c["muted-foreground"] }}>Dismiss</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setStep("form")}
                      style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.primary, justifyContent: "center", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Severity Override</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                    {sevOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setSeverityOverride(opt.value)}
                        style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: severityOverride === opt.value ? c.primary : c.muted, borderWidth: 1, borderColor: severityOverride === opt.value ? c.primary : c.border }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: "600", color: severityOverride === opt.value ? "#fff" : c["muted-foreground"] }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Action Taken</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                    {actionOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setActionTaken(opt.value)}
                        style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: actionTaken === opt.value ? c.primary : c.muted, borderWidth: 1, borderColor: actionTaken === opt.value ? c.primary : c.border }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: "600", color: actionTaken === opt.value ? "#fff" : c["muted-foreground"] }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Score Assignment</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                    {scoreOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setScoredEntityType(opt.value)}
                        style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: scoredEntityType === opt.value ? c.primary : c.muted, borderWidth: 1, borderColor: scoredEntityType === opt.value ? c.primary : c.border }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: "600", color: scoredEntityType === opt.value ? "#fff" : c["muted-foreground"] }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: c.foreground, marginBottom: 4 }}>Resolution Notes</Text>
                  <TextInput
                    value={resolutionNotes}
                    onChangeText={setResolutionNotes}
                    placeholder="Add notes..."
                    placeholderTextColor={c["muted-foreground"]}
                    multiline
                    numberOfLines={3}
                    style={{ backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, color: c.foreground, minHeight: 60, textAlignVertical: "top" }}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => setStep("detail")} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.muted, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: c["muted-foreground"] }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleResolve} disabled={submitting} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: c.success || c.primary, justifyContent: "center", alignItems: "center", opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Confirm</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
