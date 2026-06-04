import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";
import {
  Briefcase,
  Building2,
  Menu,
  X,
  FileCheck,
  LogOut,
  LayoutDashboard,
  CheckCircle,
  Wand2,
  GitBranch,
} from "lucide-react";

export default function MainLayout() {
  const { profile, signOutUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isApplicant = profile?.role === USER_ROLE.applicant;

  const links = isApplicant
    ? [
        { to: "/jobs", label: "Explore Jobs", icon: Briefcase },
        { to: "/applicant", label: "My Applications", icon: FileCheck },
      ]
    : [
        {
          to: "/companies/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        { to: "/companies/profile", label: "Company Profile", icon: Building2 },
        { to: "/companies/jobs", label: "Job Postings", icon: Briefcase },
        { to: "/companies/shortlists", label: "Shortlists", icon: CheckCircle },
        { to: "/companies/jd-generator", label: "JD Generator", icon: Wand2 },
      ];

  const isActive = (path) => {
    if (path === "/companies/profile" && location.pathname === "/companies") {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans relative overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-amethyst-950 text-white flex flex-col p-4 shrink-0
        transform transition-transform duration-200 ease-in-out md:relative md:transform-none md:flex
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xl font-bold tracking-tight bg-linear-to-r from-mauve-magic-300 to-dark-amethyst-200 bg-clip-text text-transparent">
                HireReadyAI
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg md:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/15 text-white font-semibold"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${active ? "text-white" : "text-mauve-magic-300"}`}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-3 py-2 border-t border-white/10 mt-auto">
            <button
              onClick={signOutUser}
              className="w-full flex items-center gap-3 text-sm font-medium text-red-400 hover:text-red-300 transition-colors py-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="md:hidden flex items-center bg-white border-b border-gray-100 p-4 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-200 bg-gray-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-sm font-bold text-dark-amethyst-950">
            {isApplicant ? "Applicant Dashboard" : "Recruiter Dashboard"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
