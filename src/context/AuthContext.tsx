import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import type { User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth } from "../lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const isAllowedEmail = (email?: string | null) => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  return lowerEmail.endsWith("@msu.edu") || lowerEmail.endsWith(".msu.edu");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (nextUser && !isAllowedEmail(nextUser.email)) {
          setUser(null);
          setAuthError(
            "Spartan Sync is currently restricted to MSU students."
          );
          void signOut(auth);
          setLoading(false);
          return;
        }
        setUser(nextUser);
        setAuthError(null);
        setLoading(false);
      },
      (error) => {
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogleHandler = async () => {
    setAuthError(null);

    // Sign out first to ensure clean slate
    if (auth.currentUser) {
      await signOut(auth);
      setUser(null);
    }

    const provider = new GoogleAuthProvider();
    // Force account selection
    provider.setCustomParameters({
      prompt: "select_account"
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Signed in as:", result.user.email);

      if (!isAllowedEmail(result.user.email)) {
        setAuthError("Spartan Sync is currently restricted to MSU students.");
        await signOut(auth);
        setUser(null);
        return;
      }
      setAuthError(null);
    } catch (error) {
      console.error("Auth error:", error);
      const code = (error as { code?: string })?.code ?? "auth/unknown";
      if (code === "auth/popup-closed-by-user") {
        return;
      }
      setAuthError(code);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    setAuthError(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      signInWithGoogle: signInWithGoogleHandler,
      signOutUser,
    }),
    [user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
