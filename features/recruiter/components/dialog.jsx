import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { bulkCreateQuestions, createInterview } from "@/features/interview/services/interview_database_service"
import InterviewModel from "@/features/interview/models/interview.model"
import { INTERVIEW_STATUS } from "@/shared/constants/enums"
import { TextareaField } from "./textArea"
import InterviewQuestion from "@/features/interview/models/interview-question.model"

export function AddInterviewDialog() {
    const [applicationID, setApplicationID] = useState("");
    const [jobID, setJobID] = useState("");
    const [reRecordMins, setReRecordMins] = useState(0);
    const [error, setError] = useState("");
    const [questionsText, setQuestionsText] = useState("");
    const [questionsList, setQuestionList] = useState([]);
    const [loading, setLoading] = useState(false);

    async function submitInterview(e) {
      e.preventDefault();
      if (!applicationID || !jobID) {
        setError("Application ID and Job ID are required");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const array = questionsText.split(/\r?\n/).filter(q => q.trim() !== "").map(q => q.trim())
        setQuestionList(array)

        const interview = new InterviewModel(
          applicationID,
          jobID,
          INTERVIEW_STATUS.scheduled,
          new Date().toISOString(),
          reRecordMins
        );
        let data = await createInterview(interview.toSupabaseForm());
        await bulkCreateQuestions(array.map((q, i) => {
          const question = new InterviewQuestion(data.id, q, false, null, i + 1);
          return question.toSupabaseForm();
        }))
      } catch (err) {
        console.log(err)
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={submitInterview}>
          <DialogHeader>
            <DialogTitle>SEND AN INTERVIEW INVITATION</DialogTitle>
            <DialogDescription>
              send an interview to an applicant
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="application-id">application id</Label>
              <Input id="applicant-id" name="applicant-id" onChange={(e)=>{setApplicationID(e.target.value)}}/>
            </Field>
            <Field>
              <Label htmlFor="job-id">job id</Label>
              <Input id="job-id" name="job-id" onChange={(e) => setJobID(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="rerecord-input">rerecord availible after </Label>
              <Input id="rerecord-input" name="rerecord-input" type="number" className="no-spinner" onChange={(e) => {
                    const value = Number(e.target.value);
                    if(value < 0){
                        setError("Rerecord minutes has to be more than 0")
                    }else{
                        setError("")
                        setReRecordMins(value)
                    }
              }}/>
              {error&&<p className="italic text-red-400 text-sm">{error}</p>}
            </Field>
             <Field>
               <TextareaField value={questionsText} onChange={(e)=>{setQuestionsText(e.target.value)}}/>
             </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send interview"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
