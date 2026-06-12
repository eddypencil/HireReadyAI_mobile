// shared/hooks/useRealtime.js
//
// Centralized Supabase Realtime subscriptions.
//
// Usage:
//   const { newApplicationsCount, clearNewApplications } = useRealtimeRecruiter(companyId);
//   const { stageUpdates, clearStageUpdates } = useRealtimeApplicant(userId);
//
// Each hook subscribes when the component mounts and cleans up on unmount.
// No Redux or global state needed — subscriptions are local to the consumer.

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../services/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITER — subscribes to:
//   • applications (new rows for company's jobs)          → badge count
//   • application_stages (status changes)                 → pipeline refresh signal
//   • shortlist_entries (new shortlisted candidates)      → shortlist badge
//   • shortlist_votes (team votes)                        → vote refresh signal
//   • job_postings (new jobs posted for the company)      → jobs refresh signal
// ─────────────────────────────────────────────────────────────────────────────
export function useRealtimeRecruiter(companyId) {
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [newShortlistCount, setNewShortlistCount] = useState(0);
  const [pipelineRefreshKey, setPipelineRefreshKey] = useState(0);
  const [votesRefreshKey, setVotesRefreshKey] = useState(0);
  const [jobsRefreshKey, setJobsRefreshKey] = useState(0);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!companyId) return;

    // Unsubscribe from any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`recruiter-realtime-${companyId}-${Date.now()}`)

      // Application submitted, updated, or deleted → refresh recruiter pipeline
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
        },
        (payload) => {
          console.log("[Realtime] Application change for recruiter:", payload.eventType, payload.new?.id || payload.old?.id);
          setPipelineRefreshKey((k) => k + 1);

          if (payload.eventType === "INSERT") {
            // Optimistically increment badge for new application
            setNewApplicationsCount((prev) => prev + 1);
          }
        }
      )

      // New shortlist entry → badge
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shortlist_entries",
        },
        (payload) => {
          console.log("[Realtime] New shortlist entry:", payload.new?.id);
          setNewShortlistCount((prev) => prev + 1);
        }
      )

      // Shortlist vote added/changed → refresh votes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shortlist_votes",
        },
        () => {
          console.log("[Realtime] Shortlist votes updated");
          setVotesRefreshKey((k) => k + 1);
        }
      )

      // New job posting → refresh jobs list
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_postings",
        },
        () => {
          console.log("[Realtime] Job postings updated");
          setJobsRefreshKey((k) => k + 1);
        }
      )

      .subscribe((status) => {
        console.log(`[Realtime] Recruiter channel status: ${status}`);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [companyId]);

  const clearNewApplications = useCallback(() => setNewApplicationsCount(0), []);
  const clearNewShortlist = useCallback(() => setNewShortlistCount(0), []);

  return {
    newApplicationsCount,
    newShortlistCount,
    pipelineRefreshKey,
    votesRefreshKey,
    jobsRefreshKey,
    clearNewApplications,
    clearNewShortlist,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICANT — subscribes to:
//   • applications (own rows updated)             → status/stage change banner
//   • application_stages (own stages updated)     → stage progress change
//   • job_postings (new jobs inserted)            → new job available badge
// ─────────────────────────────────────────────────────────────────────────────
export function useRealtimeApplicant(userId) {
  const [stageUpdates, setStageUpdates] = useState([]); // { applicationId, message, timestamp }
  const [applicationsRefreshKey, setApplicationsRefreshKey] = useState(0);
  const [newJobsCount, setNewJobsCount] = useState(0);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`applicant-realtime-${userId}-${Date.now()}`)

      // Own application row changed (updated, deleted, etc.)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `candidate_profile_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] Application change for applicant:", payload.eventType, payload.new?.id || payload.old?.id);
          // Trigger a re-fetch of all applications
          setApplicationsRefreshKey((k) => k + 1);

          // Show an in-app banner for the stage change (only on UPDATE)
          if (
            payload.eventType === "UPDATE" &&
            payload.new?.current_stage_id !== payload.old?.current_stage_id
          ) {
            setStageUpdates((prev) => [
              {
                applicationId: payload.new?.id,
                jobId: payload.new?.job_id,
                message: "Your application status has been updated.",
                timestamp: Date.now(),
              },
              ...prev.filter((u) => u.applicationId !== payload.new?.id).slice(0, 4), // keep max 5 updates, deduplicated
            ]);
          }
        }
      )

      // application_stages row updated (score arrived, status changed)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "application_stages",
        },
        (payload) => {
          console.log("[Realtime] Application stage updated:", payload.new?.id);
          setApplicationsRefreshKey((k) => k + 1);
        }
      )

      // New job posting → show badge on jobs tab
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_postings",
        },
        (payload) => {
          console.log("[Realtime] New job posted:", payload.new?.id);
          setNewJobsCount((prev) => prev + 1);
        }
      )

      .subscribe((status) => {
        console.log(`[Realtime] Applicant channel status: ${status}`);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);

  const clearStageUpdates = useCallback(() => setStageUpdates([]), []);
  const dismissStageUpdate = useCallback(
    (applicationId) =>
      setStageUpdates((prev) => prev.filter((u) => u.applicationId !== applicationId)),
    []
  );
  const clearNewJobs = useCallback(() => setNewJobsCount(0), []);

  return {
    stageUpdates,
    applicationsRefreshKey,
    newJobsCount,
    clearStageUpdates,
    dismissStageUpdate,
    clearNewJobs,
  };
}
