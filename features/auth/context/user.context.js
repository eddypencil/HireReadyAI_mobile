import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../shared/services/supabase";
import { getProfile, signUp, signIn, signOut, makeProfile } from "../services/auth.service";

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
    console.error("[user.context] fetchAndSetProfile for userId:", userId);
    try {
      const data = await getProfile(userId);
      console.error("[user.context] fetchAndSetProfile got data:", JSON.stringify(data));
      if (data) {
        setProfile(toProfileModel(data));
      }
    } catch (err) {
      console.error("[user.context] fetchAndSetProfile error:", err);
    }
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
        console.error("[user.context] onAuthStateChange event:", _event, "hasSession:", !!session);
        setSession(session);
        if (session?.user) {
          setLoading(false);
          const meta = session.user.user_metadata || {};
          console.error("[user.context] metadata:", JSON.stringify(meta), "role:", meta.role);
          setProfile({
            id: session.user.id,
            full_name: meta.full_name || null,
            role: meta.role || null,
            email: session.user.email,
          });
          setTimeout(() => fetchAndSetProfile(session.user.id), 0);
        } else {
          console.error("[user.context] onAuthStateChange — no user in session");
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUpUser = async (email, password, userProfile) => {
    console.error("[user.context] signUpUser called", JSON.stringify(userProfile));
    setLoading(true);
    try {
      const registeredUser = await signUp(email, password, userProfile);
      console.error("[user.context] signUpUser registeredUser:", JSON.stringify(registeredUser));
      if (!registeredUser) throw new Error("Sign up returned no user");
      const userId = registeredUser.id;
      console.error("[user.context] signUpUser userId:", userId);
      await makeProfile(userId, userProfile);
      console.error("[user.context] signUpUser profile inserted, now fetching...");
      await fetchAndSetProfile(userId);
      console.error("[user.context] signUpUser complete");
    } catch (err) {
      console.error("[user.context] signUpUser error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInUser = async (email, password) => {
    console.error("[user.context] signInUser called");
    setLoading(true);
    try {
      const loggedInUser = await signIn(email, password);
      console.error("[user.context] signInUser loggedInUser:", JSON.stringify(loggedInUser));
      await fetchAndSetProfile(loggedInUser.id);
    } catch (err) {
      console.error("[user.context] signInUser error:", err);
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
