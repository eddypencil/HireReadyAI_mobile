import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../../../shared/services/supabase";

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email, password, fullName, role) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        full_name: fullName,
        role: role || "applicant",
        email,
      },
    ]);
    if (profileError) throw profileError;
  }

  return authData;
};

export const signInWithGithub = async () => {
  const redirectUrl = makeRedirectUri({ scheme: "hirereadyai", path: "auth/callback" });
  console.log("OAuth redirect URL:", redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === "success") {
    const fragment = result.url.split("#")[1] || "";
    const params = {};
    fragment.split("&").forEach((pair) => {
      const [key, val] = pair.split("=");
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(val || "");
    });
    if (params.access_token && params.refresh_token) {
      await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
    }
  } else if (result.type === "cancel") {
    throw new Error("GitHub login was cancelled");
  } else {
    throw new Error("GitHub login failed");
  }
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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};
