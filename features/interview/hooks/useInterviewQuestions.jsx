import { useCallback, useEffect, useState } from "react"
import { fetchInterviewByApplicationId, fetchQuestionsByInterviewId } from "../services/interview_database_service"


export default function useInterviewQuestions(applicationID) {
  const [interview,setInterview]=useState({})
  const [questions,setQuestions]=useState([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const interviewData = await fetchInterviewByApplicationId(applicationID);
      setInterview(interviewData);
      if (interviewData?.id) {
        const qs = await fetchQuestionsByInterviewId(interviewData.id);
        setQuestions(qs.map(q => ({ id: q.id, text: q.question_text })));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applicationID]);


  useEffect(() => { if (applicationID) load(); }, [load]);


  
 return {
  interview,
  questions,
  loading,
  error,
  reload: load
};
}
