import React from "react";
import { GripVertical, Trash2 } from "lucide-react";

export default function StageCard({
  stage,
  isSelected,
  onSelect,
  onDelete,
  provided,
  snapshot,
}) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={provided.draggableProps.style}
      onClick={() => onSelect(stage)}
      className={`group relative flex items-center gap-3 rounded-xl border px-4 py-4 cursor-pointer transition-colors duration-150 select-none ${
        isSelected
          ? "border-dark-amethyst-500 bg-dark-amethyst-50/60 shadow-sm ring-1 ring-dark-amethyst-400"
          : snapshot.isDragging
            ? "border-dark-amethyst-300 bg-white shadow-lg"
            : "border-gray-200 bg-white hover:border-dark-amethyst-300 hover:shadow-sm"
      }`}
    >
      {/* Drag Handle */}
      <div
        {...provided.dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        className="text-gray-300 hover:text-gray-500 shrink-0 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Stage Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight truncate ${
            isSelected ? "text-dark-amethyst-900" : "text-gray-900"
          }`}
        >
          {stage.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {stage.stage_type?.replace(/_/g, " ")}
        </p>
      </div>

      {/* Weight badge */}
      {stage.weight != null && (
        <span className="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 shrink-0">
          {Math.round(stage.weight * 100)}% wt
        </span>
      )}

      {/* Delete button — visible on hover or when selected */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(stage.id);
        }}
        className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        title="Delete stage"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
