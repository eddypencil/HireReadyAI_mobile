import { useState } from "react";
import { SENIORITY_LEVEL } from "@/shared/constants/enums";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { supabase } from "@/shared/services/supabase";
import {
  Building2,
  MapPin,
  Briefcase,
  Monitor,
  TrendingUp,
  BanknoteIcon,
} from "lucide-react";

const SUPABASE_FUNCTION_URL =
  "https://bztehkwxefeyknoogzkr.supabase.co/functions/v1/jd-generate";

export default function JDGeneratorPage({ company, profile }) {
  const { createJob } = useJobs();

  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [keyNotes, setKeyNotes] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [previewMeta, setPreviewMeta] = useState({
    title: "", seniority: "", workLocation: "", jobType: "", experienceYears: ""
  });
  const [errors, setErrors] = useState({});

  const [generated, setGenerated] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [published, setPublished] = useState(false);

  const inputClass =
    "w-full h-11 rounded-xl px-4 text-sm text-dark-amethyst-700 bg-white border border-dark-amethyst-100 outline-none transition-all duration-200 placeholder:text-dark-amethyst-300";
  const selectClass =
    "w-full h-11 rounded-xl px-4 text-sm text-dark-amethyst-700 bg-white border border-dark-amethyst-100 outline-none transition-all duration-200";
  const labelClass =
    "text-xs font-semibold text-dark-amethyst-600 uppercase tracking-wide";

  const handleFocus = (e) => {
    e.target.style.borderColor = "#8400ff";
    e.target.style.boxShadow = "0 0 0 3px rgba(132,0,255,0.08)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "";
    e.target.style.boxShadow = "none";
  };

  const fieldClass = (base, errorKey) =>
    `${base} ${errors[errorKey] ? "!border-red-400" : ""}`;

  function validate() {
    const newErrors = {};
    if (!title) newErrors.title = "Job title is required";
    if (!seniority) newErrors.seniority = "Please select a seniority level";
    if (!jobType) newErrors.jobType = "Please select a job type";
    if (!workLocation) newErrors.workLocation = "Please select a work type";
    if (!experienceYears) newErrors.experienceYears = "Please select experience required";
    return newErrors;
  }


  async function handleGenerate(e) {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGenerating(true);
    setPreviewMeta({ title, seniority, workLocation, jobType, experienceYears });
    setGenerateError(null);
    setGenerated(false);
    setAiResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title,
          seniority,
          workLocation,
          location: company?.location || "",
          keyNotes,
          requiredSkills,
          experienceYears,
          companyName: company?.name || "",
          companyIndustry: company?.industry || "",
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate JD");
      }

      const result = await response.json();
      setAiResult(result);
      setGenerated(true);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  }


  async function handlePublish() {
    if (!aiResult || !company?.id) return;

    setPublishing(true);
    setPublishError(null);

    try {
      await createJob({
        company_id: company.id,
        created_by_profile_id: profile?.id || null,
        title,
        seniority_level: seniority || null,
        job_type: jobType || null,
        work_location: workLocation || null,
        experience_years: experienceYears || null,
        description: aiResult.description,
        responsibilities: aiResult.responsibilities,
        requirements: aiResult.requirements,
        skills: aiResult.skills,
        salary_min: aiResult.salary_min || null,
        salary_max: aiResult.salary_max || null,
      });

      setPublished(true);
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  
  if (published) {
    return (
      <div className="min-h-screen bg-dark-amethyst-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-dark-amethyst-100 border border-dark-amethyst-200 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#6900cc" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-dark-amethyst-950 text-2xl font-bold mb-3">Job Published!</h2>
          <p className="text-dark-amethyst-700 text-sm leading-7 mb-8">
            <span>{title}</span> has been published and is now visible to applicants.
          </p>
          <button
            onClick={() => {
              setPublished(false);
              setGenerated(false);
              setAiResult(null);
              setTitle("");
              setSeniority("");
              setWorkLocation("");
              setJobType("");
              setSalaryMin("");
              setSalaryMax("");
              setKeyNotes("");
              setExperienceYears("");
              setRequiredSkills("");
              setErrors({});
              setPreviewMeta({ title: "", seniority: "", workLocation: "", jobType: "", experienceYears: "" });
            }}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-medium bg-dark-amethyst-600 hover:bg-dark-amethyst-700 transition"
          >
            Generate another JD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-amethyst-50 p-6">

      
      <div className="max-w-7xl mx-auto mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-amethyst-950">Job Description Generator</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium border border-dark-amethyst-200 text-dark-amethyst-400 bg-white cursor-pointer">
            Save draft
          </button>
          <button
            onClick={handlePublish}
            disabled={!generated || publishing}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition
              ${generated && !publishing
                ? "bg-dark-amethyst-600 hover:bg-dark-amethyst-700 cursor-pointer"
                : "bg-dark-amethyst-300 cursor-not-allowed"
              }`}
            style={generated ? { boxShadow: "0 2px 12px rgba(132,0,255,0.2)" } : {}}
          >
            {publishing ? (
              <>
                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Publish JD
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        
        <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
          <h2 className="text-base font-bold text-dark-amethyst-950 mb-1">Role brief</h2>
          <p className="text-dark-amethyst-400 text-sm mb-6">
            Fill in the basics - AI handles the rest.
          </p>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5">

            
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Role title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors(p => ({ ...p, title: "" })); }}
                placeholder="Job title"
                className={fieldClass(inputClass, "title")}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Seniority</label>
                <select
                  value={seniority}
                  onChange={(e) => { setSeniority(e.target.value); setErrors(p => ({ ...p, seniority: "" })); }}
                  className={fieldClass(selectClass, "seniority")}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select seniority</option>
                  {Object.values(SENIORITY_LEVEL).map((lvl) => (
                    <option key={lvl} value={lvl} className="capitalize">{lvl}</option>
                  ))}
                </select>
                {errors.seniority && <p className="text-xs text-red-500 mt-0.5">{errors.seniority}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Job type</label>
                <select
                  value={jobType}
                  onChange={(e) => { setJobType(e.target.value); setErrors(p => ({ ...p, jobType: "" })); }}
                  className={fieldClass(selectClass, "jobType")}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                </select>
                {errors.jobType && <p className="text-xs text-red-500 mt-0.5">{errors.jobType}</p>}
              </div>
            </div>

            
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Work type</label>
              <select
                value={workLocation}
                onChange={(e) => { setWorkLocation(e.target.value); setErrors(p => ({ ...p, workLocation: "" })); }}
                className={fieldClass(selectClass, "workLocation")}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">Select work type</option>
                <option value="on_site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {errors.workLocation && <p className="text-xs text-red-500 mt-0.5">{errors.workLocation}</p>}
            </div>

            
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Experience required</label>
              <input
                type="text"
                value={experienceYears}
                onChange={(e) => { setExperienceYears(e.target.value); setErrors(p => ({ ...p, experienceYears: "" })); }}
                placeholder="e.g. 1-3 years"
                className={fieldClass(inputClass, "experienceYears")}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.experienceYears && <p className="text-xs text-red-500 mt-0.5">{errors.experienceYears}</p>}
            </div>


            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Required skills <span className="text-dark-amethyst-400 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="Required skills"
                className={inputClass}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Salary range (EGP) <span className="text-dark-amethyst-400 normal-case font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className={inputClass}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <span className="text-dark-amethyst-300 text-sm shrink-0">to</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className={inputClass}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Key notes <span className="text-dark-amethyst-400 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                rows={5}
                value={keyNotes}
                onChange={(e) => setKeyNotes(e.target.value)}
                placeholder="Additional hiring notes..."
                className="w-full rounded-xl px-4 py-3 text-sm text-dark-amethyst-900 bg-white border border-dark-amethyst-100 outline-none transition-all duration-200 placeholder:text-dark-amethyst-300 resize-none"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {generateError && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200">
                <span>⚠</span>{generateError}
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className={`w-full h-11 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2
                ${generating ? "bg-dark-amethyst-400 cursor-not-allowed" : "bg-dark-amethyst-600 hover:bg-dark-amethyst-700"}`}
              style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
            >
              {generating ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate JD
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

          </form>
        </div>

        
        <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
          {!generated ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-full bg-dark-amethyst-50 border border-dark-amethyst-100 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="#8400ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-dark-amethyst-700 font-medium text-sm">Fill in the role brief</p>
              <p className="text-dark-amethyst-400 text-xs mt-1">and click Generate JD to see the preview</p>
            </div>
          ) : (
            <div className="space-y-6">

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-dark-amethyst-500 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      stroke="#8400ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  AI Generated
                </span>
              </div>

              
              <div>
                <h2 className="text-xl font-bold text-dark-amethyst-950">{previewMeta.title}</h2>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-dark-amethyst-600">
                  {company?.name && (
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500" />
                      <span>{company.name}</span>
                    </div>
                  )}
                  {company?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-red-400" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {previewMeta.workLocation && (
                    <div className="flex items-center gap-2">
                      <Monitor size={16} className="text-fuchsia-500" />
                      <span>{previewMeta.workLocation.replace("_", " ")}</span>
                    </div>
                  )}
                  {previewMeta.jobType && (
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-orange-400" />
                      <span>{previewMeta.jobType.replace("_", " ")}</span>
                    </div>
                  )}
                  {previewMeta.seniority && (
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-dark-amethyst-500" />
                      <span>{previewMeta.seniority}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-dark-amethyst-600 text-sm mt-2">
                  <BanknoteIcon size={16} className="text-green-500" />
                  <span>
                    {aiResult?.salary_min && aiResult?.salary_max
                      ? `${aiResult.salary_min.toLocaleString()} – ${aiResult.salary_max.toLocaleString()} EGP`
                      : "Salary: Confidential"
                    }
                  </span>
                </div>
              </div>

              
              <div>
                <h3 className="text-sm font-bold text-dark-amethyst-950 mb-2">About the role</h3>
                <p className="text-dark-amethyst-900 text-sm leading-relaxed">{aiResult?.description}</p>
              </div>

            
              {aiResult?.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-dark-amethyst-950 mb-2">What you'll do</h3>
                  <ul className="space-y-1.5">
                    {aiResult.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-dark-amethyst-900 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              
              {aiResult?.requirements?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-dark-amethyst-950 mb-2">What we're looking for</h3>
                  <ul className="space-y-1.5">
                    {aiResult.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-dark-amethyst-900 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark-amethyst-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              
              {aiResult?.skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-dark-amethyst-950 mb-3">Skills & Tools</h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    {aiResult.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-dark-amethyst-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-dark-amethyst-500" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {publishError && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200">
                  <span>⚠</span>{publishError}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}