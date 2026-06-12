import { supabase } from "../../../shared/services/supabase";
import { updateApplicationQuestion } from "./interview_database_service";

const BUCKET_NAME = "interview-recordings";

export const uploadRecording = async (blob, applicationStageId, questionId) => {
  const fileName = `${applicationStageId}/${questionId}_${Date.now()}.webm`;

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

  await updateApplicationQuestion(questionId, {
    generation_context: {
      recording_url: publicUrl,
      storage_path: fileName,
      transcription_status: "pending",
    },
  });

  return { publicUrl, fileName };
};

export const retryPendingTranscriptions = async (applicationStageId) => {
  const { data: questions, error } = await supabase
    .from("application_questions")
    .select("id, generation_context")
    .eq("application_stage_id", applicationStageId);

  if (error) throw error;
  if (!questions?.length) return [];

  const pending = questions.filter(
    (q) =>
      q.generation_context?.storage_path &&
      q.generation_context?.transcription_status !== "completed"
  );

  if (!pending.length) return [];

  const results = await Promise.allSettled(
    pending.map((q) =>
      supabase.functions.invoke("whisper-api", {
        body: { audioPath: q.generation_context.storage_path, questionId: q.id },
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
