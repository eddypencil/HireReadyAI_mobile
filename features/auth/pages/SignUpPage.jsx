import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";
import AuthLayout from "../components/AuthLayout";
import FormField from "@/shared/ui/FormField";
import RoleToggle from "../components/RoleToggle";
import SocialButton from "../components/SocialButton";

export default function SignUpPage() {
  const { signUpUser, loading, profile } = useUser();
  const navigate = useNavigate();

  const [role, setRole] = useState(USER_ROLE.applicant);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadLine] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === USER_ROLE.recruiter) {
        navigate("/companies");
      } else {
        navigate("/applicant");
      }
    }
  }, [profile, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await signUpUser(email, password, {
        fullName,
        role,
        phone,
        headline,
        isActive: true,
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthLayout
      headline="Create account"
      subheading="Fill in your details to get started"
    >
      <RoleToggle value={role} onChange={setRole} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <FormField
          label="Current title"
          type="text"
          placeholder="ex.HR Manager, Frontend Developer..."
          value={headline}
          onChange={(e) => setHeadLine(e.target.value)}
          required
        />

        <FormField
          label="Email"
          type="email"
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormField
          label="Phone (optional)"
          type="tel"
          placeholder="+20 10 0000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <FormField
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <FormField
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200">
            <span>⚠</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-11 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer bg-dark-amethyst-600
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-dark-amethyst-700"}`}
          style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-dark-amethyst-200" />
        <span className="text-xs text-dark-amethyst-300">or</span>
        <span className="flex-1 h-px bg-dark-amethyst-200" />
      </div>

      <SocialButton provider="google" />

      <p className="text-center text-xs text-dark-amethyst-400 mt-6">
        Already have an account?{" "}
        <Link
          to="/auth/sign-in"
          className="text-dark-amethyst-600 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
