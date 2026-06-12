import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, Camera } from "expo-camera";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { supabase } from "../../../shared/services/supabase";
import {
  uploadAudioRecording,
  uploadVideoInBackground,
} from "../services/video_storage_service";

const MAX_SECONDS = 180;

function createStyles(c) {
  return StyleSheet.create({
    container: { gap: 20 },
    permissionContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 16 },
    permissionTitle: { fontSize: 16, fontWeight: "600", color: c.foreground },
    permissionSubtitle: { fontSize: 13, color: c["muted-foreground"], textAlign: "center", paddingHorizontal: 20 },
    permissionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.accent,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    permissionBtnText: { fontSize: 14, fontWeight: "600", color: c["destructive-foreground"] },
    deniedContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 12 },
    deniedText: { fontSize: 15, fontWeight: "500", color: c.destructive },
    cameraWrapper: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      aspectRatio: 16 / 9,
      justifyContent: "center",
      alignItems: "center",
    },
    savedRecordingText: { color: c["muted-foreground"], fontSize: 13, fontWeight: "500" },
    camera: { flex: 1, aspectRatio: 16 / 9 },
    timerBadge: {
      position: "absolute",
      top: 12,
      left: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: `${c.foreground}b3`,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    timerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.destructive },
    timerText: { color: c.background, fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
    overlay: {
      position: "absolute",
      inset: 0,
      backgroundColor: `${c.background}cc`,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    overlayText: { color: c.foreground, fontSize: 15, fontWeight: "600" },
    overlaySubtext: { color: c['muted-foreground'], fontSize: 12, textAlign: "center", paddingHorizontal: 24 },
    controlsContainer: { gap: 12 },
    startBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.destructive,
      borderRadius: 12,
      paddingVertical: 14,
    },
    startBtnIcon: { width: 12, height: 12, borderRadius: 6, backgroundColor: c['destructive-foreground'] },
    startBtnText: { fontSize: 15, fontWeight: "600", color: c["destructive-foreground"] },
    startBtnSubtext: { fontSize: 12, color: `${c["destructive-foreground"]}b3` },
    stopBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.foreground,
      borderRadius: 12,
      paddingVertical: 14,
    },
    stopBtnText: { fontSize: 15, fontWeight: "600", color: c.background },
    reviewContainer: { flexDirection: "row", gap: 12 },
    rerecordBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 14,
      backgroundColor: c.card,
    },
    rerecordBtnText: { fontSize: 14, fontWeight: "600", color: c.foreground },
    submitBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 12,
      backgroundColor: c.primary,
      paddingVertical: 14,
    },
    submitBtnText: { fontSize: 14, fontWeight: "600", color: c["destructive-foreground"] },
  });
}

export default function VideoQuestion({ question, applicationStageId, onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const s = createStyles(c);

  // ── permissions ───────────────────────────────────────────────────────────
  const [camPermission, setCamPermission] = useState(null);
  const [micPermission, setMicPermission] = useState(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  // ── camera / recording state ───────────────────────────────────────────────
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS);
  const [videoUri, setVideoUri] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  // ── ui status ─────────────────────────────────────────────────────────────
  // idle | previewing | recording | reviewing | uploading | transcribing
  const [status, setStatus] = useState("idle");

  // ── refs ──────────────────────────────────────────────────────────────────
  const cameraRef = useRef(null);
  const timerRef = useRef(null);
  const audioRecordingRef = useRef(null); // expo-av Audio.Recording instance

  // ── permissions on mount ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      const mic = await Camera.requestMicrophonePermissionsAsync();
      // Also request expo-av audio permission (same mic, but needed for Audio API)
      await Audio.requestPermissionsAsync();
      setCamPermission(cam.status);
      setMicPermission(mic.status);
      const ok = cam.status === "granted" && mic.status === "granted";
      setHasPermissions(ok);
      if (ok) setStatus("previewing");
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Cleanup any running audio recording
      audioRecordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  // ── start both camera + audio recording ──────────────────────────────────
  const startRecording = async () => {
    if (!cameraRef.current || !isCameraReady) return;

    setVideoUri(null);
    setAudioUri(null);
    setIsRecording(true);
    setStatus("recording");
    setTimeLeft(MAX_SECONDS);

    // Configure audio session for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Start expo-av audio recording in parallel
    const audioRec = new Audio.Recording();
    try {
      await audioRec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY // produces .m4a on both platforms
      );
      await audioRec.startAsync();
      audioRecordingRef.current = audioRec;
    } catch (audioErr) {
      console.warn("Audio recording failed to start:", audioErr);
      audioRecordingRef.current = null;
    }

    // Countdown timer
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start camera recording (runs concurrently — does not block)
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: MAX_SECONDS });
      setVideoUri(video?.uri ?? null);
    } catch (err) {
      console.warn("Camera recording error:", err);
    }
  };

  // ── stop both tracks ──────────────────────────────────────────────────────
  const stopRecording = async () => {
    clearInterval(timerRef.current);

    // Stop camera
    cameraRef.current?.stopRecording();

    // Stop audio and grab URI
    if (audioRecordingRef.current) {
      try {
        await audioRecordingRef.current.stopAndUnloadAsync();
        const uri = audioRecordingRef.current.getURI();
        setAudioUri(uri);
      } catch (audioErr) {
        console.warn("Failed to stop audio recording:", audioErr);
      }
      audioRecordingRef.current = null;
    }

    // Reset audio session so playback works normally afterward
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    setIsRecording(false);
    setStatus("reviewing");
  };

  // ── submit: read audio as base64 → send directly to Groq via edge fn ───────
  const handleSubmit = async () => {
    if (!question?.id) return;
    if (!audioUri && !videoUri) return;

    setStatus("transcribing");

    try {
      const sourceUri = audioUri ?? videoUri;
      const isAudio = !!audioUri;
      const ext = isAudio ? "m4a" : "mp4";
      const inlineFileName = `${question.id}_audio.${ext}`;

      // ── Step 1: Read audio file as base64 on-device (fast, no network) ──
      console.log("[VideoQ] reading audio file as base64...");
      const audioBase64 = await FileSystem.readAsStringAsync(sourceUri, {
        encoding: "base64",
      });
      console.log("[VideoQ] base64 length:", audioBase64.length);

      // ── Step 2: Fire storage uploads in the background (don't await) ────
      uploadAudioRecording(sourceUri, applicationStageId, question.id).catch((e) =>
        console.warn("[VideoQ] background audio upload failed:", e?.message)
      );
      if (videoUri && audioUri) {
        uploadVideoInBackground(videoUri, applicationStageId, question.id);
      }

      // ── Step 3: Send base64 directly to edge fn → Groq (~2s total) ──────
      console.log("[VideoQ] calling whisper-api (direct base64 mode)...");
      const { data, error: whisperErr } = await supabase.functions.invoke("whisper-api", {
        body: { audioBase64, fileName: inlineFileName, questionId: question.id },
      });

      if (whisperErr) {
        let detail = whisperErr.message;
        try {
          const body = await whisperErr.context?.json?.();
          detail = JSON.stringify(body ?? detail);
        } catch { /* ignore */ }
        console.error("[VideoQ] whisper-api error:", detail);
        throw new Error(detail);
      }

      const transcript = data?.text ?? "";
      console.log("[VideoQ] transcript received, length:", transcript.length);
      onAnswer(transcript || "[No transcript available]");
    } catch (err) {
      console.error("[VideoQ] submit failed:", err?.message ?? err);
      onAnswer("[Transcription failed]");
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── permission loading ────────────────────────────────────────────────────
  if (camPermission === null || micPermission === null) {
    return (
      <View style={s.permissionContainer}>
        <Ionicons name="camera" size={56} color={c["muted-foreground"]} />
        <Text style={s.permissionTitle}>Camera access required</Text>
        <Text style={s.permissionSubtitle}>
          Allow camera and microphone access to record your video answer
        </Text>
        <TouchableOpacity
          onPress={async () => {
            const cam = await Camera.requestCameraPermissionsAsync();
            const mic = await Camera.requestMicrophonePermissionsAsync();
            await Audio.requestPermissionsAsync();
            setCamPermission(cam.status);
            setMicPermission(mic.status);
            const ok = cam.status === "granted" && mic.status === "granted";
            setHasPermissions(ok);
            if (ok) setStatus("previewing");
          }}
          style={s.permissionBtn}
        >
          <Ionicons name="videocam" size={20} color={c["destructive-foreground"]} />
          <Text style={s.permissionBtnText}>
            Enable Camera &amp; Microphone
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── permission denied ─────────────────────────────────────────────────────
  if (!hasPermissions) {
    const deniedList = [];
    if (camPermission !== "granted") deniedList.push("Camera");
    if (micPermission !== "granted") deniedList.push("Microphone");
    return (
      <View style={s.deniedContainer}>
        <Ionicons name="alert-circle" size={48} color={c.destructive} />
        <Text style={s.deniedText}>
          {deniedList.join(" & ")} permission denied
        </Text>
      </View>
    );
  }

  // ── uploading / transcribing overlay label ────────────────────────────────
  const overlayLabel =
    status === "uploading" ? "Uploading audio…" : "Transcribing…";

  // ── main UI ───────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Camera viewport */}
      <View style={s.cameraWrapper}>
        {status === "reviewing" && videoUri ? (
          <Text style={s.savedRecordingText}>Recording saved</Text>
        ) : (
          <CameraView
            ref={cameraRef}
            style={s.camera}
            facing="front"
            mode="video"
            videoQuality="720p"
            onCameraReady={() => setIsCameraReady(true)}
          />
        )}

        {/* Recording timer badge */}
        {isRecording && (
          <View style={s.timerBadge}>
            <View style={s.timerDot} />
            <Text style={s.timerText}>
              {fmt(timeLeft)}
            </Text>
          </View>
        )}

        {/* Upload / transcription overlay */}
        {(status === "uploading" || status === "transcribing") && (
          <View style={s.overlay}>
            <ActivityIndicator size="large" color={c.foreground} />
            <Text style={s.overlayText}>{overlayLabel}</Text>
            {status === "transcribing" && (
              <Text style={s.overlaySubtext}>
                Video is saving in the background
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={s.controlsContainer}>
        {status === "previewing" && (
          <TouchableOpacity
            onPress={startRecording}
            activeOpacity={0.8}
            style={s.startBtn}
          >
            <View style={s.startBtnIcon} />
            <Text style={s.startBtnText}>
              Start Recording
            </Text>
            <Text style={s.startBtnSubtext}>(max 3 min)</Text>
          </TouchableOpacity>
        )}

        {status === "recording" && (
          <TouchableOpacity
            onPress={stopRecording}
            activeOpacity={0.8}
            style={s.stopBtn}
          >
            <Ionicons name="stop-circle" size={24} color={c.background} />
            <Text style={s.stopBtnText}>
              Stop Recording
            </Text>
          </TouchableOpacity>
        )}

        {status === "reviewing" && (
          <View style={s.reviewContainer}>
            <TouchableOpacity
              onPress={startRecording}
              activeOpacity={0.8}
              style={s.rerecordBtn}
            >
              <Ionicons name="refresh" size={18} color={c.foreground} />
              <Text style={s.rerecordBtnText}>Re-record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              style={s.submitBtn}
            >
              <Ionicons name="checkmark-circle" size={18} color={c["destructive-foreground"]} />
              <Text style={s.submitBtnText}>
                Submit Answer →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
