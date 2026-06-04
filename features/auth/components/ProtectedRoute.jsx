import { Navigate } from "react-router-dom";
import { useUser } from "../context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    if (profile.role === USER_ROLE.applicant) {
      return <Navigate to="/applicant" replace />;
    }
    return <Navigate to="/companies" replace />;
  }

  return children;
}
