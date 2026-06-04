import { useState, useEffect, useMemo } from "react";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../../auth/context/user.context";
import {
  fetchShortlistForJob,
  castVote as castVoteService,
  rejectApplication as rejectApplicationService,
  advanceToOffer as advanceToOfferService,
  fetchNotesForApplication,
  postNote as postNoteService,
} from "../services/shortlist.service";

export const useShortlistData = (jobs) => {
  const { profile } = useUser();
  const route = useRoute();
  const params = route.params || {};

  const [selectedJobId, setSelectedJobId] = useState("");
  const [shortlistEntries, setShortlistEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [sortMode, setSortMode] = useState("consensus"); // 'consensus' | 'ai_score' | 'name'
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Initialize from URL param or first job
  useEffect(() => {
    if (params.jobId) {
      setSelectedJobId(params.jobId);
    } else if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, params.jobId, selectedJobId]);

  // Fetch shortlist when job changes
  useEffect(() => {
    const loadShortlist = async () => {
      if (!selectedJobId) return;
      setLoading(true);
      setSelectedCandidateId(null);
      try {
        const data = await fetchShortlistForJob(selectedJobId);
        setShortlistEntries(data || []);
        if (data && data.length > 0) {
          setSelectedCandidateId(data[0].applications.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadShortlist();
  }, [selectedJobId]);

  // Fetch notes when selected candidate changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!selectedCandidateId) return;
      setNotesLoading(true);
      try {
        const data = await fetchNotesForApplication(selectedCandidateId);
        setNotes(data);
      } catch {
        setNotes([]);
      } finally {
        setNotesLoading(false);
      }
    };
    loadNotes();
  }, [selectedCandidateId]);

  const selectedJob = jobs?.find((j) => j.id === selectedJobId);

  // Sorted entries
  const sortedEntries = useMemo(() => {
    const entries = [...shortlistEntries];
    if (sortMode === "ai_score") {
      return entries.sort(
        (a, b) =>
          (b.applications.composite_score || 0) -
          (a.applications.composite_score || 0)
      );
    }
    if (sortMode === "name") {
      return entries.sort((a, b) =>
        (a.applications.profiles?.full_name || "").localeCompare(
          b.applications.profiles?.full_name || ""
        )
      );
    }
    // consensus: sort by up votes descending
    return entries.sort((a, b) => {
      const upA = (a.applications.shortlist_votes || []).filter(
        (v) => v.vote === "up"
      ).length;
      const upB = (b.applications.shortlist_votes || []).filter(
        (v) => v.vote === "up"
      ).length;
      return upB - upA;
    });
  }, [shortlistEntries, sortMode]);

  // Aggregate vote summary across all candidates
  const insightsSummary = useMemo(() => {
    let up = 0, neutral = 0, down = 0, awaitingVote = 0;
    shortlistEntries.forEach((entry) => {
      const votes = entry.applications.shortlist_votes || [];
      votes.forEach((v) => {
        if (v.vote === "up") up++;
        else if (v.vote === "neutral") neutral++;
        else if (v.vote === "down") down++;
      });
      if (votes.length === 0) awaitingVote++;
    });
    return { up, neutral, down, awaitingVote, total: shortlistEntries.length };
  }, [shortlistEntries]);

  // Selected candidate entry
  const selectedEntry = useMemo(
    () =>
      shortlistEntries.find(
        (e) => e.applications.id === selectedCandidateId
      ) || null,
    [shortlistEntries, selectedCandidateId]
  );

  // My current vote for selected candidate
  const myVote = useMemo(() => {
    if (!selectedEntry || !profile?.id) return null;
    const myVoteRecord = (selectedEntry.applications.shortlist_votes || []).find(
      (v) => v.voter_id === profile.id
    );
    return myVoteRecord?.vote || null;
  }, [selectedEntry, profile?.id]);

  // Actions
  const castVote = async (applicationId, vote) => {
    if (!profile?.id) return;
    try {
      await castVoteService(applicationId, profile.id, vote);
      // Optimistic update
      setShortlistEntries((prev) =>
        prev.map((entry) => {
          if (entry.applications.id !== applicationId) return entry;
          const existingVotes = (entry.applications.shortlist_votes || []).filter(
            (v) => v.voter_id !== profile.id
          );
          return {
            ...entry,
            applications: {
              ...entry.applications,
              shortlist_votes: [
                ...existingVotes,
                {
                  id: `temp-${Date.now()}`,
                  vote,
                  voter_id: profile.id,
                  profiles: { full_name: profile.full_name, headline: profile.headline, role: profile.role },
                },
              ],
            },
          };
        })
      );
    } catch (err) {
      console.error("Failed to cast vote:", err);
    }
  };

  const rejectApplication = async (applicationId, reason) => {
    try {
      await rejectApplicationService(applicationId, reason);
      setShortlistEntries((prev) =>
        prev.map((entry) =>
          entry.applications.id === applicationId
            ? {
                ...entry,
                applications: {
                  ...entry.applications,
                  is_rejected: true,
                  rejection_reason: reason,
                },
              }
            : entry
        )
      );
    } catch (err) {
      console.error("Failed to reject application:", err);
    }
  };

  const advanceToOffer = async (applicationId, offerStageId) => {
    try {
      await advanceToOfferService(applicationId, offerStageId);
    } catch (err) {
      console.error("Failed to advance to offer:", err);
    }
  };

  const postNote = async (body, visibleToTeam) => {
    if (!selectedCandidateId || !profile?.id) return;
    try {
      const newNote = await postNoteService(
        selectedCandidateId,
        profile.id,
        body,
        visibleToTeam
      );
      setNotes((prev) => [...prev, newNote]);
    } catch (err) {
      console.error("Failed to post note:", err);
    }
  };

  return {
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    sortedEntries,
    loading,
    insightsSummary,
    selectedCandidateId,
    setSelectedCandidateId,
    selectedEntry,
    myVote,
    sortMode,
    setSortMode,
    notes,
    notesLoading,
    castVote,
    rejectApplication,
    advanceToOffer,
    postNote,
  };
};
