// src/features/applications/pages/ApplyJobPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { fetchQuestionsByJobId } from "../services/application.service";
import { createApplication } from "../services/application.service";
import { supabase } from "@/shared/services/supabase";
import QuestionCard from "../components/apply/QuestionCard";

export default function ApplyJobPage() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();

  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null,
    answers: {},
  });

  const steps = ["Info", "Resume", "Questions"];
  const progress = ((step + 1) / steps.length) * 100;
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);
  const clearFieldError = (field) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validateStep = () => {
    const stepErrors = {};

    if (step === 0) {
      if (!form.fullName.trim()) {
        stepErrors.fullName = "Full name is required";
      }

      if (!form.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        stepErrors.email = "Invalid email format";
      }

      if (!form.phone.trim()) {
        stepErrors.phone = "Phone is required";
      } else if (form.phone.length < 10) {
        stepErrors.phone = "Invalid phone number";
      }
    }

    if (step === 1 && !form.resume) {
      stepErrors.resume = "Resume is required";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // FETCH QUESTIONS FROM SUPABASE
  useEffect(() => {
    if (!jobId) return;

    const loadQuestions = async () => {
      try {
        const data = await fetchQuestionsByJobId(jobId);
        setQuestions(data);
      } catch (err) {
        console.error("Error loading questions:", err);
      }
    };

    loadQuestions();
  }, [jobId]);

  // ANSWERS HANDLER
  const handleAnswer = (id, value) => {
    setForm((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: value,
      },
    }));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`question_${id}`];
      return copy;
    });
  };

  // UPLOAD RESUME
  const uploadResume = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("resumes")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);

    return data.publicUrl;
  };

  const validateForm = () => {
    const newErrors = {};

    // INFO
    if (!form.fullName.trim()) newErrors.fullName = "This field can't be empty";

    if (!form.email.trim()) newErrors.email = "This field can't be empty";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";

    if (!form.phone.trim()) newErrors.phone = "This field can't be empty";
    else if (form.phone.length < 10)
      newErrors.phone = "Please enter a valid phone number";

    // RESUME
    if (!form.resume) newErrors.resume = "Resume is required";
    else {
      if (form.resume.type !== "application/pdf")
        newErrors.resume = "Only PDF files are allowed";

      if (form.resume.size > 5 * 1024 * 1024)
        newErrors.resume = "Maximum file size is 5MB";
    }

    // QUESTIONS
    questions.forEach((q) => {
      if (!form.answers[q.id]) {
        newErrors[`question_${q.id}`] = "This field can't be empty";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        setToast({
          type: "error",
          message: "Please complete all required fields",
        });
        return;
      }

      setLoading(true);

      let cvUrl = null;
      let cvName = null;

      if (form.resume) {
        const file = form.resume;

        cvUrl = await uploadResume(file);
        cvName = file.name;
      }
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_profile_id", profile.id)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existing) {
        setToast({
          type: "error",
          message: "You have already applied for this job",
        });

        return;
      }
      const payload = {
        candidate_profile_id: profile.id,
        job_id: jobId,
        cv_file_url: cvUrl,
        cv_file_name: cvName,
        answers: {
          info: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
          },
          questions: form.answers,
        },
        current_stage: "applied",
        applied_at: new Date().toISOString(),
      };

      await createApplication(payload);

      setToast({
        type: "success",
        message: "Application submitted successfully!",
      });

      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      console.error("❌ Submit error:", err);
      setToast({
        type: "error",
        message: "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg text-white font-medium ${
              toast.type === "success" ? "bg-violet-600" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.message}
          </div>
        </div>
      )}

      {/* PAGE */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* HEADER */}
          <div className="p-6 border-b bg-white">
            <h1 className="text-xl font-semibold text-gray-900">
              Apply for Job
            </h1>

            <div className="mt-4 flex justify-between text-xs text-gray-500">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={
                    i <= step ? "text-violet-600 font-medium" : "text-gray-400"
                  }
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-4">
            {/* STEP 1 - INFO */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    placeholder="Full Name"
                    value={form.fullName || ""}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    onChange={(e) => {
                      const value = e.target.value;

                      setForm((prev) => ({
                        ...prev,
                        fullName: value,
                      }));

                      if (errors.fullName) clearFieldError("fullName");
                    }}
                  />

                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>

                  <input
                    placeholder="Email"
                    value={form.email || ""}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    onChange={(e) => {
                      const value = e.target.value;

                      setForm((prev) => ({
                        ...prev,
                        email: value,
                      }));

                      if (errors.email) clearFieldError("email");
                    }}
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Phone <span className="text-red-500">*</span>
                  </label>

                  <input
                    placeholder="Phone"
                    value={form.phone || ""}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    onChange={(e) => {
                      const value = e.target.value;

                      setForm((prev) => ({
                        ...prev,
                        phone: value,
                      }));

                      if (errors.phone) clearFieldError("phone");
                    }}
                  />

                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 - RESUME */}
            {step === 1 && (
              <div>
                <label className="block mb-2 font-medium">
                  Resume <span className="text-red-500">*</span>
                </label>

                <label
                  className={`block border-2 border-dashed p-10 text-center rounded-xl cursor-pointer ${
                    errors.resume ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        resume: e.target.files[0],
                      }));

                      if (errors.resume) clearFieldError("resume");
                    }}
                  />

                  {form.resume ? (
                    <p>{form.resume.name}</p>
                  ) : (
                    <p>Upload Resume (PDF)</p>
                  )}
                </label>

                {errors.resume && (
                  <p className="text-red-500 text-sm mt-2">{errors.resume}</p>
                )}
              </div>
            )}

            {/* STEP 3 - QUESTIONS (FROM SUPABASE) */}
            {step === 2 && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    value={form.answers[q.id]}
                    error={errors[`question_${q.id}`]}
                    onChange={(val) => handleAnswer(q.id, val)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-5 border-t flex justify-between">
            {step > 0 ? (
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                className="px-5 py-2 bg-violet-600 text-white rounded-lg"
                onClick={() => {
                  const isValid = validateStep();
                  if (!isValid) {
                    setToast({
                      type: "error",
                      message: "Please fix errors before continuing",
                    });
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 bg-green-600 text-white rounded-lg"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
