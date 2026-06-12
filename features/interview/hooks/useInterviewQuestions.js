import { useCallback, useEffect, useState } from "react";
import {
  fetchInterviewStageByApplicationId,
  fetchQuestionsByApplicationStageId,
} from "../services/interview_database_service";

export default function useInterviewQuestions(applicationId) {
  const [applicationStage, setApplicationStage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const stage = await fetchInterviewStageByApplicationId(applicationId);
      setApplicationStage(stage);
      if (stage?.id) {
        const qs = await fetchQuestionsByApplicationStageId(stage.id);
        setQuestions(
          qs.map((q) => ({
            id: q.id,
            text: q.question_text,
            orderIndex: q.order_index,
            questionType: q.question_type,
            generationContext: q.generation_context ?? {},
            answer: q.application_answers?.[0] ?? null,
          }))
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { load(); }, [load]);

  return { applicationStage, questions, loading, error, reload: load };
}
