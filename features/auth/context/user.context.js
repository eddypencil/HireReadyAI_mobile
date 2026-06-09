import { createContext, useContext, useState, useEffect } from "react";
import * as Linking from "expo-linking";
import { supabase } from "../../../shared/services/supabase";
import { getProfile, signOut } from "../services/auth.service";

const UserContext = createContext(null);

async function ensureProfile(user) {
  try {
    return await getProfile(user.id);
  } catch (err) {
    const payload = {
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.user_name ||
        user.user_metadata?.name ||
        "User",
      role: "applicant",
    };
    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.error("Profile upsert failed — likely missing RLS policy:", error);
      return { id: user.id, ...payload };
    }
    return data;
  }
}

function parseHashParams(url) {
  const fragment = url.split("#")[1] || "";
  const params = {};
  fragment.split("&").forEach((pair) => {
    const [key, val] = pair.split("=");
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(val || "");
  });
  return params;
}

async function handleRedirectUrl(url) {
  if (!url || !url.includes("access_token")) return;
  const params = parseHashParams(url);
  if (params.access_token && params.refresh_token) {
    await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
  }
}

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        ensureProfile(session.user)
          .then(setProfile)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleRedirectUrl(url);
    });

    const linkingSubscription = Linking.addEventListener("url", (event) => {
      handleRedirectUrl(event.url);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          ensureProfile(session.user).then(setProfile).catch(() => {});
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
      if (linkingSubscription?.remove) linkingSubscription.remove();
    };
  }, []);

  const signOutUser = async () => {
    await signOut();
    setProfile(null);
    setSession(null);
  };

  return (
    <UserContext.Provider
      value={{ profile, session, user: session?.user, loading, signOutUser, setProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
