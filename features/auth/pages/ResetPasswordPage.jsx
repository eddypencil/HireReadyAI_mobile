import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/user.context";
import { supabase } from "@/shared/services/supabase";
import AuthLayout from "../components/AuthLayout";
import FormField from "@/shared/ui/FormField";

export default function ResetPasswordPage() {
  const { updateUserPassword, signOutUser, loading } = useUser();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState("waiting");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // If we're still waiting after 4 s with no event the link is bad/expired
      setPageState((current) => {
        if (current === "waiting") return "invalid";
        return current;
      });
    }, 4000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        clearTimeout(timeout);
        setPageState("ready");
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Auto-redirect to sign-in after success
  useEffect(() => {
    if (pageState !== "success") return;
    const timer = setTimeout(() => {
      navigate("/auth/sign-in", { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [pageState, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords don't match. Please try again.");
      return;
    }

    try {
      await updateUserPassword(newPassword);
      await signOutUser();
      setPageState("success");
    } catch (err) {
      setApiError(err.message || "Failed to update password. Please try again.");
    }
  };

  if (pageState === "waiting") {
    return (
      <AuthLayout
        headline="Verifying your link…"
        subheading="Please wait while we confirm your reset link"
      >
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="w-12 h-12 rounded-full border-2 border-dark-amethyst-200 border-t-dark-amethyst-600 animate-spin" />
          <p className="text-dark-amethyst-400 text-sm text-center">
            This only takes a moment.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (pageState === "invalid") {
    return (
      <AuthLayout
        headline="Link expired"
        subheading="This password reset link is invalid or has expired"
      >
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 border border-red-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-dark-amethyst-700 text-sm leading-7">
            Reset links expire after a short time and can only be used once.
            Request a new one below.
          </p>
          <Link
            to="/auth/forgot-password"
            className="w-full h-11 rounded-xl text-white text-sm font-semibold bg-dark-amethyst-600 hover:bg-dark-amethyst-700 transition-colors flex items-center justify-center"
            style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
          >
            Request a new link
          </Link>
          <Link
            to="/auth/sign-in"
            className="text-xs text-dark-amethyst-400 hover:text-dark-amethyst-600 hover:underline transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (pageState === "success") {
    return (
      <AuthLayout
        headline="Password updated!"
        subheading="You can now sign in with your new password"
      >
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-dark-amethyst-100 border border-dark-amethyst-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="#8400ff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-dark-amethyst-700 text-sm leading-7">
            Your password has been changed successfully. Redirecting you to
            sign in…
          </p>
          <Link
            to="/auth/sign-in"
            className="w-full h-11 rounded-xl text-white text-sm font-semibold bg-dark-amethyst-600 hover:bg-dark-amethyst-700 transition-colors flex items-center justify-center"
            style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
          >
            Go to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      headline="Set a new password"
      subheading="Choose a strong password for your account"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="New Password"
          type="password"
          placeholder="Min 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <FormField
          label="Confirm Password"
          type="password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {(validationError || apiError) && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200">
            <span>⚠</span>
            {validationError || apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer bg-dark-amethyst-600 hover:bg-dark-amethyst-700 disabled:opacity-60"
          style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
        >
          {loading ? "Updating…" : "Update Password"}
        </button>

        <Link
          to="/auth/sign-in"
          className="text-center text-xs text-dark-amethyst-400 hover:text-dark-amethyst-600 hover:underline transition-colors"
        >
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
