import { USER_ROLE } from "../../../shared/constants/enums";
import { supabase } from "../../../shared/services/supabase";

// Add a membership
export const addMembership = async (membershipData) => {
  const { data, error } = await supabase
    .from("company_memberships")
    .insert([membershipData])
    .select(`
      *,
      profiles(*)
    `)
    .single();
  if (error) throw error;
  return data;
};

// Remove a membership
export const removeMembership = async (membershipId) => {
  const { error } = await supabase
    .from("company_memberships")
    .delete()
    .eq("id", membershipId);
  if (error) throw error;
};
