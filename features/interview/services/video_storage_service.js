import { supabase } from "../../../shared/services/supabase";
import { updateApplicationQuestion } from "./interview_database_service";

const BUCKET_NAME = "interview-recordings";

// ─────────────────────────────────────────────
// Internal: resolve auth token for raw fetch
// ─────────────────────────────────────────────
const getToken = async () => {
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? supabaseKey;
};

// ─────────────────────────────────────────────
// Upload AUDIO only (m4a) → used for Whisper transcription
// Returns { fileName } so the caller can pass audioPath to the edge function.
// ─────────────────────────────────────────────
export const uploadAudioRecording = async (audioUri, applicationStageId, questionId) => {
  const fileName = `${applicationStageId}/${questionId}_audio_${Date.now()}.m4a`;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const token = await getToken();

  const formData = new FormData();
  formData.append("file", {
    uri: audioUri,
    type: "audio/m4a",
    name: fileName,
  });

  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${fileName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-upsert": "true",
      },
      body: formData,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Audio upload failed (${res.status}): ${text}`);
  }

  return { fileName };
};

// ─────────────────────────────────────────────
// Upload VIDEO (.mp4) silently in the background.
// Call this fire-and-forget; do NOT await in the UI flow.
// Patches generation_context with the public video URL when done.
// ─────────────────────────────────────────────
export const uploadVideoInBackground = async (videoUri, applicationStageId, questionId) => {
  try {
    const fileName = `${applicationStageId}/${questionId}_video_${Date.now()}.mp4`;
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const token = await getToken();

    const formData = new FormData();
    formData.append("file", {
      uri: videoUri,
      type: "video/mp4",
      name: fileName,
    });

    const res = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${fileName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-upsert": "true",
        },
        body: formData,
      },
    );

    if (!res.ok) {
      console.warn("Background video upload failed:", res.status);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Merge video URL into generation_context without overwriting audio/transcript keys
    const { data: current } = await supabase
      .from("application_questions")
      .select("generation_context")
      .eq("id", questionId)
      .single();

    await updateApplicationQuestion(questionId, {
      generation_context: {
        ...(current?.generation_context ?? {}),
        video_url: publicUrl,
        video_storage_path: fileName,
      },
    });
  } catch (err) {
    // Silent — video is supplementary; don't surface this to the user
    console.warn("Background video upload error:", err?.message);
  }
};

// ─────────────────────────────────────────────
// Retry pending transcriptions for a stage
// ─────────────────────────────────────────────
export const retryPendingTranscriptions = async (applicationStageId) => {
  const { data: questions, error } = await supabase
    .from("application_questions")
    .select("id, generation_context")
    .eq("application_stage_id", applicationStageId);

  if (error) throw error;
  if (!questions?.length) return [];

  const pending = questions.filter(
    (q) =>
      q.generation_context?.audio_storage_path &&
      q.generation_context?.transcription_status !== "completed"
  );

  if (!pending.length) return [];

  const results = await Promise.allSettled(
    pending.map((q) =>
      supabase.functions.invoke("whisper-api", {
        body: {
          audioPath: q.generation_context.audio_storage_path,
          questionId: q.id,
        },
      })
    )
  );
  return results;
};

// ─────────────────────────────────────────────
// Delete a recording from storage
// ─────────────────────────────────────────────
export const deleteRecording = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);
  if (error) throw error;
};
