import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../../../shared/services/supabase";
import { getProfile, signUp, signIn, signOut, makeProfile, signInWithGoogle } from "../services/auth.service";
import { USER_ROLE } from "../../../shared/constants/enums";
import { registerAndSavePushToken } from "../../../shared/services/notifications.service";

const UserContext = createContext(null);

const toProfileModel = (data) => {
  if (!data) return null;
  return {
    ...data,
  };
};

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const pendingRoleSelectionRef = useRef(false);
  const profileChannelRef = useRef(null);

  const fetchAndSetProfile = async (userId) => {
    try {
      const data = await getProfile(userId);
      if (data) {
        setProfile(toProfileModel(data));
        setNeedsRoleSelection(false);
        registerAndSavePushToken(userId);
        return;
      }
    } catch {}
    if (userId) setNeedsRoleSelection(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchAndSetProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          setLoading(false);
          if (pendingRoleSelectionRef.current) return;
          if (event === 'INITIAL_SESSION') {
            setTimeout(() => fetchAndSetProfile(session.user.id), 0);
            return;
          }
          const meta = session.user.user_metadata || {};
          setProfile({
            id: session.user.id,
            full_name: meta.full_name || null,
            role: meta.role || USER_ROLE.applicant,
            email: session.user.email,
          });
          setTimeout(() => fetchAndSetProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (profileChannelRef.current) supabase.removeChannel(profileChannelRef.current);
    profileChannelRef.current = supabase
      .channel(`profile-changes-${session.user.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${session.user.id}`,
      }, (payload) => {
        setProfile(toProfileModel(payload.new));
      })
      .subscribe();
    return () => {
      if (profileChannelRef.current) {
        supabase.removeChannel(profileChannelRef.current);
        profileChannelRef.current = null;
      }
    };
  }, [session?.user?.id]);

  const signUpUser = async (email, password, userProfile) => {
    setLoading(true);
    try {
      const registeredUser = await signUp(email, password, userProfile);
      if (!registeredUser) throw new Error("Sign up returned no user");
      const userId = registeredUser.id;
      try {
        await makeProfile(userId, userProfile);
      } catch {}
      await fetchAndSetProfile(userId);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const loggedInUser = await signIn(email, password);
      const existing = await getProfile(loggedInUser.id);
      if (!existing) {
        const meta = loggedInUser.user_metadata || {};
        try {
          await makeProfile(loggedInUser.id, {
            fullName: meta.full_name || loggedInUser.email?.split("@")[0] || "User",
            role: meta.role || USER_ROLE.applicant,
            phone: meta.phone || "",
            headline: meta.headline || "",
            isActive: true,
          });
        } catch {}
      }
      await fetchAndSetProfile(loggedInUser.id);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    if (session?.user?.id) {
      await supabase.from("profiles").update({ expo_push_token: null }).eq("id", session.user.id);
    }
    await signOut();
    setProfile(null);
    setSession(null);
  };

  const signInWithGoogleUser = async () => {
    pendingRoleSelectionRef.current = true;
    const user = await signInWithGoogle();
    const existing = await getProfile(user.id);
    if (existing) {
      pendingRoleSelectionRef.current = false;
      await fetchAndSetProfile(user.id);
      return;
    }
    setNeedsRoleSelection(true);
  };

  const completeRoleSelection = async (userId) => {
    pendingRoleSelectionRef.current = false;
    await fetchAndSetProfile(userId);
  };

  return (
    <UserContext.Provider
      value={{ profile, session, user: session?.user, loading, needsRoleSelection, signUpUser, signInUser, signOutUser, signInWithGoogleUser, completeRoleSelection, setProfile }}
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
