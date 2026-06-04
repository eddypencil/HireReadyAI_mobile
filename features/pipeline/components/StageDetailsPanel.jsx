import React, { useState, useEffect, useRef } from "react";
import { STAGE_TYPE_OPTIONS } from "../constants/stageLibrary";

const DEBOUNCE_MS = 400;

export default function StageDetailsPanel({ stage, stages, onUpdate }) {
  const [form, setForm] = useState({
    name: "",
    stage_type: "",
    weight: 1,
    description: "",
  });

  // Sync local form state when selected stage changes
  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name || "",
        stage_type: stage.stage_type || "",
        weight: stage.weight ?? 1,
        description: stage.description || "",
      });
    }
  }, [stage?.id]);

  // Debounce ref for the weight slider (Fix 3)
  const weightDebounceRef = useRef(null);

  if (!stage) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
          <span className="text-gray-400 text-lg">⚙</span>
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">Stage Settings</p>
        <p className="text-xs text-gray-400">
          Select a stage from the canvas to configure it.
        </p>
      </div>
    );
  }

  const handleImmediateChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onUpdate(stage.id, { ...updated });
  };

  const handleWeightChange = (value) => {
    const numVal = parseFloat(value);
    setForm((prev) => ({ ...prev, weight: numVal }));

    // Debounce the Supabase call for weight slider (Fix 3)
    if (weightDebounceRef.current) clearTimeout(weightDebounceRef.current);
    weightDebounceRef.current = setTimeout(() => {
      onUpdate(stage.id, { ...form, weight: numVal });
    }, DEBOUNCE_MS);
  };

  const weightPct = Math.round((form.weight ?? 0) * 100);

  // Calculate maximum allowed weight for this stage based on other stages
  const totalOtherWeights = (stages || [])
    .filter((s) => s.id !== stage.id)
    .reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);
  
  // Use a tiny epsilon offset because of floating point math (e.g. 0.8 + 0.2000000000000001)
  const maxAllowedWeight = Math.max(0, Math.round((1 - totalOtherWeights) * 100) / 100);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <p className="text-[10px] font-semibold text-dark-amethyst-600 tracking-widest uppercase mb-0.5">
          Stage Settings
        </p>
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
          {form.name || "Untitled Stage"}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {form.stage_type?.replace(/_/g, " ")}
        </p>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Stage Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Stage Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleImmediateChange("name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Stage Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Stage Type
          </label>
          <select
            value={form.stage_type}
            onChange={(e) => handleImmediateChange("stage_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow bg-white cursor-pointer"
          >
            <option value="">Select type…</option>
            {STAGE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Weight — debounced (Fix 3) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Weight
            </label>
            <span className="text-xs font-bold text-dark-amethyst-600">
              {weightPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={maxAllowedWeight}
            step="0.01"
            value={form.weight ?? 0}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full h-1.5 accent-dark-amethyst-600 cursor-pointer"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => handleImmediateChange("description", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow resize-none"
            placeholder="Describe what happens in this stage…"
          />
        </div>

        {/* Out-of-scope fields — rendered disabled as placeholders */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
            Advanced (Coming Soon)
          </p>
          {["AI Evaluation", "Manual Review Required", "Auto Advance", "Auto Reject"].map(
            (label) => (
              <div
                key={label}
                className="flex items-center justify-between opacity-40 cursor-not-allowed"
              >
                <span className="text-xs text-gray-500">{label}</span>
                <div className="w-8 h-4 bg-gray-200 rounded-full" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
