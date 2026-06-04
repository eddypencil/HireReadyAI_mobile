class InterviewQuestion {
  constructor(interviewId, questionText, isPersonalized, cvReferencePoint, sortOrder) {
    this.interviewId = interviewId;
    this.questionText = questionText;
    this.isPersonalized = isPersonalized;
    this.cvReferencePoint = cvReferencePoint;
    this.sortOrder = sortOrder;
  }

  toSupabaseForm() {
    return {
      interview_id: this.interviewId,
      question_text: this.questionText,
      is_personalized: this.isPersonalized,
      cv_reference_point: this.cvReferencePoint,
      sort_order: this.sortOrder,
    };
  }
}

export default InterviewQuestion;
