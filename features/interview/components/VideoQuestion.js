import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, Camera } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { supabase } from "../../../shared/services/supabase";
import { uploadRecording } from "../services/video_storage_service";

const MAX_SECONDS = 180;

export default function VideoQuestion({ question, applicationStageId, onAnswer }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const [camPermission, setCamPermission] = useState(null);
  const [micPermission, setMicPermission] = useState(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS);
  const [videoUri, setVideoUri] = useState(null);
  const [status, setStatus] = useState("idle");
  const cameraRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      const mic = await Camera.requestMicrophonePermissionsAsync();
      setCamPermission(cam.status);
      setMicPermission(mic.status);
      const ok = cam.status === "granted" && mic.status === "granted";
      setHasPermissions(ok);
      if (ok) setStatus("previewing");
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current || !isCameraReady) return;
    setVideoUri(null);
    setIsRecording(true);
    setStatus("recording");
    setTimeLeft(MAX_SECONDS);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          cameraRef.current?.stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: MAX_SECONDS });
      setVideoUri(video.uri);
      setIsRecording(false);
      setStatus("reviewing");
    } catch (err) {
      setIsRecording(false);
      console.error("Recording failed:", err);
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    cameraRef.current?.stopRecording();
  };

  const handleSubmit = async () => {
    if (!videoUri || !question?.id) return;
    setStatus("uploading");

    try {
      const blob = await FileSystem.readAsStringAsync(videoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const byteArray = Uint8Array.from(atob(blob), (c) => c.charCodeAt(0));
      const blobData = new Blob([byteArray], { type: "video/mp4" });

      const { fileName } = await uploadRecording(blobData, applicationStageId, question.id);

      const { data: whisperData, error: whisperErr } = await supabase.functions.invoke("whisper-api", {
        body: { audioPath: fileName, questionId: question.id },
      });

      if (whisperErr) throw whisperErr;
      const transcript = whisperData?.text ?? "";
      onAnswer(transcript || "[No transcript available]");
    } catch (err) {
      console.error("Upload/transcription failed:", err);
      onAnswer("[Transcription failed]");
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (camPermission === null || micPermission === null) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 16 }}>
        <Ionicons name="camera" size={48} color={c['muted-foreground']} />
        <Text style={{ fontSize: 14, fontWeight: "600", color: c.foreground }}>Camera access required</Text>
        <Text style={{ fontSize: 12, color: c['muted-foreground'], textAlign: "center" }}>
          Allow camera and microphone access to record your video answer
        </Text>
        <TouchableOpacity
          onPress={async () => {
            const cam = await Camera.requestCameraPermissionsAsync();
            const mic = await Camera.requestMicrophonePermissionsAsync();
            setCamPermission(cam.status);
            setMicPermission(mic.status);
            const ok = cam.status === "granted" && mic.status === "granted";
            setHasPermissions(ok);
            if (ok) setStatus("previewing");
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: c.accent,
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Ionicons name="videocam" size={18} color={c['destructive-foreground']} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: c['destructive-foreground'] }}>
            Enable Camera & Microphone
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasPermissions) {
    const deniedList = [];
    if (camPermission !== "granted") deniedList.push("Camera");
    if (micPermission !== "granted") deniedList.push("Microphone");
    return (
      <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 12 }}>
        <Ionicons name="alert-circle" size={40} color={c.destructive} />
        <Text style={{ fontSize: 14, color: c.destructive }}>
          {deniedList.join(" & ")} permission denied
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 20 }}>
      <View style={{
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#0a0f1a",
        aspectRatio: 16 / 9,
        justifyContent: "center",
        alignItems: "center",
      }}>
        {status === "reviewing" && videoUri ? (
          <Text style={{ color: c['muted-foreground'], fontSize: 12 }}>Recording saved</Text>
        ) : (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1, aspectRatio: 16 / 9 }}
            facing="front"
            mode="video"
            videoQuality="720p"
            onCameraReady={() => setIsCameraReady(true)}
          />
        )}

        {isRecording && (
          <View style={{
            position: "absolute",
            top: 12,
            left: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.destructive }} />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
              {fmt(timeLeft)}
            </Text>
          </View>
        )}

        {status === "uploading" && (
          <View style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>Transcribing…</Text>
          </View>
        )}
      </View>

      <View style={{ gap: 10 }}>
        {status === "previewing" && (
          <TouchableOpacity
            onPress={startRecording}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: c.destructive,
              borderRadius: 12,
              paddingVertical: 14,
            }}
          >
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff" }} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: c['destructive-foreground'] }}>
              Start Recording
            </Text>
            <Text style={{ fontSize: 11, color: `${c['destructive-foreground']}aa` }}>(max 3 min)</Text>
          </TouchableOpacity>
        )}

        {status === "recording" && (
          <TouchableOpacity
            onPress={stopRecording}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: c.foreground,
              borderRadius: 12,
              paddingVertical: 14,
            }}
          >
            <Ionicons name="stop-circle" size={22} color={c.background} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: c.background }}>
              Stop Recording
            </Text>
          </TouchableOpacity>
        )}

        {status === "reviewing" && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={startRecording}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: c.border,
                paddingVertical: 12,
                backgroundColor: c.card,
              }}
            >
              <Ionicons name="refresh" size={16} color={c.foreground} />
              <Text style={{ fontSize: 13, fontWeight: "500", color: c.foreground }}>Re-record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                borderRadius: 12,
                backgroundColor: c.primary,
                paddingVertical: 12,
              }}
            >
              <Ionicons name="checkmark-circle" size={16} color={c['destructive-foreground']} />
              <Text style={{ fontSize: 13, fontWeight: "600", color: c['destructive-foreground'] }}>
                Submit Answer →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
