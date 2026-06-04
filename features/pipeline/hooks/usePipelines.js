import { useState, useEffect, useCallback } from "react";
import { getPipelines } from "../services/pipeline.service";

export const usePipelines = (companyId) => {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPipelines = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPipelines(companyId);
      setPipelines(data);
    } catch (err) {
      console.error("Failed to load pipelines:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  return { pipelines, loading, error, refetch: fetchPipelines };
};
