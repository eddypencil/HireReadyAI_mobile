import { useState, useEffect, useCallback, useRef } from "react";
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
  const warningTimeout = useRef(null);

  const fetchPipeline = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPipeline(jobId);
      setJob(data);
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

  useEffect(() => {
    return () => {
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
    };
  }, []);

  const showWarning = useCallback((msg) => {
    setWarning(msg);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    warningTimeout.current = setTimeout(() => setWarning(null), 5000);
  }, []);

  const handleAddStage = async (libraryItem) => {
    const unlockedStages = stages.filter((s) => !s.is_locked);
    const maxUnlockedIndex = unlockedStages.length > 0
      ? Math.max(...unlockedStages.map((s) => s.order_index))
      : 10;
    const nextIndex = Math.min(maxUnlockedIndex + 1, 9998);

    const totalWeight = stages.reduce(
      (sum, s) => sum + (parseFloat(s.weight) || 0), 0
    );
    const isFull = totalWeight > 0.901;
    let newWeight = isFull ? 0 : 0.1;

    if (isFull) {
      showWarning("The composite weight can't exceed 100%. Stage added with 0% weight. Please free up weight from other stages to add weight to this one.");
    }

    const stageData = {
      name: libraryItem.label,
      stage_type: libraryItem.key,
      description: libraryItem.subtitle || null,
      order_index: nextIndex,
      weight: newWeight,
      pass_score: null,
      num_questions: 0,
    };

    try {
      const created = await createStage(jobId, stageData);
      setStages((prev) =>
        [...prev, created].sort((a, b) => a.order_index - b.order_index)
      );
    } catch (err) {
      console.error("Failed to add stage:", err);
      setError(err.message);
    }
  };

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

  const handleDeleteStage = async (stageId) => {
    const deleted = stages.find((s) => s.id === stageId);
    const remaining = stages.filter((s) => s.id !== stageId);
    const lockedStages = remaining.filter((s) => s.is_locked);
    const unlockedStages = remaining.filter((s) => !s.is_locked);
    const unlockedWithNewIndex = unlockedStages.map((s, idx) => ({
      ...s,
      order_index: 11 + idx,
    }));
    const finalStages = [...lockedStages, ...unlockedWithNewIndex].sort(
      (a, b) => a.order_index - b.order_index
    );

    setStages(finalStages);

    try {
      await deleteStage(stageId);
      if (unlockedWithNewIndex.length > 0 && !deleted?.is_locked) {
        await reorderStages(unlockedWithNewIndex);
      }
    } catch (err) {
      console.error("Failed to delete stage:", err);
      setError(err.message);
      fetchPipeline();
    }
  };

  const moveStage = useCallback((stageId, direction) => {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === stageId);
      if (idx === -1) return prev;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const stage = prev[idx];
      if (stage.is_locked) return prev;
      const target = prev[targetIdx];
      if (target.is_locked) return prev;

      const reordered = Array.from(prev);
      reordered[idx] = target;
      reordered[targetIdx] = stage;

      const unlockedOnly = reordered.filter((s) => !s.is_locked);
      const lockedOnly = reordered.filter((s) => s.is_locked);
      const withNewIndex = unlockedOnly.map((s, i) => ({
        ...s,
        order_index: 11 + i,
      }));
      const finalStages = [...lockedOnly, ...withNewIndex].sort(
        (a, b) => a.order_index - b.order_index
      );

      (async () => {
        try {
          await reorderStages(withNewIndex);
        } catch (err) {
          console.error("Failed to reorder stages:", err);
          setError(err.message);
          fetchPipeline();
        }
      })();

      return finalStages;
    });
  }, [fetchPipeline]);

  const handleReorderStages = useCallback(async (reorderedList) => {
    const unlockedOnly = reorderedList.filter((s) => !s.is_locked);
    const lockedOnly = stages.filter((s) => s.is_locked);
    const withNewIndex = unlockedOnly.map((s, idx) => ({
      ...s,
      order_index: 11 + idx,
    }));
    const finalStages = [...lockedOnly, ...withNewIndex].sort(
      (a, b) => a.order_index - b.order_index
    );

    setStages(finalStages);

    try {
      await reorderStages(withNewIndex);
    } catch (err) {
      console.error("Failed to reorder stages:", err);
      setError(err.message);
      fetchPipeline();
    }
  }, [stages, fetchPipeline]);

  return {
    job,
    stages,
    loading,
    error,
    warning,
    handleAddStage,
    handleUpdateStage,
    handleDeleteStage,
    moveStage,
    handleReorderStages,
    refetch: fetchPipeline,
  };
};
