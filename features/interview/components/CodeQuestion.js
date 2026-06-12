import { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
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

export default function CodeQuestion({ question, onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
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
    <ScrollView style={{ maxHeight: 500 }} nestedScrollEnabled>
      <View style={{ gap: 12 }}>
        <View style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          overflow: "hidden",
        }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: c['surface-muted'],
            borderBottomWidth: 1,
            borderBottomColor: c.border,
          }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: `${langInfo.color}1a`,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: langInfo.color }}>{langInfo.label}</Text>
            </View>
            <Text style={{ fontSize: 10, color: c['muted-foreground'] }}>Tab = 2 spaces</Text>
          </View>

          <View style={{ flexDirection: "row", minHeight: 200 }}>
            <View style={{
              width: 40,
              paddingTop: 12,
              backgroundColor: c['surface-muted'],
              borderRightWidth: 1,
              borderRightColor: c.border,
              alignItems: "flex-end",
              paddingRight: 8,
            }}>
              {lines.map((_, i) => (
                <Text key={i} style={{ fontSize: 12, lineHeight: 21, color: c['muted-foreground'], opacity: 0.5 }}>
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
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={{
                flex: 1,
                paddingTop: 12,
                paddingLeft: 12,
                paddingRight: 12,
                fontSize: 13,
                lineHeight: 21,
                color: c.foreground,
                fontFamily: "monospace",
                minHeight: 200,
              }}
            />
          </View>

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingVertical: 6,
            backgroundColor: c['surface-muted'],
            borderTopWidth: 1,
            borderTopColor: c.border,
          }}>
            <Text style={{ fontSize: 10, color: c['muted-foreground'], fontFamily: "monospace" }}>
              Ln {lines.length} · {code.length} chars
            </Text>
          </View>
        </View>

        {isVisuals ? (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isEmpty}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor: c.primary,
              borderRadius: 10,
              paddingVertical: 12,
              opacity: isEmpty ? 0.4 : 1,
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color={c['destructive-foreground']} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: c['destructive-foreground'] }}>Submit Answer →</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={handleRun}
              disabled={isEmpty || isRunning}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
                paddingVertical: 10,
              }}
            >
              {isRunning ? (
                <ActivityIndicator size="small" color={c.primary} />
              ) : (
                <Ionicons name="play" size={16} color={c.primary} />
              )}
              <Text style={{ fontSize: 13, fontWeight: "500", color: c.foreground }}>
                {isRunning ? "Running…" : "Run Code"}
              </Text>
            </TouchableOpacity>

            {consoleOutput && !isRunning && (
              <View style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: "#0d1117",
                padding: 12,
                gap: 8,
              }}>
                {consoleOutput.stdout ? (
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Ionicons name="checkmark-circle" size={12} color={c.success} />
                      <Text style={{ fontSize: 10, fontWeight: "600", color: `${c.success}cc` }}>stdout</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#e6edf3", fontFamily: "monospace", lineHeight: 18 }}>
                      {consoleOutput.stdout}
                    </Text>
                  </View>
                ) : null}
                {consoleOutput.stderr ? (
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Ionicons name="close-circle" size={12} color={c.destructive} />
                      <Text style={{ fontSize: 10, fontWeight: "600", color: `${c.destructive}cc` }}>stderr</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#f87171", fontFamily: "monospace", lineHeight: 18 }}>
                      {consoleOutput.stderr}
                    </Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", gap: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
                  <View style={{ flex: 1, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.05)", padding: 6 }}>
                    <Text style={{ fontSize: 9, color: c['muted-foreground'] }}>Time</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#e6edf3", fontFamily: "monospace" }}>
                      {consoleOutput.executionTime != null ? `${consoleOutput.executionTime}ms` : "—"}
                    </Text>
                  </View>
                  <View style={{ flex: 1, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.05)", padding: 6 }}>
                    <Text style={{ fontSize: 9, color: c['muted-foreground'] }}>Memory</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#e6edf3", fontFamily: "monospace" }}>
                      {consoleOutput.memoryUsage != null ? `${(consoleOutput.memoryUsage / 1024).toFixed(2)} KB` : "—"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isEmpty}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: c.primary,
                borderRadius: 10,
                paddingVertical: 12,
                opacity: isEmpty ? 0.4 : 1,
              }}
            >
              <Ionicons name="checkmark-circle" size={16} color={c['destructive-foreground']} />
              <Text style={{ fontSize: 13, fontWeight: "600", color: c['destructive-foreground'] }}>Submit Answer →</Text>
            </TouchableOpacity>
          </View>
        )}

        {question?.expectedOutput && (
          <TouchableOpacity
            onPress={() => setShowExpected(!showExpected)}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name={showExpected ? "chevron-down" : "chevron-forward"} size={14} color={c['muted-foreground']} />
            <Text style={{ fontSize: 11, color: c['muted-foreground'] }}>Expected Output</Text>
          </TouchableOpacity>
        )}
        {showExpected && question?.expectedOutput && (
          <View style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c['surface-muted'],
            padding: 10,
          }}>
            <Text style={{ fontSize: 12, color: c.foreground, fontFamily: "monospace" }}>
              {question.expectedOutput}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
