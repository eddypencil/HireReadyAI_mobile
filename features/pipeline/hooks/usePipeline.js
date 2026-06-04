import { useState, useEffect, useCallback } from "react";
import {
  getPipeline,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from "../services/pipeline.service";

export const usePipeline = (jobId) => {
  const [job, setJob] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const fetchPipeline = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPipeline(jobId);
      setJob(data);
      // Sort stages by order_index on load
      const sorted = (data.recruitment_stages || []).sort(
        (a, b) => a.order_index - b.order_index
      );
      setStages(sorted);
    } catch (err) {
      console.error("Failed to load pipeline:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  // Add a stage from the library — optimistic local update then persist
  const handleAddStage = async (libraryItem) => {
    const nextIndex = stages.length; // 0-based order_index

    const totalWeight = stages.reduce(
      (sum, s) => sum + (parseFloat(s.weight) || 0),
      0
    );
    // Use an epsilon for floating point comparison issues (e.g. 0.9000000000000001)
    const isFull = totalWeight > 0.901; 
    let newWeight = isFull ? 0 : 0.10;

    if (isFull) {
      setWarning("The composite weight can't exceed 100%. Stage added with 0% weight. Please free up weight from other stages to add weight to this one.");
      setTimeout(() => setWarning(null), 5000);
    }

    const stageData = {
      name: libraryItem.label,
      stage_type: libraryItem.key,
      description: libraryItem.subtitle || null,
      order_index: nextIndex,
      weight: newWeight,
      pass_score: null,
    };

    try {
      const created = await createStage(jobId, stageData);
      setStages((prev) => [...prev, created]);
    } catch (err) {
      console.error("Failed to add stage:", err);
      setError(err.message);
    }
  };

  // Update a stage's fields and sync local state
  const handleUpdateStage = async (stageId, updates) => {
    try {
      const updated = await updateStage(stageId, updates);
      setStages((prev) =>
        prev.map((s) => (s.id === stageId ? { ...s, ...updated } : s))
      );
    } catch (err) {
      console.error("Failed to update stage:", err);
      setError(err.message);
    }
  };

  // Delete a stage, recompute order_index for remaining, persist via two-phase upsert (Fix 2)
  const handleDeleteStage = async (stageId) => {
    const remaining = stages
      .filter((s) => s.id !== stageId)
      .map((s, idx) => ({ ...s, order_index: idx }));

    // Optimistic update
    setStages(remaining);

    try {
      await deleteStage(stageId);
      if (remaining.length > 0) {
        await reorderStages(remaining);
      }
    } catch (err) {
      console.error("Failed to delete stage:", err);
      setError(err.message);
      // Revert on failure
      fetchPipeline();
    }
  };

  // Reorder stages after drag-and-drop, persist with two-phase upsert (Fix 1)
  const handleReorderStages = async (reorderedList) => {
    const withNewIndex = reorderedList.map((s, idx) => ({
      ...s,
      order_index: idx,
    }));

    // Optimistic update
    setStages(withNewIndex);

    try {
      await reorderStages(withNewIndex);
    } catch (err) {
      console.error("Failed to reorder stages:", err);
      setError(err.message);
      // Revert on failure
      fetchPipeline();
    }
  };

  return {
    job,
    stages,
    loading,
    error,
    warning,
    handleAddStage,
    handleUpdateStage,
    handleDeleteStage,
    handleReorderStages,
    refetch: fetchPipeline,
  };
};
