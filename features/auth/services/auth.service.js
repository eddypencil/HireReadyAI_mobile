import { supabase } from "../../../shared/services/supabase";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  console.log('[GoogleSignIn] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:', clientId);
  GoogleSignin.configure({
    webClientId: clientId,
  });
};

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  console.log('[GoogleSignIn] hasPlayServices OK');
  const googleUser = await GoogleSignin.signIn();
  console.log('[GoogleSignIn] signIn response:', JSON.stringify(googleUser, null, 2));
  const idToken =
    googleUser?.idToken ||
    googleUser?.data?.idToken ||
    googleUser?.user?.idToken;
  if (!idToken) throw new Error('No idToken returned from Google');
  console.log('[GoogleSignIn] idToken found, signing in to Supabase...');
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data.user;
};

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
  if (error) throw error;
  return data.user;
};

export const makeProfile = async (userId, userProfile) => {
  const { error } = await supabase.from("profiles").insert([{
    id: userId,
    full_name: userProfile.fullName,
    role: userProfile.role,
    phone: userProfile.phone || null,
    is_active: userProfile.isActive ?? true,
  }]);
  if (error) throw error;
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
    .maybeSingle();
  if (error) throw error;
  return data;
};