import { supabase } from "@/shared/services/supabase";

const EDGE_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export const PREMIUM_PRICE_ID = "price_1ThAl5J0xQ4cACne1asM9G5V";

export async function createCheckoutSession(companyId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(`${EDGE_FUNCTIONS_URL}/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ price_id: PREMIUM_PRICE_ID, company_id: companyId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create checkout session");
  return data;
}

export async function confirmPayment(sessionId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(`${EDGE_FUNCTIONS_URL}/confirm-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ session_id: sessionId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment confirmation failed");
  return data;
}
