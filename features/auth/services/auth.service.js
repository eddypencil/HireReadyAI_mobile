import { supabase } from "../../../shared/services/supabase";

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

export const signUp = async (email, password, userProfile) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userProfile.fullName,
        role: userProfile.role,
      },
    },
  });
  if (error) {
    console.error("[auth.service] signUp error:", error);
    throw error;
  }
  console.error("[auth.service] signUp data.user:", JSON.stringify(data.user));
  return data.user;
};

export const makeProfile = async (userId, userProfile) => {
  console.error("[auth.service] makeProfile inserting for userId:", userId);
  const { error } = await supabase.from("profiles").insert([{
    id: userId,
    full_name: userProfile.fullName,
    role: userProfile.role,
    email: userProfile.email,
  }]);
  if (error) {
    console.error("[auth.service] makeProfile error:", error);
    throw error;
  }
  console.error("[auth.service] makeProfile success");
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const getProfile = async (userId) => {
  console.error("[auth.service] getProfile query for userId:", userId);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth.service] getProfile error:", error);
    throw error;
  }
  console.error("[auth.service] getProfile result:", JSON.stringify(data));
  return data;
};
