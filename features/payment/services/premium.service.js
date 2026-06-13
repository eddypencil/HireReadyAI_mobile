import { supabase } from "../../../shared/services/supabase";

export const PREMIUM_PRICE_ID =
  "price_1ThAl5J0xQ4cACne1asM9G5V";

export async function createCheckoutSession(companyId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.functions.invoke(
    "create-checkout-session-react-native",
    {
      body: {
        price_id: PREMIUM_PRICE_ID,
        company_id: companyId,
      },
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to create checkout session");
  }

  return data;
}
//not needed cuz webhook
// export async function confirmPayment(sessionId) {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) throw new Error("Not authenticated");

//   const { data, error } = await supabase.functions.invoke(
//     "confirm-payment",
//     {
//       body: {
//         session_id: sessionId,
//       },
//     }
//   );

//   if (error) {
//     throw new Error(error.message || "Payment confirmation failed");
//   }

//   return data;
// }