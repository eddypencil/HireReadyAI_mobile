import { supabase } from "../../../shared/services/supabase";

/**
 * Fire-and-forget trigger for the CV Review edge function.
 * Call this immediately after createApplication() succeeds.
 *
 * The function is intentionally non-blocking: any error is logged
 * but never surfaced to the applicant — the edge function handles
 * its own error state inside the DB.
 *
 * @param {string} applicationId - The newly created application's id
 * @param {string} cvText - The extracted text from the candidate's CV
 */
export const triggerCvReview = (applicationId, cvText) => {
  supabase.functions
    .invoke("cv-review", { body: { applicationId, cvText: cvText || "No text extracted from CV." } })
    .then(({ error }) => {
      if (error) {
        console.error("[CV Review] Edge function returned an error:", error);
      } else {
        console.log("[CV Review] Triggered successfully for application:", applicationId);
      }
    })
    .catch((err) => {
      console.error("[CV Review] Failed to invoke edge function:", err);
    });
};
