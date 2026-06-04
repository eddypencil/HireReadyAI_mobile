import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const {
    title,
    seniority,
    workLocation,
    location,
    keyNotes,
    requiredSkills,
    experienceYears,
    companyName,
    companyIndustry,
    salaryMin,
    salaryMax,
  } = await req.json();

  if (!title) {
    return new Response(
      JSON.stringify({ error: "title is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const salaryString =
    salaryMin && salaryMax
      ? `${salaryMin.toLocaleString()} – ${salaryMax.toLocaleString()} EGP`
      : "Confidential";

  // Build the prompt dynamically based on what the HR provided
  const hasKeyNotes = keyNotes && keyNotes.trim().length > 0;
  const hasRequiredSkills = requiredSkills && requiredSkills.trim().length > 0;

  const prompt = `You are an expert HR professional writing a professional job description.

${hasKeyNotes
  ? `The recruiter has described what they specifically need for this role:
"${keyNotes}"

This description is your PRIMARY source. Extract:
- Tasks and duties mentioned → put them in responsibilities
- Technologies and tools mentioned → put them in skills
- Qualifications and experience mentioned → put them in requirements
- Use this to write the description paragraph as well`
  : `Generate a professional job description using industry best practices for a ${seniority || ""} ${title} role at ${companyName || "a company"} in the ${companyIndustry || ""} industry.`
}

Role details:
- Title: ${title}
- Seniority: ${seniority || "Not specified"}
- Experience required: ${experienceYears || "Not specified"}
- Work type: ${workLocation || "Not specified"}
- Location: ${location || "Not specified"}
- Company: ${companyName || "Not specified"}
- Industry: ${companyIndustry || "Not specified"}
- Salary: ${salaryString}
${hasRequiredSkills ? `- Required skills/tech stack: ${requiredSkills}` : ""}

${hasRequiredSkills
  ? `IMPORTANT: The recruiter specified these required skills: "${requiredSkills}". These MUST appear in the skills array. Build responsibilities and requirements around these skills.`
  : ""
}

Return ONLY a valid JSON object with exactly these fields, no extra text, no markdown, no code blocks:
{
  "description": "2-3 sentence summary of the role and its purpose",
  "responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3", "responsibility 4", "responsibility 5"],
  "requirements": ["requirement 1", "requirement 2", "requirement 3", "requirement 4", "requirement 5"],
  "skills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
  "salary_min": ${salaryMin || null},
  "salary_max": ${salaryMax || null}
}

Rules:
- responsibilities must be action-oriented and start with a verb
- requirements must be qualifications, experience, or education — include experience years if provided
- skills must be specific tools, technologies, or hard skills only — include all required skills mentioned
- description must be professional, engaging, and reflect the actual role described
- if salary was not provided set salary_min and salary_max to null
- do not include any text outside the JSON object`;

  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("HUGGINGFACE_API_KEY_JD")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            {
              role: "system",
              content: "You are an expert HR professional. Always respond with valid JSON only. Never include markdown, code blocks, or any text outside the JSON object."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HuggingFace error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${content}`);
    }

    if (
      !parsed.description ||
      !Array.isArray(parsed.responsibilities) ||
      !Array.isArray(parsed.requirements) ||
      !Array.isArray(parsed.skills)
    ) {
      throw new Error("AI response missing required fields");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});