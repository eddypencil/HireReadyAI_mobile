class InterviewQuestionScore {
  constructor(interviewQuestionId, dimensionName, score, citation, reasoning, confidence) {
    this.interviewQuestionId = interviewQuestionId;
    this.dimensionName = dimensionName;
    this.score = score;
    this.citation = citation;
    this.reasoning = reasoning;
    this.confidence = confidence;
  }

  toSupabaseForm() {
    return {
      interview_question_id: this.interviewQuestionId,
      dimension_name: this.dimensionName,
      score: this.score,
      citation: this.citation,
      reasoning: this.reasoning,
      confidence: this.confidence,
    };
  }
}

export default InterviewQuestionScore;
