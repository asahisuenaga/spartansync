import type { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    authError: string | null;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
    signOutUser: () => Promise<void>;
    updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
    resendEmailConfirmation: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isAllowedEmail = (_email?: string | null) => {
    // TEMPORARY: Allowing all emails for debugging
    return true;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user && !isAllowedEmail(session.user.email)) {
                setAuthError("Spartan Sync is currently restricted to MSU students.");
                supabase.auth.signOut();
                setSession(null);
                setUser(null);
            } else {
                setSession(session);
                setUser(session?.user ?? null);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user && !isAllowedEmail(session.user.email)) {
                setAuthError("Spartan Sync is currently restricted to MSU students.");
                supabase.auth.signOut();
                setSession(null);
                setUser(null);
            } else {
                setSession(session);
                setUser(session?.user ?? null);
                setAuthError(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        setAuthError(null);
        console.log("Attempting sign in for:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Sign in error:", error);
            // Include error code for clearer debugging
            setAuthError(`${error.message} (Code: ${error.status || 'unknown'})`);
            throw error;
        }

        console.log("Sign in successful:", data.user?.id);
    };

    const signUpWithEmail = async (email: string, password: string, fullName: string) => {
        setAuthError(null);
        console.log("Attempting sign up for:", email);

        if (!isAllowedEmail(email)) {
            const error = "Please use your @msu.edu email address.";
            setAuthError(error);
            throw new Error(error);
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            console.error("Sign up error:", error);
            // Include error code for clearer debugging
            setAuthError(`${error.message} (Code: ${error.status || 'unknown'})`);
            throw error;
        }

        console.log("Sign up response:", data);
        if (data.user && data.session === null) {
            console.log("User created but session is null - email verification likely required.");
        }
    };

    const resendEmailConfirmation = async (email: string) => {
        setAuthError(null);
        console.log("Resending confirmation to:", email);
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) {
            console.error("Resend error:", error);
            setAuthError(error.message);
            throw error;
        }
    };

    const signOutUser = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setAuthError(null);
    };

    const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
        setAuthError(null);
        const { error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) {
            setAuthError(error.message);
            throw error;
        }

        if (!user?.id) return;

        // Also update the profiles table
        // @ts-ignore
        const { error: profileError } = await supabase.from("profiles").update({
            display_name: updates.full_name,
            avatar_url: updates.avatar_url,
        }).eq("id", user.id);

        if (profileError) {
            console.error("Error updating profiles table:", profileError);
        }
    };

    const value = useMemo(
        () => ({
            user,
            session,
            loading,
            authError,
            signInWithEmail,
            signUpWithEmail,
            signOutUser,
            updateProfile,
            resendEmailConfirmation,
        }),
        [user, session, loading, authError]
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
