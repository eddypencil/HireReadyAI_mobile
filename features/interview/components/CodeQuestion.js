import { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { executeCode } from "../services/wandbox.service";

const PLACEHOLDER = {
  javascript: "// Write your JavaScript solution here\n\n",
  python: "# Write your Python solution here\n\n",
  java: "// Write your Java solution here\n\n",
  typescript: "// Write your TypeScript solution here\n\n",
  cpp: "// Write your C++ solution here\n\n",
  sql: "-- Write your SQL query here\n\n",
  default: "// Write your solution here\n\n",
};

const LANG_INFO = {
  javascript: { color: "#f7df1e", label: "JavaScript" },
  python: { color: "#3776ab", label: "Python" },
  java: { color: "#ed8b00", label: "Java" },
  typescript: { color: "#3178c6", label: "TypeScript" },
  cpp: { color: "#00599c", label: "C++" },
  sql: { color: "#e38c00", label: "SQL" },
  default: { color: "#2a6f97", label: "Code" },
};

function createStyles(c) {
  return StyleSheet.create({
    scrollContainer: { maxHeight: 500 },
    container: { gap: 12 },
    editorWrapper: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      overflow: "hidden",
    },
    editorHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: c['surface-muted'],
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    langBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    langBadgeText: { fontSize: 11, fontWeight: "700" },
    tabHint: { fontSize: 11, color: c['muted-foreground'] },
    editorBody: { flexDirection: "row", minHeight: 220 },
    lineNumbers: {
      width: 44,
      paddingTop: 14,
      backgroundColor: c['surface-muted'],
      borderRightWidth: 1,
      borderRightColor: c.border,
      alignItems: "flex-end",
      paddingRight: 10,
    },
    lineNumberText: { fontSize: 13, lineHeight: 22, color: c['muted-foreground'], opacity: 0.6 },
    textInput: {
      flex: 1,
      paddingTop: 14,
      paddingLeft: 14,
      paddingRight: 14,
      fontSize: 14,
      lineHeight: 22,
      color: c.foreground,
      fontFamily: "monospace",
      minHeight: 220,
    },
    editorFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: c['surface-muted'],
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    editorFooterText: { fontSize: 11, color: c['muted-foreground'], fontFamily: "monospace" },
    submitBtnVisuals: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 14,
    },
    submitBtnVisualsText: { fontSize: 14, fontWeight: "600", color: c['destructive-foreground'] },
    actionsContainer: { gap: 10 },
    runBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      paddingVertical: 12,
    },
    runBtnText: { fontSize: 14, fontWeight: "600", color: c.foreground },
    consoleWrapper: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c['surface-muted'], // Was #0d1117
      padding: 14,
      gap: 10,
    },
    consoleHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
    consoleHeaderText: { fontSize: 11, fontWeight: "600" },
    consoleOutputText: { fontSize: 13, color: c.foreground, fontFamily: "monospace", lineHeight: 20 },
    consoleErrorText: { fontSize: 13, color: c.destructive, fontFamily: "monospace", lineHeight: 20 },
    metricsWrapper: { flexDirection: "row", gap: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.border },
    metricBox: { flex: 1, borderRadius: 8, backgroundColor: `${c.foreground}0a`, padding: 8 },
    metricLabel: { fontSize: 10, color: c['muted-foreground'] },
    metricValue: { fontSize: 13, fontWeight: "600", color: c.foreground, fontFamily: "monospace", marginTop: 2 },
    submitBtnStandard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 14,
    },
    submitBtnStandardText: { fontSize: 14, fontWeight: "600", color: c['destructive-foreground'] },
    expectedOutputToggle: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
    expectedOutputToggleText: { fontSize: 12, color: c['muted-foreground'], fontWeight: "500" },
    expectedOutputWrapper: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c['surface-muted'],
      padding: 12,
    },
    expectedOutputText: { fontSize: 13, color: c.foreground, fontFamily: "monospace" },
  });
}

export default function CodeQuestion({ question, onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const s = createStyles(c);
  const lang = question?.language?.toLowerCase() ?? "default";
  const langInfo = LANG_INFO[lang] ?? LANG_INFO.default;
  const placeholder = PLACEHOLDER[lang] ?? PLACEHOLDER.default;

  const [code, setCode] = useState(placeholder);
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const inputRef = useRef(null);

  const isVisuals = question?.codeType === "visuals";
  const lines = code.split("\n");
  const isEmpty = code.trim() === "" || code.trim() === placeholder.trim();

  const handleRun = async () => {
    if (isEmpty) return;
    setIsRunning(true);
    setConsoleOutput(null);
    const result = await executeCode(code, lang);
    setConsoleOutput(result);
    setIsRunning(false);
  };

  const handleSubmit = () => {
    if (isEmpty) return;
    const payload = [
      `CODE (${langInfo.label}):`,
      "```" + (lang === "default" ? "" : lang),
      code.trim(),
      "```",
    ];
    if (consoleOutput && !isVisuals) {
      payload.push(
        "EXECUTION OUTPUT:",
        `- Exit Code: ${consoleOutput.exitCode ?? "N/A"}`,
        `- Signal: ${consoleOutput.signal ?? "none"}`,
        `- CPU Time: ${consoleOutput.executionTime ?? "N/A"}ms`,
        `- Memory: ${consoleOutput.memoryUsage != null ? (consoleOutput.memoryUsage / 1024).toFixed(2) + " KB" : "N/A"}`,
        `- stdout: ${consoleOutput.stdout || "(empty)"}`,
        `- stderr: ${consoleOutput.stderr || "(none)"}`,
      );
    }
    onAnswer(payload.join("\n"));
  };

  const handleKeyDown = ({ nativeEvent, nativeEvent: { key } }) => {
    if (key === "Tab") {
      const selectionStart = nativeEvent.selectionStart ?? 0;
      const selectionEnd = nativeEvent.selectionEnd ?? 0;
      const newCode = code.slice(0, selectionStart) + "  " + code.slice(selectionEnd);
      setCode(newCode);
    }
  };

  return (
    <ScrollView style={s.scrollContainer} nestedScrollEnabled>
      <View style={s.container}>
        <View style={s.editorWrapper}>
          <View style={s.editorHeader}>
            <View style={[s.langBadge, { backgroundColor: `${langInfo.color}1a` }]}>
              <Text style={[s.langBadgeText, { color: langInfo.color }]}>{langInfo.label}</Text>
            </View>
            <Text style={s.tabHint}>Tab = 2 spaces</Text>
          </View>

          <View style={s.editorBody}>
            <View style={s.lineNumbers}>
              {lines.map((_, i) => (
                <Text key={i} style={s.lineNumberText}>
                  {i + 1}
                </Text>
              ))}
            </View>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={setCode}
              onKeyPress={handleKeyDown}
              multiline
              textAlignVertical="top"
              contextMenuHidden={true} 
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={s.textInput}
            />
          </View>

          <View style={s.editorFooter}>
            <Text style={s.editorFooterText}>
              Ln {lines.length} · {code.length} chars
            </Text>
          </View>
        </View>

        {isVisuals ? (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isEmpty}
            activeOpacity={0.8}
            style={[s.submitBtnVisuals, { opacity: isEmpty ? 0.4 : 1 }]}
          >
            <Ionicons name="checkmark-circle" size={18} color={c['destructive-foreground']} />
            <Text style={s.submitBtnVisualsText}>Submit Answer →</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.actionsContainer}>
            <TouchableOpacity
              onPress={handleRun}
              disabled={isEmpty || isRunning}
              activeOpacity={0.8}
              style={[s.runBtn, { opacity: (isEmpty || isRunning) ? 0.6 : 1 }]}
            >
              {isRunning ? (
                <ActivityIndicator size="small" color={c.primary} />
              ) : (
                <Ionicons name="play" size={16} color={c.primary} />
              )}
              <Text style={s.runBtnText}>
                {isRunning ? "Running…" : "Run Code"}
              </Text>
            </TouchableOpacity>

            {consoleOutput && !isRunning && (
              <View style={s.consoleWrapper}>
                {consoleOutput.stdout ? (
                  <View>
                    <View style={s.consoleHeader}>
                      <Ionicons name="checkmark-circle" size={14} color={c.success} />
                      <Text style={[s.consoleHeaderText, { color: c.success }]}>stdout</Text>
                    </View>
                    <Text style={s.consoleOutputText}>
                      {consoleOutput.stdout}
                    </Text>
                  </View>
                ) : null}
                {consoleOutput.stderr ? (
                  <View>
                    <View style={s.consoleHeader}>
                      <Ionicons name="close-circle" size={14} color={c.destructive} />
                      <Text style={[s.consoleHeaderText, { color: c.destructive }]}>stderr</Text>
                    </View>
                    <Text style={s.consoleErrorText}>
                      {consoleOutput.stderr}
                    </Text>
                  </View>
                ) : null}
                <View style={s.metricsWrapper}>
                  <View style={s.metricBox}>
                    <Text style={s.metricLabel}>Time</Text>
                    <Text style={s.metricValue}>
                      {consoleOutput.executionTime != null ? `${consoleOutput.executionTime}ms` : "-"}
                    </Text>
                  </View>
                  <View style={s.metricBox}>
                    <Text style={s.metricLabel}>Memory</Text>
                    <Text style={s.metricValue}>
                      {consoleOutput.memoryUsage != null ? `${(consoleOutput.memoryUsage / 1024).toFixed(2)} KB` : "-"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isEmpty}
              activeOpacity={0.8}
              style={[s.submitBtnStandard, { opacity: isEmpty ? 0.4 : 1 }]}
            >
              <Ionicons name="checkmark-circle" size={18} color={c['destructive-foreground']} />
              <Text style={s.submitBtnStandardText}>Submit Answer →</Text>
            </TouchableOpacity>
          </View>
        )}

        {question?.expectedOutput && (
          <TouchableOpacity
            onPress={() => setShowExpected(!showExpected)}
            style={s.expectedOutputToggle}
          >
            <Ionicons name={showExpected ? "chevron-down" : "chevron-forward"} size={16} color={c['muted-foreground']} />
            <Text style={s.expectedOutputToggleText}>Expected Output</Text>
          </TouchableOpacity>
        )}
        {showExpected && question?.expectedOutput && (
          <View style={s.expectedOutputWrapper}>
            <Text style={s.expectedOutputText}>
              {question.expectedOutput}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
