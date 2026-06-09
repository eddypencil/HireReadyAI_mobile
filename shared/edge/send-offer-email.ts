import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";
const RESEND_FROM_NAME = Deno.env.get("RESEND_FROM_NAME") ?? "HireReadyAI";

const EMAIL_TEMPLATE = (body: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f4f7fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fc;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,73,124,0.12)">
          <!-- Blue header bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#01497c 0%,#012a4a 100%);padding:32px 40px;text-align:center">
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.3px">HireReadyAI</h1>
              <p style="color:#89c2d9;font-size:14px;margin:8px 0 0 0">Talent Acquisition Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;color:#1a2a3a;font-size:15px;line-height:1.7">
              ${body}
            </td>
          </tr>
          <!-- Blue footer -->
          <tr>
            <td style="background:#f0f5fb;padding:24px 40px;border-top:1px solid #d0e2f2">
              <p style="color:#5a7a9a;font-size:12px;margin:0;text-align:center">
                Powered by <strong style="color:#01497c">HireReadyAI</strong> · Automated Talent Matching
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { to, fromName, fromEmail, subject, body, applicationId, jobId, action } = await req.json();

  if (!to || !fromEmail || !subject || !body || !applicationId || !jobId || !action) {
    return new Response(
      JSON.stringify({ error: "to, fromEmail, subject, body, applicationId, jobId, and action are required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  try {
    const htmlBody = EMAIL_TEMPLATE(body);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
        reply_to: `${fromName} <${fromEmail}>`,
        to: [to],
        subject,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error (${res.status}): ${err}`);
    }

    const emailResult = await res.json();

    if (action === "offer") {
      const { data: offerStage, error: stageErr } = await supabase
        .from("recruitment_stages")
        .select("id")
        .eq("stage_type", "offer")
        .eq("job_id", jobId)
        .maybeSingle();

      if (stageErr) throw new Error(`Failed to find offer stage: ${stageErr.message}`);

      if (offerStage) {
        const { error: updateErr } = await supabase
          .from("applications")
          .update({ current_stage_id: offerStage.id })
          .eq("id", applicationId);

        if (updateErr) throw new Error(`Failed to update application: ${updateErr.message}`);

        const { error: upsertErr } = await supabase
          .from("application_stages")
          .upsert(
            {
              application_id: applicationId,
              stage_id: offerStage.id,
              status: "in_progress",
              started_at: new Date().toISOString(),
            },
            { onConflict: "application_id,stage_id" }
          );

        if (upsertErr) throw new Error(`Failed to upsert stage: ${upsertErr.message}`);
      }
    } else if (action === "reject") {
      const { error: rejectErr } = await supabase
        .from("applications")
        .update({ is_rejected: true })
        .eq("id", applicationId);

      if (rejectErr) throw new Error(`Failed to reject: ${rejectErr.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, id: emailResult.id }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
