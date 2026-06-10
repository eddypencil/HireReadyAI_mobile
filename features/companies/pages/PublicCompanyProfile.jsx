import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, MapPin, Calendar, Users, Globe, ExternalLink,
  Briefcase, ArrowLeft,
} from "lucide-react";
import { fetchCompanyById, fetchJobsByCompanyId } from "../services/companies.service";
import LoadingSpinner from "../../shared/ui/LoadingSpinner";

export default function PublicCompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const companyData = await fetchCompanyById(id);
        if (!companyData) {
          setError("Company not found");
          return;
        }
        setCompany(companyData);
        const jobsData = await fetchJobsByCompanyId(id);
        setJobs(jobsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading company..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 font-sans">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 max-w-md text-center shadow-xs">
          <p className="text-sm font-semibold mb-1">Error</p>
          <p className="text-xs opacity-90 leading-relaxed font-mono">{error}</p>
        </div>
        <Link to="/" className="mt-4 text-xs text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="relative h-48 sm:h-64">
        {company.cover_url ? (
          <img
            src={company.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
        )}

        <Link
          to="/jobs"
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-black/30 backdrop-blur-sm rounded-md hover:bg-black/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Jobs
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border/60 shadow-xs bg-white">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {company.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {company.name}
                </h1>
                {company.industry && (
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {company.industry}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-background rounded-xl border border-border/60 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Company Details
              </h3>
              {company.location && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0 text-primary/60" />
                  <span>{company.location}</span>
                </div>
              )}
              {company.size && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0 text-primary/60" />
                  <span>{company.size.toLocaleString()} employees</span>
                </div>
              )}
              {company.founding_date && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 shrink-0 text-primary/60" />
                  <span>Founded {company.founding_date}</span>
                </div>
              )}
            </div>

            <div className="bg-background rounded-xl border border-border/60 p-4 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Links
              </h3>
              {company.website_url && (
                <a
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-primary hover:underline"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {company.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </span>
                  <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-primary hover:underline"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="truncate">LinkedIn</span>
                  <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                </a>
              )}
              {company.twitter_url && (
                <a
                  href={company.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-primary hover:underline"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="truncate">Twitter</span>
                  <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-5 lg:col-span-2">
            {company.description && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background rounded-xl border border-border/60 p-5 shadow-xs"
              >
                <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary/60" />
                  About
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {company.description}
                </p>
              </motion.div>
            )}

            {company.culture && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-background rounded-xl border border-border/60 p-5 shadow-xs"
              >
                <h2 className="text-sm font-bold text-foreground mb-2">
                  Culture
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {company.culture}
                </p>
              </motion.div>
            )}

            {company.benefits && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-background rounded-xl border border-border/60 p-5 shadow-xs"
              >
                <h2 className="text-sm font-bold text-foreground mb-2">
                  Benefits
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {company.benefits}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary/60" />
                Open Positions ({jobs.length})
              </h2>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No open positions at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-background rounded-xl border border-border/60 p-4 shadow-xs">
                      <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.seniority_level || "Any"} &middot; {job.work_location || "Any"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
