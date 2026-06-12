import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@18";

const stripe = new Stripe(
  Deno.env.get("STRIPE_SECRET_KEY")!,
  {
    apiVersion: "2025-05-28.basil",
  }
);

serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);

      return new Response(
        JSON.stringify({
          error: "Webhook signature verification failed",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const companyId =
          session.client_reference_id ||
          session.metadata?.company_id;

        if (!companyId) {
          console.error(
            "No company id found in checkout session",
            session.id
          );

          break;
        }

        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SB_SERVICE_KEY")!
        );

        const { error } = await supabase
          .from("companies")
          .update({
            is_premium: true,
            stripe_customer_id: session.customer,
          })
          .eq("id", companyId);

        if (error) {
          console.error(
            "Failed to upgrade company:",
            error
          );

          return new Response(
            JSON.stringify({
              error: error.message,
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        console.log(
          `Company ${companyId} upgraded to premium`
        );

        break;
      }

      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Webhook error:", err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error
          ? err.message
          : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});