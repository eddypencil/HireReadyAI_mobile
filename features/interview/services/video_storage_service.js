import { supabase } from "../../../shared/services/supabase";

const BUCKET_NAME = "interview-recordings";

export const uploadRecording = async (blob, interviewId, questionId) => {
  const fileName = `${interviewId}/${questionId}_${Date.now()}.webm`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: "video/webm",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("interview_questions")
    .update({
      recording_url: publicUrl,
      storage_path: fileName,
      transcription_status: "pending",
    })
    .eq("id", questionId);

  if (updateError) throw updateError;

  return { publicUrl, fileName };
};

export const updateTranscript = async (questionId, transcript, confidence = null) => {
  const updates = { transcript };
  if (confidence !== null) {
    updates.whisper_confidence = confidence;
  }

  const { error } = await supabase
    .from("interview_questions")
    .update(updates)
    .eq("id", questionId);

  if (error) throw error;
};

export const retryPendingTranscriptions = async (interviewId) => {
  const { data: questions, error } = await supabase
    .from("interview_questions")
    .select("id, storage_path")
    .eq("interview_id", interviewId)
    .neq("transcription_status", "completed");

  if (error) throw error;
  if (!questions?.length) return [];

  const results = await Promise.allSettled(
    questions.map((q) =>
      supabase.functions.invoke("whisper-api", {
        body: { audioPath: q.storage_path, questionId: q.id },
      })
    )
  );
  return results;
};

export const deleteRecording = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) throw error;
};
