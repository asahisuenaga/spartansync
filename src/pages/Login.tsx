import { useState } from "react";
import { useAuth } from "../context/SupabaseAuthContext";
import spartanLogo from "../assets/spartan-logo.png";

const Login = () => {
  const { signInWithEmail, signUpWithEmail, resendEmailConfirmation, authError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setLocalError(null);
    try {
      await resendEmailConfirmation(email);
      alert("Confirmation email resent! Please check your inbox.");
    } catch (err: any) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) throw new Error("Please enter your full name.");
        await signUpWithEmail(email, password, fullName);
        setSignUpSuccess(true);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      // Error is already handled in context for authError, but we catch here to stop loading state
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setLocalError(null);
    setSignUpSuccess(false);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Hero / Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-msu p-12 text-white lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-msu-dark to-transparent"></div>

        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
              <img src={spartanLogo} alt="Spartan Sync" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">Spartan Sync</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg animate-slide-up">
          <h1 className="font-display text-5xl font-bold leading-tight">
            Your Campus, <br />
            <span className="text-emerald-300">Connected.</span>
          </h1>
          <p className="mt-6 text-lg text-emerald-100/90 leading-relaxed">
            Discover events, join study groups, and meet fellow Spartans. Experience university life like never before.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-xs font-medium text-emerald-200/60">
          <span>© 2026 Michigan State University</span>
          <span>•</span>
          <span>Privacy Policy</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12 bg-campus-grey">
        <div className="w-full max-w-md animate-fade-in space-y-8 bg-white p-10 shadow-xl rounded-3xl border border-gray-100">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg border border-slate-100">
              <img src={spartanLogo} alt="Spartan Sync" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-gray-900">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-3 text-gray-500">
              {isSignUp
                ? "Join the community to get started"
                : "Sign in to continue to Spartan Sync"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-msu focus:ring-msu/20 transition-all"
                  placeholder="Sparty"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MSU Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-msu focus:ring-msu/20 transition-all"
                placeholder="netid@msu.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-msu focus:ring-msu/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            {(authError || localError) && (
              <div className="flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-100 animate-slide-down">
                <span className="material-symbols-outlined text-lg">error</span>
                {localError || authError}
              </div>
            )}

            {signUpSuccess && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-100 animate-slide-down">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Signup successful! Please check your MSU email inbox for a verification link before signing in.
                </div>
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResend}
                  className="w-full text-xs font-semibold text-msu hover:text-msu-light underline transition-colors"
                >
                  {resending ? "Resending..." : "Didn't get the email? Resend confirmation link"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-msu px-6 py-4 text-sm font-bold text-white shadow-lg shadow-msu/25 transition-all hover:bg-msu-light hover:shadow-msu/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="space-y-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-semibold text-slate-500 hover:text-msu transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "New to Spartan Sync? Create account"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Secure Access
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-2xl text-gray-300">
            <span className="material-symbols-outlined" title="Secure">lock</span>
            <span className="material-symbols-outlined" title="Verified">verified</span>
            <span className="material-symbols-outlined" title="Private">shield</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
