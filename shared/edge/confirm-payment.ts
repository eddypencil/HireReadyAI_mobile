import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

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
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const { session_id } = await req.json();
  if (!session_id) {
    return new Response(
      JSON.stringify({ error: "session_id is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "Stripe not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const auth = btoa(`${stripeSecretKey}:`);

  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session_id}`,
      { headers: { Authorization: `Basic ${auth}` } },
    );

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      throw new Error(session.error?.message ?? "Failed to retrieve Stripe session");
    }

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const companyId = session.client_reference_id || session.metadata?.company_id;
    if (!companyId) {
      return new Response(
        JSON.stringify({ error: "No company reference in session" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    console.log("[confirm-payment] companyId from:", session.client_reference_id ? "client_reference_id" : "metadata", "value:", companyId, "userId:", user.id);

    const { data: membership, error: membershipError } = await supabase
      .from("company_memberships")
      .select("id")
      .eq("company_id", companyId)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (membershipError) {
      console.error("[confirm-payment] membership query error:", membershipError);
      return new Response(
        JSON.stringify({ error: "Database error", details: membershipError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!membership) {
      console.error("[confirm-payment] no membership row for companyId:", companyId, "userId:", user.id);
      return new Response(
        JSON.stringify({ error: "Not authorized for this company" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const { error: updateError } = await supabase
      .from("companies")
      .update({
        is_premium: true,
        stripe_customer_id: session.customer,
      })
      .eq("id", companyId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update company", details: updateError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
