import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../shared/services/supabase";
import { getProfile, signOut } from "../services/auth.service";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        getProfile(session.user.id)
          .then(setProfile)
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile).catch(() => {});
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
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
