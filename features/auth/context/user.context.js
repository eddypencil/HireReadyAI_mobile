import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../shared/services/supabase";
import { getProfile, signUp, signIn, signOut, makeProfile } from "../services/auth.service";
import { USER_ROLE } from "../../../shared/constants/enums";

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

  const fetchAndSetProfile = async (userId) => {
    try {
      const data = await getProfile(userId);
      if (data) {
        setProfile(toProfileModel(data));
      }
    } catch {}
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
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          setLoading(false);
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
    await signOut();
    setProfile(null);
    setSession(null);
  };

  return (
    <UserContext.Provider
      value={{ profile, session, user: session?.user, loading, signUpUser, signInUser, signOutUser, setProfile }}
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
