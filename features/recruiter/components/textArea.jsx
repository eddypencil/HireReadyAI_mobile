import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export function TextareaField({ value, onChange }) {
  return (
    <Field>
      <FieldLabel htmlFor="textarea-message">Questions</FieldLabel>
      <FieldDescription>Enter each question on a new line.</FieldDescription>
      <Textarea
        id="textarea-message"
        placeholder="Question 1&#10;Question 2&#10;Question 3"
        value={value}
        onChange={onChange}
      />
    </Field>
  )
}
